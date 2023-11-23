import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/libs/database";
import {getToken} from "next-auth/jwt";
import {Role} from "@/interface";
import {mailboxClient} from "@/common/service";
import {S3_BUCKET, S3_HOST} from "@/libs/config";
import {RpcError} from "@protobuf-ts/runtime-rpc";

export async function GET(
    request: NextRequest,
) {
    const claims = await getToken({req: request})

    if (claims === null) {
        return NextResponse.json({}, {status: 404})
    }

    if (claims.role === Role.user) {
        return NextResponse.json({"error": "Missing permissions"}, {status: 401})
    }

    const allUserData = await prisma.userData.findMany({
        orderBy: {device_auth_token: "desc"}
    })

    const {response: mailboxState} = await mailboxClient.getMailboxStates(
        {clientUuid: allUserData.map(data => data.device_auth_token as string)},
        {timeout: 3_000}
    )

    const events = await prisma.eventData.findMany({
        where: {
            device_auth_token: {in: allUserData.map(data => data.device_auth_token as string)}
        },
        orderBy: {timestamp: "desc"}
    })

    const response = allUserData.map((data, index) => {
        const currentBox = mailboxState.states[index];
        const eventsFound = events.filter(e => e.device_auth_token == data.device_auth_token)

        let userPicture = "/default-profile.png"
        if (data.userPicturePath != null && data.userPicturePath.length > 0) {
            userPicture = "https://" + S3_BUCKET + "." + S3_HOST + "/" + data.userPicturePath;
        }

        return {
            email: data.email,
            role: data.isAdmin ? Role.admin : Role.user,
            profile: userPicture,
            device: data.device_auth_token,
            liveWeight: currentBox.currentWeight,
            locked: currentBox.locked,
            lockedWeight: currentBox.lockedWeight,
            online: currentBox.online,
            events: eventsFound.map((event) => {
                let jsonData = JSON.parse(event.json_data ?? "[]")

                return {
                    event_type: event.event_type,
                    timestamp: new Date(Number(event.timestamp)),
                    data: jsonData
                }
            })
        }
    })

    return NextResponse.json(response, {status: 200})
}

export async function PUT(
    request: NextRequest,
) {
    const claims = await getToken({req: request})

    if (claims === null) {
        return NextResponse.json({}, {status: 404})
    }

    const formData = await request.formData();
    const deviceId = formData.get("device") as string
    const toggleLock = (formData.get("toggle") as string) === "true"

    try {
        const {response: mailboxState} = await mailboxClient.setDoorLockStatus(
            {toggleLock: toggleLock},
            {timeout: 3_000, meta: {Authority: deviceId}}
        )

        return NextResponse.json({}, {status: 200})
    } catch (e) {
        if (e instanceof RpcError) {
            if (e.code == "NOT_FOUND") {
                return NextResponse.json({message: "Device is currently offline, try again later."}, {status: 404})
            }
        }
    }

    return NextResponse.json({message: "Internal server error."}, {status: 500})
}