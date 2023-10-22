import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/libs/database";
import {createHmac, randomBytes} from "crypto";
import {getSHA256SecretKey} from "@/libs/auth";
import {sendPasswordResetMail} from "@/libs/mailing";
import bcrypt from "bcrypt";

export async function POST(
    request: Request
) {
    const userEmail: string = await request.text();

    const result = await prisma.userData.findFirst({where: {email: userEmail}})

    if (result === null) {
        return NextResponse.json({message: "Email is not registered in our database."}, {status: 401})
    }

    const buf = randomBytes(128).toString('hex');
    const hash = createHmac('sha256', getSHA256SecretKey()).update(buf).digest('hex')

    await prisma.passwordReset.upsert({
        where: {
            userEmail: userEmail,
        },
        create: {
            userEmail: userEmail,
            resetToken: hash,
            validUntil: (new Date(Date.now() + (30 * 60 * 1000)).toISOString()),
        },
        update: {
            resetToken: hash,
            validUntil: (new Date(Date.now() + (30 * 60 * 1000)).toISOString()),
        }
    })

    await sendPasswordResetMail(userEmail, buf);

    return NextResponse.json({}, {status: 200})
}

export async function GET(
    request: NextRequest
) {
    const token = request.nextUrl.searchParams.get("token");

    if (token === null) {
        return NextResponse.json({}, {status: 404})
    }

    const result = await verifyToken(token);
    if (result === null) {
        return NextResponse.json({}, {status: 404})
    }

    return NextResponse.json({email: result.userEmail}, {status: 200})
}

export async function PUT(
    request: NextRequest
) {
    const inputData: {
        token: "",
        password: "",
    } = await request.json();

    if (inputData === null) {
        return NextResponse.json({}, {status: 404})
    }

    if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}/).test(inputData.password)) {
        return NextResponse.json({message: "Password failed regex check"}, {status: 400})
    }

    const result = await verifyToken(inputData.token);
    if (result === null) {
        return NextResponse.json({}, {status: 404})
    }

    await prisma.userData.update({
        where: {
            email: result.userEmail,
        },
        data: {
            password: await bcrypt.hash(inputData.password, 10)
        }
    })

    await prisma.passwordReset.delete({
        where: {
            userEmail: result.userEmail
        }
    })

    return NextResponse.json({}, {status: 200})
}

async function verifyToken(token: string) {
    const hash = createHmac('sha256', getSHA256SecretKey()).update(token).digest('hex')
    return prisma.passwordReset.findFirst({
        where: {
            resetToken: hash,
            validUntil: {
                gte: new Date(Date.now()).toISOString()
            }
        }
    });
}