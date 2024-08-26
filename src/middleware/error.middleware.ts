import { Request, Response, NextFunction } from "express";
import HttpException from '@/utils/exceptions/http.exception'
import { sendResponse } from "@/utils/response";
import { logger } from "@/utils/logger";

function ErrorMiddleware(
    error: HttpException,
    req: Request,
    res: Response,
    next: NextFunction
) {
    const status = error.status || 500
    const message = error.message || 'Something went wrong, Please try again later'
    const code = error.code || 'INTERNAL_SERVER_ERROR'
    
    logger.error(error)

    return sendResponse(res, {
        success: false,
        status: status,
        message: message,
        code: code
    })
}

export default ErrorMiddleware