import NextAuth from "next-auth"
import {config} from './options'

// @ts-ignore
export const handling: never  = NextAuth(config)

export {handling as GET, handling as POST}