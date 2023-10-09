import {S3} from "@aws-sdk/client-s3";
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

export const s3 = new S3({
    endpoint: `https://${S3_HOST}`,
    region: S3_REGION,
    credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
})
