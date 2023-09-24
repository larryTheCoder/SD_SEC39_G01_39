"use client";
import React, {useState} from "react";
import {CardMenu} from '@/app/components/card';
import {SignUp} from "@/app/components/tooltips";

export default function Home() {
    const [emailHandler, email] = useState("")
    const [passwordHandler, password] = useState("")
    const [rememberState, remember] = useState(false)

    const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        console.log("Email:" + emailHandler)
        console.log("Password:" + passwordHandler)
        console.log("Remember:" + rememberState)
    }

    const handleInputChange = (setFunction: React.Dispatch<React.SetStateAction<any>>, event: React.ChangeEvent<HTMLInputElement>) => {
        setFunction(event.target.value)

        const errMsg = document.getElementById("errorMessage")

        errMsg?.setAttribute('hidden', 'true');
    }

    const handleCheckClick = () => {
        remember(!rememberState)
    }

    return (
        <CardMenu title="Sign in to your account">
            <form className="space-y-4 md:space-y-6 group" method="post" onSubmit={onSubmitHandler} noValidate={true}>

                {/* Email address field */}

                <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                        Your email
                    </label>
                    <input type="email" name="email" id="email"
                           onChange={(e) => handleInputChange(email, e)}
                           className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 peer"
                           placeholder="name@gmail.com"
                           required={true}
                           pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    />
                    <span
                        className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block">
                                    Please enter a valid email address
                                </span>
                </div>

                {/* Password field */}

                <div>
                    <label htmlFor="password"
                           className="block mb-2 text-sm font-medium text-gray-900">Password</label>
                    <input type="password" name="password" id="password" placeholder="•••••••••••••"
                           onChange={(e) => handleInputChange(password, e)}
                           className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 peer"
                           required={true}
                           pattern=".{8,}"/>
                    <span
                        className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block">
                                    Your password must be at least 8 characters long
                                </span>
                </div>

                {/* Remember me and Forgot password button */}

                <div className="flex items-center justify-between">
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input id="remember" aria-describedby="remember" type="checkbox"
                                   onChange={(e) => handleCheckClick()}
                                   className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
                                   required={false}/>
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="remember" className="text-gray-500">Remember me</label>
                        </div>
                    </div>
                    <a href="#" className="text-sm font-medium text-primary-600 hover:underline">
                        Forgot password?
                    </a>
                </div>

                {/* Sign in button */}

                <button type="submit"
                        className="w-full text-white bg-primary-600 group-invalid:pointer-events-none group-invalid:opacity-30 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                    Sign in
                </button>

                {/* Registration button */}

                <SignUp/>
            </form>
        </CardMenu>
    )
}
