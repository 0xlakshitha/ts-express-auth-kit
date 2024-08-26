import { Response } from 'express';
import { ValidationErrorItem } from 'joi';

type DefaultData = {
    success?: boolean;
    status?: number;
    message?: string;
    code?: string;
    data?: any;
    errors?: ValidationErrorItem[];
};

export const sendResponse = (res: Response, output = {} as DefaultData) => {
    const {
        success = true,
        message = 'SUCCESS',
        code = 'SUCCESS',
        data = undefined,
        status = 200,
        errors = undefined,
    } = output;
    res.status(status).json(
        data
            ? {
                success,
                message,
                code,
                data,
            }
            : {
                success,
                message,
                code,
                errors,
            }
    );
};