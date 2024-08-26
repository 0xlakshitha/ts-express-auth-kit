import Controller from "@/interfaces/controller.interface";
import { NextFunction, Request, Response, Router } from "express";
import AuthService from "./auth.service";
import { SignUpDto } from "./auth.dto";
import { BadRequestException, ForbiddenException, NotFoundException } from "@/utils/exceptions";
import ErrorCodes from "@/config/error.codes";
import withErrorHandling from "@/utils/error.handling";
import * as argon from "argon2"
import validationMiddleware from "@/middleware/validation.middleware";
import { emailVerificationValidation, signUpValidation, singInValidation } from "./auth.validation";
import { authenticator } from "otplib";
import { env } from "@/config/env";
import { compileTemplate } from "@/utils/hbs";
import { sendMail } from "@/utils/mailer";
import { createToken } from "@/utils/jwt";
import { authenticate } from "@/middleware/authenticate.middleware";
import { sendResponse } from "@/utils/response";

authenticator.options = {
    digits: 6,
    step: env.OTP_EXPIRY
}

class AuthController implements Controller {
    public path: string = "/auth";
    public router = Router();
    private authService: AuthService = new AuthService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}/signup`,
            validationMiddleware(signUpValidation),
            this.signUp
        );
        this.router.post(
            `${this.path}/signin`,
            validationMiddleware(singInValidation),
            this.signIn
        )
        this.router.get(
            `${this.path}/me`,
            authenticate(),
            this.getMe
        )
        this.router.post(
            `${this.path}/resend-verification-email`,
            authenticate(),
            this.resendVerificationEmail
        )
        this.router.post(
            `${this.path}/verify-email`,
            authenticate(),
            validationMiddleware(emailVerificationValidation),
            this.verifyEmail
        )
    }

    private signUp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                firstName,
                lastName,
                email,
                mobile,
                nic,
                sponsor,
                username,
                password,
                profilePic
            } = req.body as SignUpDto;

            const emailExists = await withErrorHandling(this.authService.getUserByEmail)(email);

            if (emailExists) {
                throw new ForbiddenException("Email already exists", ErrorCodes.CREDENTIALS_TAKEN);
            }

            const usernameExists = await withErrorHandling(this.authService.getUserByUsername)(username);

            if (usernameExists) {
                throw new ForbiddenException("Username already exists", ErrorCodes.CREDENTIALS_TAKEN);
            }

            const hash = await argon.hash(password);

            const user = await withErrorHandling(this.authService.createUser)({
                firstName,
                lastName,
                email,
                mobile,
                nic,
                sponsor: null,
                username,
                password: hash,
                profilePic
            });

            await this.sendVerificationEmail(user._id, email);

            const token = createToken({
                _id: user._id,
                role: "user"
            })

            return sendResponse(res, {
                success: true,
                data: { token },
                status: 201
            })
        } catch (error) {
            next(error);
        }
    }

    private signIn = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username, password } = req.body;

            const user = await withErrorHandling(this.authService.getUserByEmailOrUsername)(username);

            if (!user) {
                throw new BadRequestException("User not found", ErrorCodes.USER_NOT_FOUND);
            }

            const isPasswordValid = await argon.verify(user.password || " ", password);

            if (!isPasswordValid) {
                throw new ForbiddenException("Invalid credentials", ErrorCodes.UNAUTHORIZED_ACCESS);
            }

            const token = createToken({
                _id: user._id,
                role: "user"
            })

            return sendResponse(res, {
                success: true,
                data: { token },
                status: 200
            });
        } catch (error) {
            next(error);
        }
    }

    private getMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { _id } = req.user;

            const user = await withErrorHandling(this.authService.getUserById)(_id);

            if (!user) {
                throw new NotFoundException("User not found", ErrorCodes.USER_NOT_FOUND);
            }

            return sendResponse(res, {
                success: true,
                data: {
                    ...user.toObject(),
                    password: undefined
                },
                status: 200
            })
        } catch (error) {
            next(error);
        }
    }

    private resendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { _id } = req.user;

            const user = await withErrorHandling(this.authService.getUserById)(_id);

            if (!user) {
                throw new NotFoundException("User not found", ErrorCodes.USER_NOT_FOUND);
            }

            await this.sendVerificationEmail(user._id, user?.email || "");

            return sendResponse(res, {
                success: true,
                message: "Verification email sent",
                status: 200
            })
        } catch (error) {
            next(error);
        }
    }

    private verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { _id } = req.user;
            const { otp } = req.body;

            const secret = await withErrorHandling(this.authService.getSecret)(_id);

            if (!secret) {
                throw new NotFoundException("Secret not found", ErrorCodes.SECRET_NOT_FOUND);
            }

            const isValid = authenticator.verify({ token: otp, secret: secret.secret });

            if (!isValid) {
                throw new ForbiddenException("Invalid or expired OTP", ErrorCodes.OTP_INVALID_OR_EXPIRED);
            }

            await withErrorHandling(this.authService.updateEmailVerificationStatus)(_id);

            await withErrorHandling(this.authService.deleteEmailVerificationSecret)(_id);

            return sendResponse(res, {
                success: true,
                message: "Email verified",
                status: 200
            })
        } catch (error) {
            next(error);
        }
    }

    private sendVerificationEmail = async (userId: string, email: string): Promise<void> => {
        const secret = authenticator.generateSecret();
        await withErrorHandling(this.authService.createScret)(userId, secret);

        const otp = authenticator.generate(secret);

        const html = await compileTemplate("email-verification.hbs", {
            logo: env.LOGO_URL,
            code: otp
        });

        sendMail({
            to: email,
            subject: "Email Verification",
            html,
            text: `Your OTP is ${otp}`
        })
    }
}

export default AuthController;