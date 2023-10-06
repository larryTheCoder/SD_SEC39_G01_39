import {NextRequest, NextResponse} from "next/server";

export async function GET(
    request: NextRequest
) {
    return NextResponse.redirect("http://localhost:3000/default-profile.png");
}