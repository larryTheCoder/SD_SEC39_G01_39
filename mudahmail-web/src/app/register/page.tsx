"use client";

import Image from 'next/image'
import React, {useState} from "react";
import {Success} from "@/app/components/success";
import {Failed} from "@/app/components/failed";
import {Loading} from "@/app/components/loading";
import {CardMenu} from "@/app/components/card";
import {SignIn} from "@/app/components/tooltips";
import {EmailTextBox, PasswordInputBox, SubmissionButton} from "@/app/components/input";

export default function Home() {
    const [animation, setAnimation] = useState({
        unverified: true,
        registerAttempt: false
    })

    const [validate, setMinimumLength] = useState({
        length: false,
        hasUppercase: false,
        hasLowercase: false,
        hasDigit: false,
        hasSpecial: false,
        isMatched: false
    })

    const [registrationData, setRegistrationData] = useState({
        authToken: "",
        emailAddress: "",
        password: "",
        confirmPassword: ""
    })

    const [output, setOutput] = useState<{
        formOutput?: React.JSX.Element
    }>()

    const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        console.log("Token:" + registrationData.authToken)
        console.log("Email:" + registrationData.emailAddress)
        console.log("Password:" + registrationData.password)
        console.log("Password:" + registrationData.confirmPassword)
    }

    const onBlur = () => {
        // Verify token here.

        if (!(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).test(registrationData.authToken)) {
            setOutput({formOutput: undefined});
            return;
        }

        // 0 - Validating token
        // 1 - Token is not used by anyone
        // 2 - Token is being used by another user
        // 3 - Token is not available.
        const modeToken: number = 2;

        switch (modeToken) {
            case 0:
                setOutput({formOutput: (<p><Loading/>Validating your device identifier.</p>)})
                break;
            case 1:
                setOutput({formOutput: (<p><Success/>Successfully verified your device identifier.</p>)})
                break;
            case 2:
                setOutput({formOutput: (<p className="text-red-500"><Failed/>This token is being used by another user.</p>)})
                break;
            case 3:
                setOutput({formOutput: (<p className="text-red-500"><Failed/>The token could not be found.</p>)})
                break;

        }
    }

    return (
        <CardMenu title="Create an account">
            <form className="space-y-4 md:space-y-6 group" method="post" onSubmit={onSubmitHandler} noValidate={true}>
                <div>
                    <label htmlFor="device-token" className="block mb-2 text-sm font-medium text-gray-900">
                        Your device identifier
                    </label>

                    <input type="text" name="device-token" id="device-token"
                           onChange={(e) => setRegistrationData({...registrationData, authToken: e.target.value})}
                           onBlur={onBlur}
                           className="invalid:[&:not(:placeholder-shown):not(:focus)]:bg-red-50 border border-gray-300 invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 peer"
                           placeholder="8faaf521-123c-4a88-88c8-4cdcc6887107"
                           required={true}
                           pattern="^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$">
                    </input>

                    {(output?.formOutput != undefined && (
                        <div className="mt-2 text-sm text-gray-500 peer-[&:invalid]:hidden">
                            {output.formOutput}
                        </div>
                    ))}

                    <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block">
                        <Failed/>
                        Input is not a valid UUID string
                    </span>

                    <p className="block my-2 text-sm font-medium text-gray-500">
                        Device Identifier is a key to uniquely identify your devices, a key can be found inside
                        your instruction manual.
                    </p>
                </div>

                <EmailTextBox onChange={(email) => setRegistrationData({...registrationData, emailAddress: email})} isDisabled={animation.unverified}/>
                <PasswordInputBox onChange={(password) => setRegistrationData({...registrationData, password: password})} titleName="Password" inputName="password" pattern="^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}" isDisabled={animation.unverified} showTooltip={false}/>
                <PasswordInputBox onChange={(password) => setRegistrationData({...registrationData, confirmPassword: password})} titleName="Confirm Password" inputName="password-confirm" pattern="^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}" isDisabled={animation.unverified} showTooltip={false}/>

                <div className="grid grid-flow-row auto-rows-max gap-1 mt-4 text-sm mb-2">
                    <p>{(validate.length && <Success/>) || (<Failed/>)}Minimum 8 characters long</p>
                    <p>{(validate.hasUppercase && <Success/>) || (<Failed/>)}At least one uppercase English letter</p>
                    <p>{(validate.hasLowercase && <Success/>) || (<Failed/>)}At least one lowercase English letter</p>
                    <p>{(validate.hasDigit && <Success/>) || (<Failed/>)}At least one digit</p>
                    <p>{(validate.hasSpecial && <Success/>) || (<Failed/>)}At least one special character (#?!@$%^&*)</p>
                    <p>{(validate.isMatched && <Success/>) || (<Failed/>)}Password must match</p>
                </div>

                <SubmissionButton title="Create account" currentState={animation.registerAttempt}/>

                <SignIn/>
            </form>
        </CardMenu>
    )
}
