import Image from "next/image";
import React from "react";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: '404 - Not found',
    description: 'This is a little odd isn\'t it?',
}

export default function NotFound() {
    return (
        <section className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
            <div className="flex justify-center">
                <Image
                    className="content-center mx-4"
                    src="/mudahmail.svg"
                    alt="MudahMail logo"
                    width={250}
                    height={250}
                    priority
                />
            </div>
            <div className="mx-auto max-w-screen-sm text-center">
                <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-red-500">404</h1>
                <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl">Something&apos;s missing.</p>
                <p className="mb-4 text-lg font-light text-gray-500">Sorry, we can&apos;t find that page. You&apos;ll find lots to explore on the home page. </p>
                <a href="#" className="inline-flex text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center my-4">Back to Homepage</a>
            </div>
        </section>
    )
}