"use client";

import Image from 'next/image'
import React, {useState} from "react";
import {Success} from "@/app/components/success";
import {Failed} from "@/app/components/failed";
import {Loading} from "@/app/components/loading";
import {CardMenu} from "@/app/components/card";
import {SignIn} from "@/app/components/tooltips";

export default function Home() {
    const [animation, setAnimation] = useState({
        loading: false,
        success: false
    })
    const [validate, setMinimumLength] = useState({
        length: false,
        hasUppercase: false,
        hasLowercase: false,
        hasDigit: false,
        hasSpecial: false,
        isMatched: false
    })

    const [emailHandler, email] = useState("")
    const [passwordHandler, password] = useState("")

    const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        console.log("Email:" + emailHandler)
        console.log("Password:" + passwordHandler)
    }

    const handleInputChange = (setFunction: React.Dispatch<React.SetStateAction<any>>, event: React.ChangeEvent<HTMLInputElement>) => {
        setFunction(event.target.value)
    }

    return (
        <CardMenu title="Create an account">
            <form className="space-y-4 md:space-y-6" method="post" onSubmit={onSubmitHandler}>
                {/* Device token to authenticate user */}

                <div>
                    <label htmlFor="device-token" className="block mb-2 text-sm font-medium text-gray-900">Your
                        device identifier</label>
                    <input type="text" name="device-token" id="device-token"
                           onChange={(e) => handleInputChange(email, e)}
                           className="disabled:bg-gray-200 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                           placeholder="8faaf521-123c-4a88-88c8-4cdcc6887107" required={true}>
                    </input>
                    <p className="block my-2 text-sm font-medium text-gray-500">Device Identifier is a key
                        to to uniquely identify your devices, a key can be found inside your instruction
                        manual.</p>
                </div>

                {/* Email address for the user to login */}

                <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Your
                        email</label>
                    <input type="email" name="email" id="email"
                           onChange={(e) => handleInputChange(email, e)}
                           className="disabled:bg-gray-200 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                           placeholder="name@company.com" required={true} disabled={true}/>
                </div>

                {/* Password for user to key in */}

                <div>
                    <label htmlFor="password"
                           className="block mb-2 text-sm font-medium text-gray-900">Password</label>
                    <input type="password" name="password" id="password" placeholder="•••••••••••••"
                           onChange={(e) => handleInputChange(password, e)}
                           className="disabled:bg-gray-200 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                           required={true} disabled={true}/>
                </div>

                {/* Password confirmation */}

                <div>
                    <label htmlFor="confirm-password"
                           className="block mb-2 text-sm font-medium text-gray-900">Confirm Password</label>

                    <input type="password" name="confirm-password" id="confirm-password" placeholder="•••••••••••••"
                           onChange={(e) => handleInputChange(password, e)}
                           className="disabled:bg-gray-200 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                           required={true} disabled={true}/>

                </div>

                {/* Password validation */}

                <div className="grid grid-flow-row auto-rows-max gap-1 mt-4 text-sm mb-2">
                    <p>{(validate.length && <Success/>) || (<Failed/>)}Minimum 8 characters long</p>
                    <p>{(validate.hasUppercase && <Success/>) || (<Failed/>)}At least one uppercase English letter</p>
                    <p>{(validate.hasLowercase && <Success/>) || (<Failed/>)}At least one lowercase English letter</p>
                    <p>{(validate.hasDigit && <Success/>) || (<Failed/>)}At least one digit</p>
                    <p>{(validate.hasSpecial && <Success/>) || (<Failed/>)}At least one special character (#?!@$%^&*)</p>
                    <p>{(validate.isMatched && <Success/>) || (<Failed/>)}Password must match</p>
                </div>

                {/* Submission button */}

                <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                    {(animation.loading && <Loading/>) || (animation.success && <Success/>)}

                    Create account
                </button>

                {/* Already have an account button */}

                <SignIn/>
            </form>
        </CardMenu>
    )
}
