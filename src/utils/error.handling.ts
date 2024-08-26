import { BadRequestException } from "./exceptions";

const withErrorHandling = <T extends (...args: any[]) => any>(fn: T) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        try {
            return await fn(...args);
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                throw new BadRequestException(
                    Object.values(error.errors).map((value: any) => value.message).join(' ')
                );
            }
            if (error.name === 'MongoError' && error.code === 11000) {
                throw new BadRequestException(`${Object.keys(error.keyValue)} is already taken`);
            }
            if (error.name === 'CastError') {
                throw new BadRequestException('Invalid ID');
            }
            throw error;
        }
    };
};

export default withErrorHandling;
