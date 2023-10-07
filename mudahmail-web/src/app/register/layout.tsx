import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import React from "react";
import {Session} from "next-auth";
import {getServerSession} from "next-auth/next";
import {config} from "@/app/api/auth/[...nextauth]/options";
import Provider from "@/components/Provider";

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
    title: 'MudahMail | Register',
    description: 'Register page for MudahMail dashboard',
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
