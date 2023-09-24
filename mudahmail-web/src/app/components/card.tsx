import Image from "next/image";
import React from "react";

export function CardMenu({children, title}: {
    children: React.ReactNode
    title: string
}) {
    return (
        <section className="bg-gray-50">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">
                <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900">
                    <Image
                        className="w-12 h-12 mr-2"
                        src="/MudahMail.svg"
                        alt="MudahMail logo"
                        width={350}
                        height={37}
                        priority
                    />MudahMail
                </a>
                <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                            {title}
                        </h1>

                        {children}
                    </div>
                </div>
            </div>
        </section>
    )
}