import {NextRequest, NextResponse} from "next/server";
import {getToken} from "next-auth/jwt";
import {prisma} from "@/libs/database";

export async function GET(
    request: NextRequest
) {
    const claims = await getToken({req: request})

    if (claims === null) {
        return NextResponse.json({}, {status: 404})
    }

    const userData = await prisma.userData.findFirst({
        where: {userSnowflake: claims.id}
    })

    if (userData === null) {
        return NextResponse.json({}, {status: 404})
    }

    const results = await prisma.eventData.findMany({
        take: 25,
        where: {device_auth_token: userData.device_auth_token},
        orderBy: {timestamp: 'desc'},
    })

    const doorState = await prisma.eventData.findFirst({
        where: {
            AND: [
                {device_auth_token: userData.device_auth_token},
                {event_type: 'DOOR_STATE'}
            ]
        },
        orderBy: {timestamp: 'desc'},
    });

    const weightState = await prisma.eventData.findFirst({
        where: {
            AND: [
                {device_auth_token: userData.device_auth_token},
                {event_type: 'WEIGHT_STATE'}
            ]
        },
        orderBy: {timestamp: 'desc'},
    });

    let locked = false
    let currentWeight = 0.0
    if (doorState !== null && weightState !== null) {
        let jsonData0 = JSON.parse(doorState.json_data ?? "[]")
        let jsonData1 = JSON.parse(weightState.json_data ?? "[]")

        locked = jsonData0['state'] === 'LOCK'
        currentWeight = parseFloat(jsonData1['weight'])
    }

    const response = {
        events: results.map((event) => {
            let jsonData = JSON.parse(event.json_data ?? "[]")


            return {
                event_type: event.event_type,
                timestamp: new Date(Number(event.timestamp)),
                data: jsonData
            }
        }),
        locked,
        current_weight: currentWeight,
        device_id: userData.device_auth_token
    }

    return NextResponse.json(response, {status: 200})
}