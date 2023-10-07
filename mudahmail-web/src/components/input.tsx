import {Failed} from "@/components/failed";
import React from "react";
import {Loading} from "@/components/loading";

export function EmailTextBox({onChange, isDisabled, emailContent}: {
    onChange: (value: string) => void
    isDisabled?: boolean
    emailContent?: string
}) {
    return (
        <section>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                Your email
            </label>
            <input type="email" name="email" id="email"
                   onChange={e => {
                       onChange(e.target.value);
                   }}
                   className="bg-gray-50 invalid:[&:not(:placeholder-shown):not(:focus)]:bg-red-50 border border-gray-300 invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 peer"
                   placeholder="username@gmail.com"
                   required={true}
                   disabled={isDisabled ?? false}
                   value={emailContent}
                   pattern=".[A-Za-z0-9._%+\-]{1,16}.[@]{1}.[a-z0-9.\-]{1,16}.[.]{1}.[a-z]{1,}"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block">
                <Failed/>
                Please enter a valid email address
            </span>
        </section>
    )
}

export function PasswordInputBox({onChange, titleName, pattern, showTooltip, inputName, isDisabled, showInvalidLogin}: {
    onChange: (value: string) => void
    titleName: string
    pattern: string
    inputName: string
    showTooltip: boolean
    isDisabled?: boolean
    showInvalidLogin?: boolean
}) {
    return (
        <section>
            <label htmlFor={inputName} className="block mb-2 text-sm font-medium text-gray-900">{titleName}</label>
            <input type="password" name={inputName} id={inputName} placeholder="•••••••••••••"
                   onChange={e => {
                       onChange(e.target.value);
                   }}
                   className="bg-gray-50 invalid:[&:not(:placeholder-shown):not(:focus)]:bg-red-50 border border-gray-300 invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 peer"
                   required={true}
                   disabled={isDisabled}
                   pattern={pattern}
            />

            {showTooltip && (
                <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block">
                    <Failed/>
                    Your password must be at least 8 characters long
                </span>
            )}

            <div className="mt-2 text-sm text-red-500">
                {showInvalidLogin && (
                    <span>
                    <Failed/>
                    Invalid login details, please try again
                </span>
                )}
            </div>
        </section>
    )
}

export function SubmissionButton({title, currentState, isDisabled}: {
    title: string
    currentState: boolean
    isDisabled?: boolean
}) {
    return (
        <button type="submit" className="w-full text-white bg-primary-600 disabled:opacity-30 disabled:pointer-events-none group-invalid:pointer-events-none group-invalid:opacity-30 hover:bg-primary-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                disabled={isDisabled}>
            {(currentState && <Loading/>) || <a>{title}</a>}
        </button>
    )
}