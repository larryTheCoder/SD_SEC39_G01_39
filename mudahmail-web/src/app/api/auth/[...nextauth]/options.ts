import CredentialsProvider from "next-auth/providers/credentials";
import {client, prisma} from "@/libs/database";
import {NextAuthOptions, Session} from "next-auth";
import {JWT} from "next-auth/jwt";
import {AdapterUser} from "next-auth/adapters";
import {Role} from "@/interface";
import {S3_BUCKET, S3_HOST} from "@/libs/config";
import bcrypt from "bcrypt";

const emailRegex = (/.[A-Z0-9._%+\-]{1,16}.@.[A-Z0-9.\-]{1,16}.[.].[A-Z]+/i)
const passwordRegex = (/.{8,}/)

export const config: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {label: "Email", type: "email", placeholder: "username@gmail.com"},
                password: {label: "Password", type: "password"},
            },
            async authorize(credentials) {
                if (credentials === undefined) {
                    return null;
                }

                if (!emailRegex.test(credentials.email) || !passwordRegex.test(credentials.password)) {
                    return null;
                }

                let userData = await prisma.userData.findFirst({
                    where: {AND: [{email: credentials.email}]},
                    select: {password: true, userSnowflake: true, email: true, isAdmin: true, userPicturePath: true}
                });

                if (userData !== null && await bcrypt.compare(credentials.password, userData.password)) {
                    const data = {email: userData.email, profile: userData.userPicturePath, role: userData.isAdmin}
                    await client.set(`user_data:${userData.userSnowflake}`, JSON.stringify(data))

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
                token.id = user.id;

                await doesThings(token);
            }
            return token;
        },
        async session({session: session, token, user}: {
            session: Session,
            token: JWT,
            user: AdapterUser
        }) {
            if (session.user) {
                await doesThings(token);

                session.user.role = token.role;
                session.user.image = token.picture;
            }

            return session;
        }
    }
}

async function doesThings(token: JWT) {
    if (token.id) {
        const userData = await client.get(`user_data:${token.id}`);

        if (userData !== null) {
            const user = JSON.parse(userData)

            if (user.profile && user.profile.length > 0) {
                token.picture = "https://" + S3_BUCKET + "." + S3_HOST + "/" + user.profile;
            } else {
                token.picture = "/default-profile.png";
            }

            token.email = user.email;
            token.role = user.isAdmin ? Role.admin : Role.user;
        } else {
            token.role = Role.user;
        }
    }
}