"use client"

import React, {useState} from "react"
import {CardMenu} from "@/components/card"
import {ArrowSmallLeft} from "@/components/arrow"
import {PasswordInputBox, SubmissionButton} from "@/components/input"
import axios from "axios"
import {Failed} from "@/components/failed"
import {Success} from "@/components/success"
import {useParams} from "next/navigation"
import {Loading} from "@/components/loading"
import {onPasswordChange, ValidationInput} from "@/app/reset/options";

const delay = (ms: number) => new Promise(
    resolve => setTimeout(resolve, ms)
);

export default function Home() {
    const params = useParams()
    const token = params.token

    const [running, setRunning] = useState(false)
    const [verified, setVerified] = useState(false)
    const [request, setRequest] = useState(false)
    const [pending, setPendingMessage] = useState<React.JSX.Element | undefined>(undefined)
    const [result, setResultMessage] = useState<React.JSX.Element | undefined>(undefined)

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

    const call = (async () => {
        if (running) {
            return
        }

        setRunning(true)
        setPendingMessage(<span><Loading/>Please wait for a moment while we are verifying your password reset token key.</span>)

        try {
            const result = await axios.get("/api/reset?token=" + token)

            if (result.status === 200) {
                setPendingMessage(<span><Success/>Attempting to reset the password for: {result.data.email}</span>)
                setVerified(true)
                return
            }
        } catch (e) {
            setPendingMessage(<span><Failed/>The password reset token is invalid.</span>)
        }
    })

    const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        setRequest(true)

        try {
            await axios.put("/api/reset", {
                token: token,
                password: password,
            })

            setRequest(false)
            setVerified(false)
            setResultMessage(<span><Success/>Successfully reset your password.</span>)

            await delay(5 * 1000)

            window.location.href = "/"
            return;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response !== undefined) {
                let response: {
                    message: string
                } = error.response.data

                if (response.message !== undefined) {
                    setResultMessage(<span><Failed/>{response.message}</span>)
                } else if (error.response.status === 429) {
                    setResultMessage(<span><Failed/>You have sent too many requests, please wait a few minutes to continue.</span>)
                } else {
                    setResultMessage(<span><Failed/>Backend returned error code {error.response.status}</span>)
                }
            } else {
                setResultMessage(<span><Failed/>Something went wrong on the backend.</span>)
            }
        }

        setRequest(false)
    }

    if (!running) {
        call()
    }

    return (
        <CardMenu title="Reset password">
            <form className="space-y-4 md:space-y-6 group" method="post" onSubmit={(e) => onSubmitHandler(e)}>
                {(pending != undefined && (<div className="text-sm text-gray-500">{pending}</div>))}

                <PasswordInputBox onChange={(e) => {
                    onPasswordChange(e, 0, validate, password, confirmPassword, setPassword, setConfirmPassword, setValidation, setAllowed)
                }} titleName="Password" inputName="password" pattern="^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}" isDisabled={!verified} showTooltip={false}/>
                <PasswordInputBox onChange={(e) => {
                    onPasswordChange(e, 1, validate, password, confirmPassword, setPassword, setConfirmPassword, setValidation, setAllowed)
                }} titleName="Confirm Password" inputName="password-confirm" pattern="^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}" isDisabled={!verified} showTooltip={false}/>

                <div className="grid grid-flow-row auto-rows-max gap-1 mt-4 text-sm mb-2">
                    <p>{(validate.length && <Success/>) || (<Failed/>)}Minimum 8 characters long</p>
                    <p>{(validate.hasUppercase && <Success/>) || (<Failed/>)}At least one uppercase English letter</p>
                    <p>{(validate.hasLowercase && <Success/>) || (<Failed/>)}At least one lowercase English letter</p>
                    <p>{(validate.hasDigit && <Success/>) || (<Failed/>)}At least one digit</p>
                    <p>{(validate.hasSpecial && <Success/>) || (<Failed/>)}At least one special character (#?!@$%^&*)</p>
                    <p>{(validate.isMatched && <Success/>) || (<Failed/>)}Password must match</p>
                </div>

                <SubmissionButton title="Reset Password" currentState={request} isDisabled={!verified || !allowed}/>

                {(result != undefined && (<div className="text-sm text-gray-500">{result}</div>))}

                <div className="grid grid-flow-row auto-rows-max gap-1 mt-4 text-sm mb-2">
                    <a href="/" className="text-sm font-medium text-primary-600 hover:underline"><ArrowSmallLeft className="mr-2 inline"/>Return back</a>
                </div>
            </form>
        </CardMenu>
    )
}
