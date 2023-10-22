import {S3} from "@aws-sdk/client-s3";
import {S3_ACCESS_KEY_ID, S3_HOST, S3_REGION, S3_SECRET_ACCESS_KEY} from "@/libs/config";

export const s3 = new S3({
    endpoint: `https://${S3_HOST}`,
    region: S3_REGION,
    credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
})
