import { StatusCodes } from "http-status-codes";
import HttpException from "./http.exception";

class ForbiddenException extends HttpException {
    constructor(message: string, code: string = 'FORBIDDEN') {
        super(StatusCodes.FORBIDDEN, message, code)
    }
}

export default ForbiddenException
