import ErrorCodes from "@/config/error.codes";
import { sendResponse } from "@/utils/response";
import { Request, Response, NextFunction, RequestHandler } from "express";
import Joi, { ValidationError, ValidationErrorItem } from 'joi'

function validationMiddleware(schema: Joi.Schema): RequestHandler {
    return async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const validationOptions = {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true
        }

        try {
            const value = await schema.validateAsync(
                req.body,
                validationOptions
            )
            req.body = value
            next()
        } catch (e: any) {
            let errorMessage : string = "Validation Error"
            let errors: ValidationErrorItem[] = []
            if(e instanceof ValidationError) {
                errorMessage = `Validation Error: ${e.details.map((err) => err.message).join(" , ")}`
                errors = e.details
            }
            
            return sendResponse(res, {
                success: false,
                status: 400,
                message: errorMessage,
                code: ErrorCodes.VALIDATION_FAILED,
                errors
            })
        }
    }
}   

export default validationMiddleware