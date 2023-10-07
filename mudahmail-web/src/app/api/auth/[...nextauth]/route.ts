import NextAuth from "next-auth"
import {config} from './options'

export const handling = NextAuth(config)

export {handling as GET, handling as POST}