export function getDeploymentUrl(): string {
    return process.env.NEXTAUTH_URL ?? "http://localhost:3000"
}