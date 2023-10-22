import Redis from "ioredis"
import {NextRequest, NextResponse} from "next/server"
import {client} from "@/libs/database"

type Result = {
    limit: number
    remaining: number
    ttl: number
    success: boolean
}

const rateLimiter = async (
    client: Redis,
    ip: string,
    limit: number,
    duration: number
): Promise<Result> => {
    const key = `rate_limit:${ip}`
    let currentCount = await client.get(key)
    let count = parseInt(currentCount as string, 10) || 0
    if (count >= limit) {
        return {limit, remaining: limit - count, ttl: await client.ttl(key), success: false}
    }
    client.incr(key)
    client.expire(key, duration)
    return {limit, remaining: limit - (count + 1), ttl: await client.ttl(key), success: true}
}

const rateLimiting = async (
    req: NextRequest,
    res: NextResponse,
    limit: number,
    duration: number,
): Promise<NextResponse | Headers> => {
    const forwarded = req.headers.get("x-forwarded-for")
    const identifier = forwarded ? forwarded.split(/, /)[0] : req.ip
    const result = await rateLimiter(
        client,
        identifier!,
        limit,
        duration
    )
    const headers = new Headers(res.headers);

    headers.set("X-RateLimit-Limit", String(result.limit))
    headers.set("X-RateLimit-Remaining", String(result.remaining))
    headers.set("X-RateLimit-Reset", String(result.ttl))

    if (!result.success) {
        return NextResponse.json({message: "Too many requests. Please try again in a few minutes."}, {status: 429, headers: headers})
    }

    return headers
}

export default rateLimiting