"use client";

import React, {useState} from "react";
import {CardMenu} from '@/app/components/card';
import {SignUp} from "@/app/components/tooltips";
import {EmailTextBox, PasswordInputBox, SubmissionButton} from "@/app/components/input";
import {signIn} from "next-auth/react";
import {getDeploymentUrl} from "@/libs/util";

export default function Home() {
    const [loginState, setLoginState] = useState(false)
    const [loginFailed, setLoginFailed] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false
    })

    const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setLoginState(true)

        const result = await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false
        });

        if (result === undefined || result.error !== null) {
            setLoginFailed(true)
        } else {
            window.location.href = getDeploymentUrl() + "/dashboard"
            return
        }

        setLoginState(false)
    }

    return (
        <CardMenu title="Sign in to your account">
            <form className="space-y-4 md:space-y-6 group" method="post" onSubmit={onSubmitHandler} noValidate={true}>
                <EmailTextBox onChange={(e) => {
                    setFormData({...formData, email: e})
                    setLoginFailed(false)
                }} isDisabled={false}/>
                <PasswordInputBox onChange={(e) => {
                    setFormData({...formData, password: e})
                    setLoginFailed(false)
                }} pattern=".{8,}" showTooltip={true} isDisabled={false} inputName="password" titleName="Password" showInvalidLogin={loginFailed}/>

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
