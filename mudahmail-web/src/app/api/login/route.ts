import {NextResponse} from "next/server"
import {SignJWT} from "jose"
import {getJwtSecretKey} from "@/libs/auth"
import {prisma, bcrypt} from "@/libs/database"

export async function POST(
    request: Request
) {
    if (request.body != null) {
        const inputData: {
            email: "",
            password: "",
            remember: false
        } = await request.json();

        if (!(/.[A-Z0-9._%+\-]{1,16}.@.[A-Z0-9.\-]{1,16}.[.].[A-Z]+/i).test(inputData.email) || !(/.{8,}/).test(inputData.password)) {
            return NextResponse.json({message: 'Invalid Request Payload'}, {status: 400})
        }

        let userData = await prisma.userData.findFirst({
            where: {AND: [{email: inputData.email}]},
            select: {password: true, device_auth_token: true, email: true}
        });

        if (userData !== null && await bcrypt.compare(inputData.password, userData.password, false)) {
            const token = await new SignJWT({
                username: userData.email,
            }).setProtectedHeader({alg: "HS256"})
                .setIssuedAt()
                .setExpirationTime("24h")
                .sign(getJwtSecretKey())

            return NextResponse.json({token: token}, {status: 200})
        }

        return NextResponse.json({message: 'Not found'}, {status: 404})
    }

    return NextResponse.json({message: 'Missing body'}, {status: 422})
}