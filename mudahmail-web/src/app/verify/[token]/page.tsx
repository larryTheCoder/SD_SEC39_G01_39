"use client"

import React, {useState} from "react";
import {CardMenu} from "@/components/card";
import {useParams} from "next/navigation";
import axios from "axios";
import {Loading} from "@/components/loading";
import {Success} from "@/components/success";
import {Failed} from "@/components/failed";

export default function Home() {
    const params = useParams();
    const token = params.token;

    const [verifyStatus, setVerificationStatus] = useState(<span><Loading/>Please hold, we are verifying your email, this make take a few seconds to complete.</span>)
    const [isSuccessful, setFormStatus] = useState(true);
    const [isRunning, setIsRunning] = useState(false);

    const call = (async () => {
        if (isRunning) {
            return;
        }

        setIsRunning(true)
        try {
            const result = await axios.get("/api/verify?token=" + token)

            if (result.status === 200) {
                setVerificationStatus(<span><Success/>Your email has been successfully verified. You may return to the login page to continue accessing your devices.</span>)
            }
        } catch (e) {
            setVerificationStatus(<span><Failed/>The token you have provided is invalid, please try again later.</span>)
        }

        setFormStatus(false);
    });

    if (!isRunning) {
        call();
    }

    return (
        <CardMenu title="Email Verification">
            <div>
                <p className="block my-6 text-sm font-medium text-gray-500">
                    {verifyStatus}
                </p>

                <a href="/" className="my-2 py-2.5 disabled:pointer-events-none">
                    <button className="w-full text-white bg-primary-600 disabled:opacity-30 hover:bg-primary-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center" disabled={isSuccessful}>
                        Continue
                    </button>
                </a>
            </div>
        </CardMenu>
    )
}
