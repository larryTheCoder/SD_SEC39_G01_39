import {NextRequest, NextResponse} from "next/server"
import {client, prisma} from "@/libs/database"
import {sendVerificationMail} from "@/libs/mailing";
import {getToken} from "next-auth/jwt";
import {s3} from "@/libs/s3";
import {S3_BUCKET} from "@/libs/config";
import {DeleteObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";
import bcrypt from "bcrypt";
import {RpcError} from "@protobuf-ts/runtime-rpc";
import {mailboxClient} from "@/common/service";

const emailRegex = /.[A-Z0-9._%+\-]{1,16}.@.[A-Z0-9.\-]{1,16}.[.].[A-Z]+/i
const passRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}/

export async function PUT(
    request: NextRequest,
) {
    const claims = await getToken({req: request})

    if (claims === null) {
        return NextResponse.json({}, {status: 401})
    }

    const formData = await request.formData();
    const formType = formData.get("type") as string

    if (formType === "avatar_upload") {
        const files = formData.getAll("file") as File[];

        if (files.length > 0) {
            const file = files[0]

            const Body = (await file.arrayBuffer()) as Buffer;
            await s3.send(new PutObjectCommand({Bucket: S3_BUCKET, Key: `profiles/${claims.id}/profile-image`, Body, ContentType: file.type}));

            await prisma.userData.update({
                where: {userSnowflake: claims.id},
                data: {
                    userPicturePath: `profiles/${claims.id}/profile-image`
                }
            })

            const user = await client.get(`user_data:${claims.id}`)
            if (user !== null) {
                const user_data = JSON.parse(user)

                user_data["profile"] = `profiles/${claims.id}/profile-image`;

                await client.set(`user_data:${claims.id}`, JSON.stringify(user_data))
            }
        }
    } else if (formType === "password_change") {
        const currentPassword = formData.get("current_password") as string
        const newPassword = formData.get("new_password") as string

        let userData = await prisma.userData.findFirst({
            where: {userSnowflake: claims.id}
        })

        if (userData === null) {
            return NextResponse.json({message: "User is not found in the database."}, {status: 404})
        }

        if (!passRegex.test(newPassword)) {
            return NextResponse.json({message: 'The password does not match the required regex input.'}, {status: 406})
        }

        if (await bcrypt.compare(currentPassword, userData.password)) {
            if (await bcrypt.compare(newPassword, userData.password)) {
                return NextResponse.json({message: 'New password cannot be the same with current password.'}, {status: 401})
            }

            await prisma.userData.update({
                where: {userSnowflake: claims.id},
                data: {
                    password: await bcrypt.hash(newPassword, 10),
                }
            })

            return NextResponse.json({})
        }

        return NextResponse.json({message: "Current password does not match."}, {status: 401})
    } else if (formType === "general_information") {
        const firstName = formData.get("first-name") as string
        const lastName = formData.get("last-name") as string
        const address = formData.get("address") as string
        const state = formData.get("state") as string
        const city = formData.get("city") as string
        const postcode = parseInt(formData.get("zip-code") as string)
        const email = formData.get("email") as string
        const phoneNumber = formData.get("phone-number") as string

        let userData = await prisma.userData.findFirst({
            where: {userSnowflake: claims.id}
        })

        if (userData === null) {
            return NextResponse.json({message: "User is not found in the database."}, {status: 404})
        }

        const newEmail = userData.email.toLowerCase() !== email.toLowerCase()

        try {
            await prisma.userInformation.upsert({
                where: {
                    userEmail: userData.email,
                },
                create: {
                    userEmail: userData.email,
                    firstName: firstName,
                    lastName: lastName,
                    address: address,
                    city: city,
                    state: state,
                    postcode: postcode,
                    phoneNumber: phoneNumber,
                },
                update: {
                    firstName: firstName,
                    lastName: lastName,
                    address: address,
                    city: city,
                    state: state,
                    postcode: postcode,
                    phoneNumber: phoneNumber,
                }
            })

            if (newEmail) {
                if (!emailRegex.test(email)) {
                    return NextResponse.json({message: 'The email does not match the required regex input.'}, {status: 406})
                }

                await prisma.userData.update({
                    where: {userSnowflake: claims.id},
                    data: {
                        email: email,
                        isVerified: false
                    }
                })

                await sendVerificationMail(email);
            }
        } catch (e) {
            return NextResponse.json({message: 'The email is currently in use.'}, {status: 409})
        }
    } else if (formType === "device_lock_state") {
        const toggleLock = (formData.get("toggle") as string) === "true"

        try {
            let userData = await prisma.userData.findFirst({
                where: {AND: [{userSnowflake: claims.id}]},
                select: {device_auth_token: true}
            });

            if (userData === null) {
                return NextResponse.json({message: "User is not authenticated."}, {status: 400})
            }

            const {response: mailboxState} = await mailboxClient.setDoorLockStatus(
                {toggleLock: toggleLock},
                {timeout: 3_000, meta: {Authority: userData.device_auth_token as string}}
            )

            return NextResponse.json({}, {status: 200})
        } catch (e) {
            if (e instanceof RpcError) {
                if (e.code == "NOT_FOUND") {
                    return NextResponse.json({message: "Device is currently offline, try again later."}, {status: 404})
                }
            }
        }
    }

    return NextResponse.json({})
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

    const user = await client.get(`user_data:${claims.id}`)
    if (user !== null) {
        const user_data = JSON.parse(user)

        user_data["profile"] = null;

        await client.set(`user_data:${claims.id}`, JSON.stringify(user_data))
    }

    return NextResponse.json(await s3.send(new DeleteObjectCommand({Bucket: S3_BUCKET, Key: `profiles/${claims.id}/profile-image`})))
}