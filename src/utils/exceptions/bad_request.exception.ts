import { StatusCodes } from "http-status-codes";
import HttpException from "./http.exception";

class BadRequestException extends HttpException {
    constructor(message: string, code: string = 'BAD_REQUEST') {
        super(StatusCodes.BAD_REQUEST, message, code);
    }
}

export default BadRequestException
