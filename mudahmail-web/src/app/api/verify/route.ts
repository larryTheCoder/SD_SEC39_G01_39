import {NextRequest, NextResponse} from "next/server";
import {verifyJwtToken} from "@/libs/auth";
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

    if (searchResult === null || searchResult.isVerified) {
        return NextResponse.json({error: "not found"}, {status: 404});
    }

    await prisma.userData.update({
        where: {email: actual_email},
        data: {
            isVerified: true
        }
    })

    return NextResponse.json({}, {status: 200})
}