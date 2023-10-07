import './globals.css'

import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import React from "react";
import {getDeploymentUrl} from "@/libs/util";
import {Session} from "next-auth";
import {getServerSession} from "next-auth/next";
import {handling} from "@/app/api/auth/[...nextauth]/route";
import {prisma} from "@/libs/database";
import {Role} from "@/interface";
import Provider from "@/app/components/Provider";

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
    title: 'MudahMail | Login',
    description: 'Login page for MudahMail dashboard',
    metadataBase: new URL(getDeploymentUrl()),
    openGraph: {
        type: "website",
        title: "MudahMail Login Dashboard",
        description: "One stop smart mailbox solution"
    }
}

export default async function RootLayout({children}: {
    children: React.ReactNode
}) {
    const session: Session | null = await getServerSession(handling)

    // Fuck this shit im out.
    if (session !== null && typeof session.user?.email === "string") {
        const userData = await prisma.userData.findFirst({
            where: {email: session.user?.email}
        })

        if (userData !== null) {
            session.user.role = userData.isAdmin ? Role.admin : Role.user;
        }
    }

    return (
        <html lang="en">
        <body className={inter.className}>
        <Provider session={session}>{children}</Provider>
        </body>
        </html>
    )
}
