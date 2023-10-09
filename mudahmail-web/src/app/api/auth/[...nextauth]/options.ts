import CredentialsProvider from "next-auth/providers/credentials";
import {bcrypt, prisma} from "@/libs/database";
import {NextAuthOptions, Session} from "next-auth";
import {JWT} from "next-auth/jwt";
import {AdapterUser} from "next-auth/adapters";
import {Role} from "@/interface";
import {GetObjectCommand} from "@aws-sdk/client-s3";
import {s3, S3_BUCKET} from "@/libs/s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

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
        const userData = await prisma.userData.findFirst({
            where: {userSnowflake: token.id}
        })

        if (userData !== null) {
            if (userData.userPicturePath !== null && userData.userPicturePath.length > 0) {
                const command = new GetObjectCommand({Bucket: S3_BUCKET, Key: userData.userPicturePath});

                token.picture = await getSignedUrl(s3, command, {expiresIn: 3600});
            } else {
                token.picture = null;
            }

            token.email = userData.email;
            token.role = userData.isAdmin ? Role.admin : Role.user;
        } else {
            token.role = Role.user;
        }
    }
}