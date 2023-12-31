import './globals.css'

import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import React from "react";
import {getDeploymentUrl} from "@/libs/util";
import type {Session} from "next-auth";
import {getServerSession} from "next-auth/next";
import Provider from "@/components/Provider";
import {config} from "@/app/api/auth/[...nextauth]/options";

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
    const session: Session | null = await getServerSession(config)

    return (
        <html lang="en">
        <body className={inter.className}><Provider session={session}>{children}</Provider></body>
        </html>
    )
}
