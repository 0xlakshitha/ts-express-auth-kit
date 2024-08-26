import zennv from 'zennv'
import { z } from 'zod'

export const env = zennv({
    dotenv: true,
    schema: z.object({
        NODE_ENV: z.string().regex(/^(development|production)$/).default('development'),
        MONGO_URI: z.string(),
        PORT: z.number().default(8888),
        HOST: z.string().default('localhost'),
        JWT_SECRET: z.string(),
        OTP_EXPIRY: z.number().default(300),
        SMTP_HOST: z.string(),
        SMTP_PORT: z.number(),
        SMTP_USER: z.string(),
        SMTP_PASS: z.string(),
        LOGO_URL: z.string(),
        ROLE_BASED_AUTH: z.string().regex(/^(true|false)$/).default('false'),
        ALT_AUTH_CREDENTIALS_IN_REQ_BODY: z.string().regex(/^(true|false)$/).default('false'),
    })
})