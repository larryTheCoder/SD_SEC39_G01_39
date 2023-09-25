import {Failed} from "@/app/components/failed";
import React from "react";
import {Loading} from "@/app/components/loading";

export function EmailTextBox({onChange, isDisabled}: {
    onChange: (value: string) => void
    isDisabled: boolean
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
                   pattern="/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block">
                <Failed/>
                Please enter a valid email address
            </span>
        </section>
    )
}

export function PasswordInputBox({onChange, titleName, pattern, showTooltip, inputName, isDisabled}: {
    onChange: (value: string) => void
    titleName: string
    pattern: string
    inputName: string
    showTooltip: boolean
    isDisabled: boolean
}){
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
        </section>
    )
}

/*
 * currentState enum:
 * - 0: NONE
 * - 1: LOADING
 * - 2: SUCCESS
 * - 3: FAILED
 */
export function SubmissionButton({title, currentState}: {
    title: string
    currentState: boolean
}){
    return (
        <button type="submit" className="w-full text-white bg-primary-600 group-invalid:pointer-events-none group-invalid:opacity-30 hover:bg-primary-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
            {(currentState && <Loading/>) || <a>{title}</a> }
        </button>
    )
}