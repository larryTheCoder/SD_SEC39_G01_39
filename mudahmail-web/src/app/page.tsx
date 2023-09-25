"use client";

import React, {useState} from "react";
import {CardMenu} from '@/app/components/card';
import {SignUp} from "@/app/components/tooltips";
import {Failed} from "@/app/components/failed";
import {EmailTextBox, PasswordInputBox, SubmissionButton} from "@/app/components/input";

export default function Home() {
    const [loginState, setLoginState] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false
    })

    const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
        console.log("Email: " + formData.email)
        console.log("Password: " + formData.password)
        console.log("Remember: " + formData.remember)

        setLoginState(true)
    }

    return (
        <CardMenu title="Sign in to your account">
            <form className="space-y-4 md:space-y-6 group" method="post" onSubmit={onSubmitHandler} noValidate={true}>
                <EmailTextBox onChange={(e) => setFormData({...formData, email: e})}/>
                <PasswordInputBox onChange={(e) => setFormData({...formData, password: e})} pattern=".{8,}" showTooltip={true} isDisabled={false} inputName="password" titleName="Password"/>

                {/* Remember me and Forgot password button */}

                <div className="flex items-center justify-between">
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input id="remember" aria-describedby="remember" type="checkbox"
                                   onChange={() => setFormData({...formData, remember: !formData.remember})}
                                   className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
                                   required={false}/>
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="remember" className="text-gray-500">Remember me</label>
                        </div>
                    </div>
                    <a href="/reset" className="text-sm font-medium text-primary-600 hover:underline">
                        Forgot password?
                    </a>
                </div>

                <SubmissionButton title="Sign in" currentState={loginState}/>
                <SignUp/>
            </form>
        </CardMenu>
    )
}
