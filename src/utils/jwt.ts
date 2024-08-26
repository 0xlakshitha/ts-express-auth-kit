import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { User } from '../interfaces'

export const createToken = (payload: User): string => {
    return jwt.sign(
        payload,
        env.JWT_SECRET as jwt.Secret,
        {expiresIn: '7d'}
    )
}

export const verifyToken = async (
    token: string
): Promise<jwt.VerifyErrors | User> => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            env.JWT_SECRET as jwt.Secret,
            (err, payload) => {
                if(err) return reject(err)

                resolve(payload as User)
            }
        )
    })
}

export default { createToken, verifyToken }