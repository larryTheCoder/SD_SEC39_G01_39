"use client";

import Image from 'next/image'
import React, {useState} from "react";
import {CardMenu} from "@/app/components/card";

export default function Home() {
    const [emailHandler, email] = useState("")

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
            <form className="space-y-4 md:space-y-6" method="post" onSubmit={onSubmitHandler}>
                <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                        Your email
                    </label>
                    <input type="email" name="email" id="email"
                           onChange={(e) => handleInputChange(email, e)}
                           className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                           placeholder="name@company.com" required={true}/>
                </div>
                <button type="submit"
                        className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                    Request password reset
                </button>
            </form>
        </CardMenu>
    )
}
