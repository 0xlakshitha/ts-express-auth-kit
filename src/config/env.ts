import zennv from 'zennv'
import { z } from 'zod'

export const env = zennv({
    dotenv: true,
    schema: z.object({
        NODE_ENV: z.string().regex(/^(development|production)$/).default('development'),
        MONGO_URI: z.string(),
        PORT: z.number().default(8888),
        HOST: z.string().default('localhost')
    })
})