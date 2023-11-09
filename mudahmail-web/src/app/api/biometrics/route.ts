import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/libs/database";
import {getToken} from "next-auth/jwt";

// Get all biometrics ids
export async function GET(
    request: NextRequest,
) {
    // TODO:
}

// Register a biometric id


// Delete a biometric id