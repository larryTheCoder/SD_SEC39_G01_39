import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import React from "react";
import {getDeploymentUrl} from "@/libs/util";

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
    title: 'Mudahmail | Dashboard',
    description: 'Mudahmail dashboard',
    metadataBase: new URL(getDeploymentUrl()),
    openGraph: {
        type: "website",
        title: "MudahMail Login Dashboard",
        description: "One stop smart mailbox solution"
    }
}

export default function RootLayout({children}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={inter.className}>{children}</body>
        </html>
    )
}
