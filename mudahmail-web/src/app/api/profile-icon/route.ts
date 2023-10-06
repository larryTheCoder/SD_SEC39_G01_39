import {NextApiRequest, NextApiResponse} from "next";
import {NextResponse} from "next/server";

export async function GET(
    request: NextApiRequest,
    response: NextApiResponse
) {
    return NextResponse.redirect("http://localhost:3000/default-profile.png");
}