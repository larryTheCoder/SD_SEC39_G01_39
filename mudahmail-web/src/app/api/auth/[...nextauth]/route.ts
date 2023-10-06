import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import {bcrypt, prisma} from "@/libs/database";

const emailRegex = (/.[A-Z0-9._%+\-]{1,16}.@.[A-Z0-9.\-]{1,16}.[.].[A-Z]+/i)
const passwordRegex = (/.{8,}/)

export const handling = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {label: "Email", type: "email", placeholder: "username@gmail.com"},
                password: {label: "Password", type: "password"},
            },
            async authorize(credentials, req) {
                if (credentials === undefined) {
                    return null;
                }

                if (!emailRegex.test(credentials.email) || !passwordRegex.test(credentials.password)) {
                    return null;
                }

                let userData = await prisma.userData.findFirst({
                    where: {AND: [{email: credentials.email}]},
                    select: {password: true, userSnowflake: true, email: true}
                });

                if (userData !== null && await bcrypt.compare(credentials.password, userData.password, false)) {
                    return {email: userData.email, id: userData.userSnowflake}
                }

                return null;
            },
        }),
    ],
    pages: {
        signIn: "/",
    }
})

export {handling as GET, handling as POST}