import {prisma} from "@/libs/database"
import {NextRequest, NextResponse} from "next/server";
import {Snowflake} from "@theinternetfolks/snowflake";
import {getEmailValidation, sendVerificationMail} from "@/libs/mailing";
import rateLimiting from "@/libs/limits";
import bcrypt from "bcrypt";

const emailRegex = /.[A-Z0-9._%+\-]{1,16}.@.[A-Z0-9.\-]{1,16}.[.].[A-Z]+/i
const passRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}/

export async function POST(
    req: NextRequest,
    res: NextResponse
) {
    const result = await rateLimiting(req, res, 5, 60)
    if (!(result instanceof Headers)) {
        return result;
    }

    const formData = await req.formData();

    const token = formData.get("token") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!emailRegex.test(email) || !passRegex.test(password)) {
        return NextResponse.json({message: 'Email or password does not met regex requirements.'}, {status: 422, headers: result})
    }

    const resultFound = await prisma.mailbox.findFirst({where: {auth_token: token}})
    const resultRegistered = await prisma.userData.findFirst({where: {device_auth_token: token}})

    if ((resultFound !== null && resultRegistered !== null) || resultFound === null) {
        return NextResponse.json({message: 'The token provided were not found or already registered.'}, {status: 404, headers: result})
    }

    const validation = await getEmailValidation(email)
    if (validation.result === "undeliverable" || validation.result === "do_not_send" || validation.result === "unknown") {
        return NextResponse.json({message: "Your email does not pass our internal email verification"}, {status: 401, headers: result})
    }

    const user = await prisma.userData.findFirst({
        where: {email},
        select: {email: true, isVerified: true}
    });

    if (user !== null && user.isVerified) {
        return NextResponse.json({message: 'The email is already in use, please try another email.'}, {status: 409, headers: result})
    }

    const clientId = Snowflake.generate();
    await prisma.userData.upsert({
        where: {
            email,
        },
        create: {
            userSnowflake: clientId,
            email,
            device_auth_token: token,
            password: await bcrypt.hash(password, 10)
        },
        update: {
            userSnowflake: clientId,
            device_auth_token: token,
            password: await bcrypt.hash(password, 10)
        }
    })

    await sendVerificationMail(email);

    return NextResponse.json({status: "Please check your email to continue sign up process."}, {status: 200, headers: result});
}

export async function HEAD(
    req: NextRequest,
    res: NextResponse
) {
    const result = await rateLimiting(req, res, 10, 5)
    if (!(result instanceof Headers)) {
        return result;
    }

    const tokenKey = req.headers.get("Application-Token");

    let status: number = 404;
    if (tokenKey != null) {
        const resultFound = await prisma.mailbox.findFirst({where: {auth_token: tokenKey}})
        const resultRegistered = await prisma.userData.findFirst({where: {device_auth_token: tokenKey}})

        if (resultFound !== null && resultRegistered === null) {
            status = 200
        } else if (resultFound !== null && resultRegistered !== null) {
            status = 403
        }
    }

    return NextResponse.json({}, {status: status, headers: result})
}
