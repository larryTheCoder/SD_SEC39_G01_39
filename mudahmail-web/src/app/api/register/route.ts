import {bcrypt, prisma} from "@/libs/database"
import {NextResponse} from "next/server";
import {Snowflake} from "@theinternetfolks/snowflake";
import {sendEmail} from "@/libs/verification";

export async function POST(
    request: Request
) {
    if (request.body != null) {
        const inputData: {
            authToken: "",
            emailAddress: "",
            password: "",
        } = await request.json();

        if (!(/.[A-Z0-9._%+\-]{1,16}.@.[A-Z0-9.\-]{1,16}.[.].[A-Z]+/i).test(inputData.emailAddress) || !(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}/).test(inputData.password)) {
            return NextResponse.json({message: 'Invalid Request Payload'}, {status: 400})
        }

        let userData = await prisma.userData.findFirst({
            where: {AND: [{email: inputData.emailAddress}]},
            select: {email: true, isVerified: true}
        });

        if (userData !== null && userData.isVerified) {
            return NextResponse.json({message: 'The email is already in use, please try another email.'}, {status: 409})
        }

        const resultFound = await prisma.mailbox.findFirst({where: {auth_token: inputData.authToken}})
        const resultRegistered = await prisma.userData.findFirst({where: {device_auth_token: inputData.authToken}})

        if ((resultFound !== null && resultRegistered !== null) || resultFound === null) {
            return NextResponse.json({message: 'The token provided were not found.'}, {status: 404})
        }

        const clientId = Snowflake.generate();
        await prisma.userData.upsert({
            where: {
                email: inputData.emailAddress,
            },
            create: {
                userSnowflake: clientId,
                email: inputData.emailAddress,
                device_auth_token: inputData.authToken,
                password: await bcrypt.hash(inputData.password, 10, false)
            },
            update: {
                userSnowflake: clientId,
                device_auth_token: inputData.authToken,
                password: await bcrypt.hash(inputData.password, 10, false)
            }
        })

        await sendEmail(inputData.emailAddress);

        return NextResponse.json({status: "Please check your email to continue sign up process."}, {status: 200});
    }

    return NextResponse.json({message: 'Missing body'}, {status: 422})
}

export async function HEAD(
    request: Request
) {
    const tokenKey = request.headers.get("Application-Token");

    let status: number = 404;
    if (tokenKey != null) {
        const resultFound = await prisma.mailbox.findFirst({where: {auth_token: tokenKey}})
        const resultRegistered = await prisma.userData.findFirst({where: {device_auth_token: tokenKey}})

        if (resultFound !== null && resultRegistered === null) {
            status = 200
        } else if (resultFound !== null && resultRegistered !== null) {
            status = 403;
        }
    }

    return NextResponse.json({}, {status: status})
}
