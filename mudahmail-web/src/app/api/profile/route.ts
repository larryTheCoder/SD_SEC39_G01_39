import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/libs/database";
import {getToken} from "next-auth/jwt";

export async function GET(
    request: NextRequest,
) {
    const claims = await getToken({req: request})

    if (claims === null) {
        return NextResponse.json({}, {status: 404})
    }

    const userData = await prisma.userData.findFirst({
        where: {userSnowflake: claims.id}
    })

    if (userData === null) {
        return NextResponse.json({}, {status: 404})
    }

    const userInformation = await prisma.userInformation.findFirst({
        where: {userEmail: userData.email}
    })

    if (userInformation === null) {
        return NextResponse.json({email: userData.email}, {status: 200})
    }

    return NextResponse.json({
        email: userData.email,
        firstName: userInformation.firstName,
        lastName: userInformation.lastName,
        address: userInformation.address,
        city: userInformation.city,
        state: userInformation.state,
        postcode: userInformation.postcode,
        phoneNumber: userInformation.phoneNumber
    }, {status: 200})
}