import {NEXTAUTH_URL} from "@/libs/config";

export function getDeploymentUrl(): string {
    return NEXTAUTH_URL ?? "http://localhost:3000"
}