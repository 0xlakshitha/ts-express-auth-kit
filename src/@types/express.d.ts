import { User } from "../interfaces"
import { Pagination } from "./types"

declare global {
    namespace Express {
        export interface Request {
            user: User
            pagination?: Pagination
            isUserAuthenticated: boolean
        }
    }
}