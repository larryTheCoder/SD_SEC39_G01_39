import './globals.css'

import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import React from "react";

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
    title: 'Login',
    description: 'Login page for MudahMail dashboard',
    metadataBase: new URL("https://mudahmail.vercel.app/"),
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
