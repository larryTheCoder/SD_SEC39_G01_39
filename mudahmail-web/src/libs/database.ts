import {PrismaClient} from "@prisma/client";
import Redis from "ioredis";
import {REDIS_URL} from "@/libs/config";
import {ServerClient} from "@/common/service/mailbox.client";

export const prisma = new PrismaClient()
export const client = new Redis(REDIS_URL)