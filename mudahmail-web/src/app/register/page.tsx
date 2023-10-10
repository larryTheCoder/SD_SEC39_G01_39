"use client";

import React, {useState} from "react";
import {Success} from "@/components/success";
import {Failed} from "@/components/failed";
import {Loading} from "@/components/loading";
import {CardMenu} from "@/components/card";
import {SignIn} from "@/components/tooltips";
import {EmailTextBox, PasswordInputBox, SubmissionButton} from "@/components/input";
import axios from "axios";

export default function Home() {
    const [animation, setAnimation] = useState({
        unverified: true,
        registerAttempt: false
    })

    const [registrationData, setRegistrationData] = useState({
        authToken: "",
        emailAddress: "",
        password: ""
    })

    const [output, setOutput] = useState<React.JSX.Element | undefined>(undefined)
    const [result, setResult] = useState<React.JSX.Element | undefined>(undefined)

    const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setAnimation({...animation, registerAttempt: true})

        try {
            const response = await axios.post("/api/register", registrationData)

            setResult(<p className="text-gray-500"><Success/>{response.data.status}</p>)
        } catch (e) {
            if (axios.isAxiosError(e) && e.response !== undefined) {
                setResult(<p className="text-red-500"><Failed/>{e.response.data.message}</p>)
            } else {
                setResult(<p className="text-red-500"><Failed/>Something went terribly wrong...</p>)
            }
        }

        setAnimation({...animation, registerAttempt: false})
    }

    const [allowed, setAllowed] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [validate, setValidation] = useState({
        length: false,
        hasUppercase: false,
        hasLowercase: false,
        hasDigit: false,
        hasSpecial: false,
        isMatched: false
    })

    const onPasswordChange = (passChange: string, state: number) => {
        if (state === 0) {
            setPassword(passChange)
        } else if (state === 1) {
            setConfirmPassword(passChange)
        }

        let validPassword = (/.{8,}/).test(passChange)
        let length = validate.length
        let hasUppercase = validate.hasUppercase
        let hasLowercase = validate.hasLowercase
        let hasDigit = validate.hasDigit
        let hasSpecial = validate.hasSpecial
        let isMatched = validate.isMatched

        if (state === 0) {
            length = (/.{8,}/).test(passChange)
            hasUppercase = (/(?=.*?[A-Z])/).test(passChange)
            hasLowercase = (/(?=.*?[a-z])/).test(passChange)
            hasDigit = (/(?=.*?[0-9])/).test(passChange)
            hasSpecial = (/(?=.*?[#?!@$%^&*\-])/).test(passChange)
            isMatched = passChange === confirmPassword

            setValidation({
                ...validate,
                length: length,
                hasUppercase: hasUppercase,
                hasLowercase: hasLowercase,
                hasDigit: hasDigit,
                hasSpecial: hasSpecial,
                isMatched: isMatched
            })

            setRegistrationData({
                ...registrationData,
                password: passChange
            })
        } else if (state === 1) {
            isMatched = passChange === password

            setValidation({
                ...validate,
                isMatched: isMatched
            })
        }

        setAllowed(validPassword && length && hasUppercase && hasLowercase && hasDigit && hasSpecial && isMatched)
    }

    const onBlur = async () => {
        if (!(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).test(registrationData.authToken)) {
            setOutput(<p><Failed/>Input is not a valid UUID string</p>);
            return;
        }

        // HTTP Codes:
        // 200 - OK
        // 404 - Not available
        // 403 - Forbidden

        try {
            setOutput(<p><Loading/>Validating your device identifier.</p>)

            const resultFetch = await axios.head("/api/register", {headers: {"Application-Token": registrationData.authToken}});

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
                               setRegistrationData({...registrationData, authToken: e.target.value})
                           }}
                           onBlur={onBlur}
                           className="invalid:[&:not(:placeholder-shown):not(:focus)]:bg-red-50 border border-gray-300 invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 peer"
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
                <EmailTextBox onChange={(email) => setRegistrationData({...registrationData, emailAddress: email})} isDisabled={animation.unverified}/>
                <PasswordInputBox onChange={(password) => {
                    onPasswordChange(password, 0)
                }} titleName="Password" inputName="password" pattern="^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}" isDisabled={animation.unverified} showTooltip={false}/>
                <PasswordInputBox onChange={(password) => {
                    onPasswordChange(password, 1)
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
