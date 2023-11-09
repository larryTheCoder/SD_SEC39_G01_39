import {ChannelCredentials} from '@grpc/grpc-js'
import {GrpcTransport} from '@protobuf-ts/grpc-transport'
import {MUDAHMAIL_HOST} from "@/libs/config";
import {ServerClient} from "@/common/service/mailbox.client";

const transport = new GrpcTransport({host: MUDAHMAIL_HOST, channelCredentials: ChannelCredentials.createSsl()})

export const client = new ServerClient(transport as any)
