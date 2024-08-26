import { StatusCodes } from "http-status-codes";
import HttpException from "./http.exception";

class NotFoundException extends HttpException {
    constructor(message: string, code: string = 'NOT_FOUND') {
        super(StatusCodes.NOT_FOUND, message, code)
    }
}

export default NotFoundException
