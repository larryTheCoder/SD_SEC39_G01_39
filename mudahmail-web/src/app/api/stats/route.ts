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

    return NextResponse.json(results.map((event) => {
        let jsonData = JSON.parse(event.json_data ?? "[]")

        let type = "Weight Event"
        let data = "";
        if (event.event_type === "DOOR_STATE") {
            type = "Door Event"

            switch (jsonData["state"]){
                case "LOCK":
                    data = "Locked"
                    break;
                case "UNLOCKED":
                    data = "Unlocked"
                    break;
                case "OPEN":
                    data = "Door Opened"
                    break;
                case "CLOSE":
                    data = "Door Closed"
                    break;
            }
        } else {
            data = jsonData["weight"];
        }

        return {
            event_type: type,
            timestamp: new Date(Number(event.timestamp)).toLocaleString('default', {timeZone: 'Asia/Kuala_Lumpur'}),
            data: data
        }
    }), {status: 200})
}