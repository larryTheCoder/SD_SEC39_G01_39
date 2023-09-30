export function getDeploymentUrl(): string {
    return process.env.NEXT_DEPLOYMENT_URL ?? "http://localhost:3000"
}