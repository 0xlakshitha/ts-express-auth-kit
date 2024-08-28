import Controller from "@/interfaces/controller.interface";
import { NextFunction, Request, Response, Router } from "express";
import AuthService from "./auth.service";
import { SignUpDto } from "./auth.dto";
import { BadRequestException, ForbiddenException, NotFoundException } from "@/utils/exceptions";
import ErrorCodes from "@/config/error.codes";
import withErrorHandling from "@/utils/error.handling";
import * as argon from "argon2"
import validationMiddleware from "@/middleware/validation.middleware";
import { checkUsernameValidation, emailVerificationValidation, forgotPasswordValidation, passwordChangeValidation, resetPasswordValidation, signUpValidation, singInValidation } from "./auth.validation";
import { authenticator } from "otplib";
import { env } from "@/config/env";
import { compileTemplate } from "@/utils/hbs";
import { sendMail } from "@/utils/mailer";
import { createToken } from "@/utils/jwt";
import { authenticate } from "@/middleware/authenticate.middleware";
import { sendResponse } from "@/utils/response";
import { generateToken } from "@/utils/generateToken";

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
        this.router.post(
            `${this.path}/change-password`,
            authenticate(),
            validationMiddleware(passwordChangeValidation),
            this.changePassword
        )
        this.router.post(
            `${this.path}/forgot-password`,
            validationMiddleware(forgotPasswordValidation),
            this.forgotPassword
        )
        this.router.post(
            `${this.path}/reset-password`,
            validationMiddleware(resetPasswordValidation),
            this.resetPassword
        )
        this.router.post(
            `${this.path}/check-username`,
            validationMiddleware(checkUsernameValidation),
            this.checkUsername
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
                throw new ForbiddenException(`${email} is already in use`, ErrorCodes.CREDENTIALS_TAKEN);
            }

            const usernameExists = await withErrorHandling(this.authService.getUserByUsername)(username);

            if (usernameExists) {
                throw new ForbiddenException("Username already exists", ErrorCodes.CREDENTIALS_TAKEN);
            }

            const mobileExists = await withErrorHandling(this.authService.getUserByMobile)(mobile);

            if (mobileExists) {
                throw new ForbiddenException("Mobile number already exists", ErrorCodes.CREDENTIALS_TAKEN);
            }

            const nicExists = await withErrorHandling(this.authService.getUserByNic)(nic);

            if (nicExists) {
                throw new ForbiddenException("NIC already exists", ErrorCodes.CREDENTIALS_TAKEN);
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
                data: {
                    user: {
                        ...user.toObject(),
                        password: undefined
                    },
                    access_token: token
                },
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
                data: {
                    user: {
                        ...user.toObject(),
                        password: undefined
                    },
                    access_token: token
                },
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

            const token = createToken({
                _id: user._id,
                role: "user"
            })

            return sendResponse(res, {
                success: true,
                data: {
                    user: {
                        ...user.toObject(),
                        password: undefined
                    },
                    access_token: token
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
        await withErrorHandling(this.authService.createScret)(userId, secret, "email_verification");

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

    private changePassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { _id } = req.user
            const { password, oldPassword } = req.body

            const user = await withErrorHandling(this.authService.getUserById)(_id)

            if (!user) {
                throw new NotFoundException("User not found", ErrorCodes.USER_NOT_FOUND)
            }

            const isPasswordValid = await argon.verify(user.password || " ", oldPassword)

            if (!isPasswordValid) {
                throw new ForbiddenException("Invalid credentials", ErrorCodes.UNAUTHORIZED_ACCESS)
            }

            const hash = await argon.hash(password)

            await withErrorHandling(this.authService.updatePassword)(_id, hash)

            return sendResponse(res, {
                success: true,
                message: "Password updated",
                status: 200
            })
        } catch (error) {
            next(error);
        }
    }

    private forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username } = req.body

            const user = await withErrorHandling(this.authService.getUserByEmailOrUsername)(username)

            if (!user) {
                throw new NotFoundException("User not found", ErrorCodes.USER_NOT_FOUND)
            }

            const secret = generateToken()

            await withErrorHandling(this.authService.createScret)(user._id, secret, "password_reset", Date.now() + env.PASSWORD_RESET_EXPIRY * 1000)

            const resetLink = `${env.SITE_URL}/reset-password?secret=${secret}`

            const html = await compileTemplate("forget-password.hbs", {
                logo: env.LOGO_URL,
                resetLink
            })

            sendMail({
                to: user.email,
                subject: "Password Reset",
                html,
                text: `Reset your password by clicking on this link: ${resetLink}`
            })

            return sendResponse(res, {
                success: true,
                message: "Password reset link sent",
                status: 200
            })
        } catch (error) {
            next(error);
        }
    }

    private resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { secret, password } = req.body

            const secretDoc = await withErrorHandling(this.authService.getSecretBySecret)(secret)

            if (!secretDoc) {
                throw new NotFoundException("Secret not found", ErrorCodes.SECRET_NOT_FOUND)
            }

            console.log(secretDoc.expiresAt, Date.now())

            if (secretDoc.expiresAt < Date.now()) {
                throw new ForbiddenException("Expired secret", ErrorCodes.SECRET_EXPIRED)
            }

            const hash = await argon.hash(password)

            await withErrorHandling(this.authService.updatePassword)(secretDoc._id as string, hash)

            await withErrorHandling(this.authService.deleteEmailVerificationSecret)(secretDoc._id as string)

            return sendResponse(res, {
                success: true,
                message: "Password updated",
                status: 200
            })
        } catch (error) {
            next(error);
        }
    }

    private checkUsername = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username } = req.body

            const user = await withErrorHandling(this.authService.getUserByUsername)(username)

            return sendResponse(res, {
                success: true,
                data: {
                    exists: !!user
                },
                status: 200
            })
        } catch (error) {
            next(error);
        }
    }
}

export default AuthController;