import {NextRequest, NextResponse} from "next/server";
import {getToken} from "next-auth/jwt";
import {prisma} from "@/libs/database";
import {mailboxClient} from "@/common/service";
import {EventData} from ".prisma/client";
import {ADMIN_JWT_KEY} from "@/libs/config";

export async function GET(
    request: NextRequest
) {
    const claims = await getToken({req: request})

    if (claims === null) {
        return NextResponse.json({}, {status: 404})
    }

    const events = await prisma.$queryRawUnsafe<EventData[]>(
        `SELECT * FROM events WHERE device_auth_token = (SELECT device_auth_token FROM user_data WHERE user_snowflake=${claims.id}) ORDER BY timestamp DESC LIMIT 25`
    )

    if (events.length == 0) {
        return NextResponse.json({}, {status: 200})
    }

    const deviceUuid = events[0].device_auth_token;
    const {response: mailboxState} = await mailboxClient.getMailboxStates(
        {clientUuid: [deviceUuid as string]},
        {timeout: 3_000}
    )

    const state = mailboxState.states[0]
    const response = {
        events: events.map((event) => {
            let jsonData = JSON.parse(event.json_data ?? "[]")

            return {
                event_type: event.event_type,
                timestamp: new Date(Number(event.timestamp)),
                data: jsonData
            }
        }),
        locked: state.locked,
        is_online: state.online,
        live_weight: state.currentWeight,
        current_weight: state.lockedWeight,
        device_id: deviceUuid
    }

    return NextResponse.json(response, {status: 200})
}