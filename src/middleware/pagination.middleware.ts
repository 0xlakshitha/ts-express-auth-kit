import { Request, Response, NextFunction } from 'express'
import Joi, { ValidationErrorItem, ValidationError } from 'joi'
import { sendResponse } from '@/utils/response'
import ErrorCodes from '@/config/error.codes'

interface PaginationProps {
    page?: string,
    limit?: string,
    sort?: "asc" | "desc",
    sortBy?: string,
    filter?: string,
    search?: string,
}

export const paginate = <Filter extends string = string, SortBy extends string = string>(
    filterKeywords: Filter[] = [],
    sortByKeywords: SortBy[] = []
) => {
    return [
        (
            req: Request<any, any, any, PaginationProps>,
            res: Response,
            next: NextFunction
        ) => {
            const schema = Joi.object({
                page: Joi.number().integer().min(0).default(1),
                limit: Joi.number().integer().min(0).default(10),
                search: Joi.string().allow('').optional(),
                sort: Joi.string().valid('asc', 'desc').optional(),
                sortBy: sortByKeywords.length > 0
                    ? Joi.string().valid(...sortByKeywords).optional()
                    : Joi.string().optional(),
                filter: filterKeywords.length > 0
                    ? Joi.string().valid(...filterKeywords).optional()
                    : Joi.string().optional()
            });

            const { error, value } = schema.validate(req.query);

            if (error) {
                let errorMessage: string = "Validation Error"
                let errors: ValidationErrorItem[] = []
                if (error instanceof ValidationError) {
                    errorMessage = `Validation Error: ${error.details.map((err) => err.message).join(" , ")}`
                    errors = error.details
                }

                return sendResponse(res, {
                    success: false,
                    status: 400,
                    message: errorMessage,
                    code: ErrorCodes.VALIDATION_FAILED,
                    errors
                })
            }

            const page = parseInt(value.page) || 1; 
            const limit = parseInt(value.limit) || 10;
            const offset = (page - 1) * limit;
            const search = value.search || '';
            const filter = value.filter || undefined;
            const sort = value.sort || undefined;
            const sortBy = value.sortBy || undefined;

            req.pagination = { 
                page, 
                limit, 
                offset, 
                search, 
                filter,
                sort,
                sortBy
            };
            
            next();
        }
    ]
}

export default paginate