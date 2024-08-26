import { StatusCodes } from "http-status-codes";
import HttpException from "./http.exception";

class InternalServerException extends HttpException {
    constructor() {
        super(StatusCodes.INTERNAL_SERVER_ERROR, 'Something went wrong! Please try again later', 'INTERNAL_SERVER_ERROR');
    }
}

export default InternalServerException