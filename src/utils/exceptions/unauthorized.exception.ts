import { StatusCodes } from "http-status-codes";
import HttpException from "./http.exception";

class UnathorizedException extends HttpException {
    constructor(message: string, code: string = 'UNAUTHORIZED') {
        super(StatusCodes.UNAUTHORIZED, message, code)
    }
}

export default UnathorizedException
