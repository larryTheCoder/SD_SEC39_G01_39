import {ChannelCredentials} from '@grpc/grpc-js'
import {GrpcTransport} from '@protobuf-ts/grpc-transport'
import {ADMIN_JWT_KEY, MUDAHMAIL_HOST} from "@/libs/config"
import {ServerClient} from "@/common/service/mailbox.client"
import {RpcOptions} from "@protobuf-ts/runtime-rpc"

export class BearerGrpcTransport extends GrpcTransport {
    mergeOptions(options?: Partial<RpcOptions>): RpcOptions {
        if (options == undefined) {
            return {meta: {"Authorization": "Bearer " + ADMIN_JWT_KEY}}
        }

        if (options.meta == undefined) {
            options.meta = {"Authorization": "Bearer " + ADMIN_JWT_KEY}
        } else {
            options.meta["Authorization"] = "Bearer " + ADMIN_JWT_KEY
        }

        return options
    }
}

const transport = new BearerGrpcTransport({
    host: MUDAHMAIL_HOST,
    channelCredentials: ChannelCredentials.createSsl()
})

export const client = new ServerClient(transport as any)
