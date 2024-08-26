import Controller from "@/interfaces/controller.interface";
import { NextFunction, Request, Response, Router } from "express";
import AuthService from "./auth.service";
import { SignUpDto } from "./auth.dto";
import { BadRequestException, ForbiddenException } from "@/utils/exceptions";
import ErrorCodes from "@/config/error.codes";
import withErrorHandling from "@/utils/error.handling";
import * as argon from "argon2"

class AuthController implements Controller {
    public path: string = "/auth";
    public router = Router();
    private authService: AuthService = new AuthService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/signup`, this.signUp);
        // this.router.post(`${this.path}/signin`, this.signIn);
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
                sponsor,
                username,
                password: hash,
                profilePic
            });
        } catch (error) {
            next(error);
        }
    }
}