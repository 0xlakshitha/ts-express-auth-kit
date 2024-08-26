import { env } from "@/config/env";
import { AccountRoles } from "../@types/types";
import { NextFunction, Request, Response } from "express";
import { ForbiddenException, UnathorizedException } from "@/utils/exceptions";
import ErrorCodes from "@/config/error.codes";
import { verifyToken } from "@/utils/jwt";

const DISABLE_ROLE_BASED_AUTH = env.ROLE_BASED_AUTH === 'false';
const ALT_AUTH_CREDENTIALS_IN_REQ_BODY = env.ALT_AUTH_CREDENTIALS_IN_REQ_BODY === 'true';

const defaultRoles: AccountRoles[] = ['user', 'admin', 'staff'];

export const authenticate = (roles: AccountRoles[] = defaultRoles) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { authorization } = req.headers;
            const { _id, role } = req.body;

            const IS_ALT_AUTH_CREDENTIALS_ENABLED =
                ALT_AUTH_CREDENTIALS_IN_REQ_BODY &&
                typeof _id === 'string' &&
                typeof role === 'string' &&
                defaultRoles.includes(role as AccountRoles);

            let payload

            if (!IS_ALT_AUTH_CREDENTIALS_ENABLED && (!authorization || !authorization.startsWith('Bearer '))) {
                return next(new UnathorizedException('Unauthorized access', ErrorCodes.UNAUTHORIZED_ACCESS));
            }

            if (IS_ALT_AUTH_CREDENTIALS_ENABLED) {
                payload = { _id, role };
            } else {
                const token = authorization?.split(' ')[1];
                payload = await verifyToken(token || '');
            }

            if (!payload) {
                return next(new UnathorizedException('Unauthorized access', ErrorCodes.UNAUTHORIZED_ACCESS));
            }

            if (typeof payload === 'string') {
                return next(new UnathorizedException(payload, ErrorCodes.UNAUTHORIZED_ACCESS));
            }

            if (payload && '_id' in payload && 'role' in payload) {
                req.user = payload;

                const isAuthorized = !DISABLE_ROLE_BASED_AUTH && roles.includes(payload.role as AccountRoles);
                
                if (!isAuthorized) {
                    return next(new ForbiddenException('Forbidden access', ErrorCodes.FORBIDDEN_ACCESS));
                }

                return next();
            } else {
                return next(new UnathorizedException('Unauthorized access', ErrorCodes.UNAUTHORIZED_ACCESS));
            }
        } catch (error) {
            return next(new UnathorizedException('Unauthorized access', ErrorCodes.UNAUTHORIZED_ACCESS));
        }
    }
}