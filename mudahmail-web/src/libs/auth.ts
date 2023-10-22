import {jwtVerify} from "jose";
import {NEXTAUTH_SECRET, SHA256_SECRET} from "@/libs/config";

export function getJwtSecretKey() {
    const secret = NEXTAUTH_SECRET;
    if (secret.length === 0) {
        throw new Error("JWT Secret key is not defined");
    }
    return new TextEncoder().encode(secret);
}

export function getSHA256SecretKey() {
    const secret = SHA256_SECRET;
    if (secret.length === 0) {
        throw new Error("JWT Secret key is not defined");
    }
    return new TextEncoder().encode(secret);
}

export async function verifyJwtToken(token: string) {
    try {
        const {payload} = await jwtVerify(token, getJwtSecretKey());
        return payload;
    } catch (error) {
        return null;
    }
}