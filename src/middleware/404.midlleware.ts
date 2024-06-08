import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

function NotFoundMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: 'Route does not exist'
    })
}

export default NotFoundMiddleware