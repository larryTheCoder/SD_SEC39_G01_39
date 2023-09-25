"use client";

import React, {useState} from "react";
import {CardMenu} from "@/app/components/card";
import {Failed} from "@/app/components/failed";
import {ArrowSmallLeft} from "@/app/icons/arrow";
import {EmailTextBox} from "@/app/components/input";

export default function Home() {
    const [emailHandler, setEmail] = useState("")

    const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        console.log("Email:" + emailHandler)
    }

    const handleInputChange = (setFunction: React.Dispatch<React.SetStateAction<any>>, event: React.ChangeEvent<HTMLInputElement>) => {
        setFunction(event.target.value)

        const errMsg = document.getElementById("errorMessage")

        errMsg?.setAttribute('hidden', 'true');
    }

    return (
        <CardMenu title="Reset password">
            <form className="space-y-4 md:space-y-6 group" method="post" onSubmit={onSubmitHandler}>
                <EmailTextBox onChange={(e) => setEmail(e) } isDisabled={false}/>

                <button type="submit" className="w-full text-white bg-primary-600 group-invalid:pointer-events-none group-invalid:opacity-30 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                    Request password reset
                </button>

                <div className="grid grid-flow-row auto-rows-max gap-1 mt-4 text-sm mb-2">
                    <a href="/" className="text-sm font-medium text-primary-600 hover:underline"><ArrowSmallLeft className="mr-2 inline"/>Return back</a>
                </div>
            </form>
        </CardMenu>
    )
}
