import {NextRequest, NextResponse} from "next/server";

export async function GET(
    request: NextRequest,
    response: NextResponse
) {
    return NextResponse.json({status: "Anything that can go wrong will go wrong, and at the worst possible time."}, {status: 200})
}