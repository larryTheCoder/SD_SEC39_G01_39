import {NextRequest, NextResponse} from "next/server";
import {getDeploymentUrl} from "@/libs/util";

export async function GET(
    request: NextRequest
) {
    return NextResponse.redirect(getDeploymentUrl() + "/default-profile.png");
}