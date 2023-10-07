"use client"

import React, {useState} from "react"
import {CardMenu} from "@/components/card"
import {ArrowSmallLeft} from "@/components/arrow"
import {EmailTextBox, SubmissionButton} from "@/components/input"
import axios from "axios"
import {Failed} from "@/components/failed"
import {Success} from "@/components/success"

export default function Home() {
    const [pending, setPending] = useState(false)
    const [email, setEmail] = useState("")
    const [output, setOutput] = useState<React.JSX.Element | undefined>(undefined)

    const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        setPending(true)

        try {
            await axios.post("/api/reset", email)

            setOutput(<span><Success/>Successfully sent a password reset request to the email.</span>)
        } catch (error) {
            if (axios.isAxiosError(error) && error.response !== undefined) {
                let response: {
                    message: string
                } = error.response.data

                if (response.message !== undefined) {
                    setOutput(<span><Failed/>{response.message}</span>)
                } else if (error.response.status === 429) {
                    setOutput(<span><Failed/>You have sent too many requests, please wait a few minutes to continue.</span>)
                } else {
                    setOutput(<span><Failed/>Backend returned error code {error.response.status}</span>)
                }
            } else {
                setOutput(<span><Failed/>Something went wrong on the backend.</span>)
            }
        }

        setPending(false)
    }

    return (
        <CardMenu title="Reset password">
            <form className="space-y-4 md:space-y-6 group" method="post" onSubmit={onSubmitHandler}>
                <EmailTextBox onChange={(e) => {
                    setEmail(e)
                    setOutput(undefined)
                }} isDisabled={false}/>

                <SubmissionButton title="Request password reset" currentState={pending}/>

                {(output != undefined && (<div className="text-sm text-gray-500 peer-[&:invalid]:hidden">{output}</div>))}

                <div className="grid grid-flow-row auto-rows-max gap-1 mt-4 text-sm mb-2">
                    <a href="/" className="text-sm font-medium text-primary-600 hover:underline"><ArrowSmallLeft className="mr-2 inline"/>Return back</a>
                </div>
            </form>
        </CardMenu>
    )
}
