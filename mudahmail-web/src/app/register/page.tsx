"use client";

import React, {useState} from "react";
import {Success} from "@/components/success";
import {Failed} from "@/components/failed";
import {Loading} from "@/components/loading";
import {CardMenu} from "@/components/card";
import {SignIn} from "@/components/tooltips";
import {EmailTextBox, PasswordInputBox, SubmissionButton} from "@/components/input";
import axios from "axios";
import {onPasswordChange, ValidationInput} from "@/app/reset/options";
import delay from "@/libs/timer";

export default function Home() {
    const [animation, setAnimation] = useState({
        unverified: true,
        registerAttempt: false
    })

    const [authToken, setAuthenticationToken] = useState("")
    const [emailAddress, setEmailAddress] = useState("")

    const [allowed, setAllowed] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [validate, setValidation] = useState<ValidationInput>({
        length: false,
        hasUppercase: false,
        hasLowercase: false,
        hasDigit: false,
        hasSpecial: false,
        isMatched: false
    })

    const [output, setOutput] = useState<React.JSX.Element | undefined>(undefined)
    const [result, setResult] = useState<React.JSX.Element | undefined>(undefined)

    const onBlur = async () => {
        if (!(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).test(authToken)) {
            setOutput(<p><Failed/>Input is not a valid UUID string</p>);
            return;
        }

        // HTTP Codes:
        // 200 - OK
        // 404 - Not available
        // 403 - Forbidden

        try {
            setOutput(<p><Loading/>Validating your device identifier.</p>)

            const resultFetch = await axios.head("/api/register", {headers: {"Application-Token": authToken}});

            if (resultFetch.status === 200) {
                setOutput(<p><Success/>Successfully verified your device identifier.</p>)
                setAnimation({...animation, unverified: false})
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;

                if (status === 404) {
                    setOutput(<p className="text-red-500"><Failed/>The token could not be found.</p>)
                } else if (status == 403) {
                    setOutput(<p className="text-red-500"><Failed/>This token is being used by another user.</p>)
                } else {
                    setOutput(<p className="text-red-500"><Failed/>Something went wrong while verifying the token.</p>)
                }
            }
        }
    }

    const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setAnimation({...animation, registerAttempt: true})

        const formData = new FormData()
        formData.set("token", authToken)
        formData.set("email", emailAddress)
        formData.set("password", password)

        try {
            const response = await axios.post("/api/register", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            })

            setResult(<p className="text-gray-500"><Success/>{response.data.status}</p>)

            setAnimation({...animation, registerAttempt: false})

            await delay(5 * 1000)

            window.location.href = "/"
            return;
        } catch (e) {
            if (axios.isAxiosError(e) && e.response !== undefined && e.response.data.message) {
                setResult(<p className="text-red-500"><Failed/>{e.response.data.message}</p>)
            } else {
                setResult(<p className="text-red-500"><Failed/>Something went wrong in our backend.</p>)
            }
        }

        setAnimation({...animation, registerAttempt: false})
    }

    return (
        <CardMenu title="Create an account">
            <div>
                <label htmlFor="device-token" className="block mb-2 text-sm font-medium text-gray-900">
                    Your device identifier
                </label>

                <div className="group">
                    <input type="text" name="device-token" id="device-token"
                           onChange={(e) => {
                               setOutput(undefined)
                               setAuthenticationToken(e.target.value)
                           }}
                           onBlur={onBlur}
                           className="disabled:bg-gray-100 invalid:[&:not(:placeholder-shown):not(:focus)]:bg-red-50 border border-gray-300 invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 peer"
                           placeholder="8faaf521-123c-4a88-88c8-4cdcc6887107"
                           required={true}
                           disabled={!animation.unverified}
                           pattern="^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$">
                    </input>

                    {(output != undefined && (
                        <div className="mt-2 text-sm text-gray-500 peer-[&:invalid]:hidden">
                            {output}
                        </div>
                    ))}

                    <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block">
                            <Failed/>
                            Input is not a valid UUID string
                        </span>
                </div>

                <p className="block my-2 text-sm font-medium text-gray-500">
                    Device Identifier is a key to uniquely identify your devices, a key can be found inside
                    your instruction manual.
                </p>
            </div>

            <form className="space-y-4 md:space-y-6 group" method="post" onSubmit={onSubmitHandler} noValidate={true}>
                <EmailTextBox onChange={(email) => setEmailAddress(email)} isDisabled={animation.unverified}/>
                <PasswordInputBox onChange={(e) => {
                    onPasswordChange(e, 0, validate, password, confirmPassword, setPassword, setConfirmPassword, setValidation, setAllowed)
                }} titleName="Password" inputName="password" pattern="^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}" isDisabled={animation.unverified} showTooltip={false}/>
                <PasswordInputBox onChange={(e) => {
                    onPasswordChange(e, 1, validate, password, confirmPassword, setPassword, setConfirmPassword, setValidation, setAllowed)
                }} titleName="Confirm Password" inputName="password-confirm" pattern="^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}" isDisabled={animation.unverified} showTooltip={false}/>

                <div className="grid grid-flow-row auto-rows-max gap-1 mt-4 text-sm mb-2">
                    <p>{(validate.length && <Success/>) || (<Failed/>)}Minimum 8 characters long</p>
                    <p>{(validate.hasUppercase && <Success/>) || (<Failed/>)}At least one uppercase English letter</p>
                    <p>{(validate.hasLowercase && <Success/>) || (<Failed/>)}At least one lowercase English letter</p>
                    <p>{(validate.hasDigit && <Success/>) || (<Failed/>)}At least one digit</p>
                    <p>{(validate.hasSpecial && <Success/>) || (<Failed/>)}At least one special character (#?!@$%^&*)</p>
                    <p>{(validate.isMatched && <Success/>) || (<Failed/>)}Password must match</p>
                </div>

                <SubmissionButton title="Create account" currentState={animation.registerAttempt} isDisabled={animation.unverified || !allowed}/>

                {result === undefined ? <></> : (
                    <div className="mt-2 text-sm">
                        {result}
                    </div>
                )}

                <SignIn/>
            </form>
        </CardMenu>
    )
}
