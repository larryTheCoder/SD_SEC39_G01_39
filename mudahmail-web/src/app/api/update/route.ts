import {NextRequest, NextResponse} from "next/server"
import {bcrypt, prisma} from "@/libs/database"
import {sendVerificationMail} from "@/libs/mailing";
import {getToken} from "next-auth/jwt";
import {s3, S3_BUCKET} from "@/libs/s3";
import {DeleteObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";

const emailRegex = /.[A-Z0-9._%+\-]{1,16}.@.[A-Z0-9.\-]{1,16}.[.].[A-Z]+/i
const passRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}/

export async function POST(
    request: NextRequest,
) {
    const claims = await getToken({req: request})

    const inputData: {
        email: "",
        oldPassword: "",
        newPassword: "",
    } = await request.json()

    if (!emailRegex.test(inputData.email) || !passRegex.test(inputData.newPassword)) {
        return NextResponse.json({message: 'Invalid Request Payload #1'}, {status: 401})
    }

    if (claims === null) {
        return NextResponse.json({message: 'Invalid Request Payload #2'}, {status: 401})
    }

    // Verify the user snowflake id (Technically this should be unique).

    const currentEmail = claims.email
    const snowflakeId = claims.id;
    if (typeof currentEmail !== "string" || typeof snowflakeId !== "string") {
        return NextResponse.json({message: 'Invalid Request Payload #3'}, {status: 401})
    }

    let userData = await prisma.userData.findFirst({
        where: {userSnowflake: snowflakeId}
    })

    if (userData === null) {
        return NextResponse.json({message: 'Invalid Request Payload #4'}, {status: 401})
    }

    let currentStatus = 0;
    if (await bcrypt.compare(inputData.oldPassword, userData.password, false)) {
        const newEmail = currentEmail.toLowerCase() !== inputData.email.toLowerCase()

        try {
            await prisma.userData.update({
                where: {userSnowflake: snowflakeId},
                data: {
                    email: newEmail ? inputData.email : currentEmail,
                    password: await bcrypt.hash(inputData.newPassword, 10, false),
                }
            })

            if (newEmail) {
                currentStatus = 1;

                await sendVerificationMail(inputData.email);
            }
        } catch (e) {
            return NextResponse.json({message: 'The email is currently in use.'}, {status: 409})
        }
    } else {
        return NextResponse.json({message: 'Invalid password'}, {status: 403})
    }

    return NextResponse.json({response: currentStatus}, {status: 200})
}

export async function PUT(
    request: NextRequest,
) {
    const claims = await getToken({req: request})

    if (claims === null) {
        return NextResponse.json({}, {status: 401})
    }

    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    await prisma.userData.update({
        where: {userSnowflake: claims.id},
        data: {
            userPicturePath: `profiles/${claims.id}/profile-image`
        }
    })

    const response = await Promise.all(
        files.map(async (file) => {
            // not sure why I have to override the types here
            const Body = (await file.arrayBuffer()) as Buffer;
            const result = await s3.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: `profiles/${claims.id}/profile-image`, Body, ContentType: file.type}));
        })
    );

    return NextResponse.json(response)
}

export async function DELETE(
    request: NextRequest,
) {
    const claims = await getToken({req: request})

    if (claims === null) {
        return NextResponse.json({}, {status: 401})
    }

    await prisma.userData.update({
        where: {userSnowflake: claims.id},
        data: {
            userPicturePath: null
        }
    })

    return NextResponse.json(await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: `profiles/${claims.id}/profile-image`})))
}