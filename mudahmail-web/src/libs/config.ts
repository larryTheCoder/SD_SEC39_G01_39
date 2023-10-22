import dotenv from 'dotenv'
import {z} from 'zod'

dotenv.config()

function config<T extends z.ZodTypeAny>(key: string[] | string, schema: T, defaultValue?: z.infer<T>): z.infer<T> {
    const values = Array.isArray(key) ? key.map(key => process.env[key]) : [process.env[key]]
    return schema.default(defaultValue).parse(values.find(Boolean))
}

const string = z.coerce.string().min(1)

export const S3_HOST = config('S3_HOST', string)
export const S3_REGION = config('S3_REGION', string)
export const S3_BUCKET = config('S3_BUCKET', string)
export const S3_ACCESS_KEY_ID = config('S3_ACCESS_KEY_ID', string)
export const S3_SECRET_ACCESS_KEY = config('S3_SECRET_ACCESS_KEY', string)

export const MAILGUN_EMAIL_NAME = config('MAILGUN_EMAIL_NAME', string)
export const MAILGUN_API_KEY = config('MAILGUN_API_KEY', string)
export const MAILGUN_PUBLIC_KEY = config('MAILGUN_PUBLIC_KEY', string)

export const NEXTAUTH_SECRET = config('NEXTAUTH_SECRET', string)
export const SHA256_SECRET = config('SHA256_SECRET', string)
export const NEXTAUTH_URL = config('NEXTAUTH_URL', string)

export const REDIS_URL = config('REDIS_URL', string)