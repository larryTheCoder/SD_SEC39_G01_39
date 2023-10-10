import React, {useState} from "react"
import {Success} from "@/components/success"
import {Failed} from "@/components/failed"
import axios from "axios";

export function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [allowed, setAllowed] = useState(false)
    const [result, setResult] = useState(<></>)

    const [validate, setValidation] = useState({
        length: false,
        hasUppercase: false,
        hasLowercase: false,
        hasDigit: false,
        hasSpecial: false,
        isMatched: false
    })

    const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>, state: number) => {
        const input = event.target.value

        switch (state) {
            case 0:
                setCurrentPassword(input)
                break
            case 1:
                setNewPassword(input)
                break
            case 2:
                setConfirmPassword(input)
                break;
        }

        let validPassword = (/.{8,}/).test(currentPassword)
        let length = validate.length
        let hasUppercase = validate.hasUppercase
        let hasLowercase = validate.hasLowercase
        let hasDigit = validate.hasDigit
        let hasSpecial = validate.hasSpecial
        let isMatched = validate.isMatched

        if (state === 1) {
            length = (/.{8,}/).test(input)
            hasUppercase = (/(?=.*?[A-Z])/).test(input)
            hasLowercase = (/(?=.*?[a-z])/).test(input)
            hasDigit = (/(?=.*?[0-9])/).test(input)
            hasSpecial = (/(?=.*?[#?!@$%^&*\-])/).test(input)
            isMatched = confirmPassword === input

            setValidation({
                ...validate,
                length: length,
                hasUppercase: hasUppercase,
                hasLowercase: hasLowercase,
                hasDigit: hasDigit,
                hasSpecial: hasSpecial,
                isMatched: isMatched
            })
        } else if (state === 2) {
            isMatched = newPassword === input

            setValidation({
                ...validate,
                isMatched: isMatched
            })
        }

        setResult(<></>)
        setAllowed(validPassword && length && hasUppercase && hasLowercase && hasDigit && hasSpecial && isMatched)
    }

    const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        setLoading(true)

        const formData = new FormData()
        formData.set("type", "password_change")
        formData.set("current_password", currentPassword)
        formData.set("new_password", newPassword)

        try {
            await axios.put('/api/update', formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            })
        } catch (error) {
            if (axios.isAxiosError(error) && error.response !== undefined) {
                const response = error.response;

                setResult(<p className="mt-2 text-sm text-red-500"><Failed/>{response.data.message}</p>)
            } else {
                setResult(<p className="mt-2 text-sm text-red-500"><Failed/>Something went wrong in the backend.</p>)
            }
        }

        setLoading(false)
    }

    return (
        <>
            <h3 className="mb-4 text-xl font-semibold">Password information</h3>
            <form className="group" method="post" onSubmit={onSubmitHandler} noValidate={true}>
                <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-6">
                        <label htmlFor="current-password" className="block mb-2 text-sm font-medium text-gray-900">Current password</label>
                        <input type="password" name="current-password" id="current-password" className="shadow-sm bg-gray-50 border border-gray-300 invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 peer" placeholder="•••••••••••••" pattern=".{8,}" required onChange={(e) => {
                            onPasswordChange(e, 0)
                        }}/>
                        <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block">
                            <Failed/>Your password must be at least 8 characters long
                        </span>

                        {result}
                    </div>
                    <div className="col-span-6 sm:col-span-6">
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">New password</label>
                        <input data-popover-target="popover-password" data-popover-placement="bottom" type="password" id="password" className="bg-gray-50 border border-gray-300 invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 peer" placeholder="•••••••••••••" pattern="^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}" required onChange={(e) => {
                            onPasswordChange(e, 1)
                        }}/>
                    </div>
                    <div className="col-span-6 sm:col-span-6">
                        <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-gray-900">Confirm password</label>
                        <input type="password" name="confirm-password" id="confirm-password" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 peer" placeholder="•••••••••••••" pattern="^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}" required onChange={(e) => {
                            onPasswordChange(e, 2)
                        }}/>
                    </div>

                    <div className="col-span-6">
                        <div className="grid grid-flow-row gap-1 text-sm">
                            <p>{(validate.length && <Success/>) || (<Failed/>)}Minimum 8 characters long</p>
                            <p>{(validate.hasUppercase && <Success/>) || (<Failed/>)}At least one uppercase English letter</p>
                            <p>{(validate.hasLowercase && <Success/>) || (<Failed/>)}At least one lowercase English letter</p>
                            <p>{(validate.hasDigit && <Success/>) || (<Failed/>)}At least one digit</p>
                            <p>{(validate.hasSpecial && <Success/>) || (<Failed/>)}At least one special character (#?!@$%^&*)</p>
                            <p>{(validate.isMatched && <Success/>) || (<Failed/>)}Password must match</p>
                        </div>
                    </div>

                    <div className="col-span-6 sm:col-full">
                        <button className="inline-flex items-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-30 disabled:pointer-events-none group-invalid:pointer-events-none group-invalid:opacity-30" type="submit" disabled={!allowed}>
                            {loading ? (
                                <svg aria-hidden={false} role="status" className="w-4 h-4 mr-2 -ml-1 animate-spin" viewBox="0 0 100 100" fill="none">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentColor"/>
                                </svg>
                            ) : (<></>)
                            }
                            Save all
                        </button>
                    </div>
                </div>
            </form>
        </>
    )
}