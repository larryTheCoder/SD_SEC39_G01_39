import {NextResponse} from "next/server"
import {prisma} from "@/libs/database"
import {getServerSession} from "next-auth/next"
import {handling} from "@/app/api/auth/[...nextauth]/route"
import {NextApiRequest, NextApiResponse} from "next";

export async function POST(
    request: NextApiRequest,
    response: NextApiResponse
) {
    const currentSession = await getServerSession(request, response, handling)

    const inputData: {
        email: "",
        oldPassword: "",
        newPassword: "",
    } = await request.json()

    if (!(/.[A-Z0-9._%+\-]{1,16}.@.[A-Z0-9.\-]{1,16}.[.].[A-Z]+/i).test(inputData.email) || !(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}/).test(inputData.newPassword)) {
        return NextResponse.json({message: 'Invalid Request Payload'}, {status: 400})
    }

    if (currentSession === null || currentSession === undefined) {
        return NextResponse.json({message: 'Invalid Request Payload 3'}, {status: 400})
    }

    console.log(currentSession);
    const user = currentSession

    if (user === undefined || user === null) {
        return NextResponse.json({message: 'Invalid Request Payload 1'}, {status: 404})
    }

    const email = user.email
    if (email === null) {
        return NextResponse.json({message: 'Invalid Request Payload 2'}, {status: 404})
    }

    let userData = await prisma.userData.findFirst({
        where: {AND: [{email: email}]},
        select: {email: true, isVerified: true}
    })

    return NextResponse.json({}, {status: 200})
}
