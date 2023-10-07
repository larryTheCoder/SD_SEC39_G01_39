import NextAuth, {Session} from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import {bcrypt, prisma} from "@/libs/database";
import {Role} from "@/interface";
import {JWT} from "next-auth/jwt";
import {AdapterUser} from "next-auth/adapters";

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
                    select: {password: true, userSnowflake: true, email: true, isAdmin: true}
                });

                if (userData !== null && await bcrypt.compare(credentials.password, userData.password, false)) {
                    return {email: userData.email, id: userData.userSnowflake, role: userData.isAdmin ? Role.admin : Role.user}
                }

                return null;
            },
        }),
    ],
    pages: {
        signIn: "/",
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60
    },
    callbacks: {
        async jwt({token, user}) {
            if (user) {
                if (token.email) {
                    const userData = await prisma.userData.findFirst({
                        where: {email: token.email}
                    })

                    if (userData !== null) {
                        token.role = userData.isAdmin ? Role.admin : Role.user;
                    } else {
                        token.role = user.role;
                    }
                }

                token.id = user.id;
            }
            return token;
        },
        async session({session: session, token, user}: {
            session: Session,
            token: JWT,
            user: AdapterUser
        }) {
            if (session.user) {
                // HAHAHAHAHA I AM TIRED OF THIS ALREADY LMAOOO
                if (token.email) {
                    const userData = await prisma.userData.findFirst({
                        where: {email: token.email}
                    })

                    if (userData !== null) {
                        token.role = userData.isAdmin ? Role.admin : Role.user;
                    } else {
                        token.role = user.role;
                    }
                }

                session.user.role = token.role;
                session.user.id = token.id;
            }

            return session;
        }
    }
})

export {handling as GET, handling as POST}