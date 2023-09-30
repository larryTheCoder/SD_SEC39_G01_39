import {NextRequest, NextResponse} from "next/server";
import {SignJWT} from "jose";
import {getJwtSecretKey, verifyJwtToken} from "@/libs/auth";
import {prisma} from "@/libs/database";

export async function GET(
    request: NextRequest
) {
    const token = request.nextUrl.searchParams.get("token");

    if (token === null) {
        return NextResponse.json({error: "not found"}, {status: 404});
    }

    const d = new Date();
    const seconds = d.getTime() / 1000;

    const result = await verifyJwtToken(token);
    if (result === null || seconds > (result.exp ?? 0)) {
        return NextResponse.json({error: "not found"}, {status: 404});
    }

    const actual_email: string | undefined = typeof result.username === 'string' ? result.username : undefined;
    if (actual_email === undefined) {
        return NextResponse.json({error: "not found"}, {status: 404});
    }

    const searchResult = await prisma.userData.findFirst({
        where: {email: actual_email}
    });

    if (searchResult === null) {
        return NextResponse.json({error: "not found"}, {status: 404});
    }

    const signed_token = await new SignJWT({
        id: searchResult.userSnowflake,
    }).setProtectedHeader({alg: "HS256"})
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(getJwtSecretKey())

    return NextResponse.json({token: signed_token}, {status: 200})
}