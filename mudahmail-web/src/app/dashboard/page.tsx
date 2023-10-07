"use client";

import 'flowbite';
import {signIn, signOut, useSession} from "next-auth/react";
import React, {ChangeEvent, useState} from "react";
import {EmailTextBox, PasswordInputBox, SubmissionButton} from "@/app/components/input";
import {Success} from "@/app/components/success";
import {Failed} from "@/app/components/failed";
import {Session} from "next-auth";
import {Role} from "@/interface";

export default function Home() {
    const [dashboard, setDashboard] = useState("dashboard")

    const {data: session} = useSession();

    return (
        <>
            <header className="bg-white fixed top-0 w-full shadow-md border-gray-200 px-4 lg:px-6 py-2.5">
                <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
                    <a href="https://flowbite.com" className="flex items-center">
                        <img src="/mudahmail.svg" className="mr-3 h-9" alt="Flowbite Logo"/>
                        <span className="self-center text-xl font-semibold whitespace-nowrap">Mudahmail</span>
                    </a>
                    <div className="flex items-center lg:order-2">
                        <LoginButton session={session}/>
                        <button data-collapse-toggle="mobile-menu-2" type="button" className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200" aria-controls="mobile-menu-2" aria-expanded="false">
                            <span className="sr-only">Open main menu</span>
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12 a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
                            <svg className="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                        </button>
                    </div>
                    <div className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1" id="mobile-menu-2">
                        <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                            <NavButtonStyle active={dashboard === "dashboard"} content="Home" setActiveTab={e => setDashboard("dashboard")}/>
                            <NavButtonStyle active={dashboard === "profile"} content="Edit Profile" setActiveTab={e => setDashboard("profile")}/>
                            <NavButtonStyle active={dashboard === "admin"} hidden={session?.user?.role !== Role.admin} content="Administrative" setActiveTab={e => setDashboard("admin")}/>
                        </ul>
                    </div>
                </div>
            </header>

            <div className="mt-16 h-screen">
                {dashboard === "dashboard" ? (
                    <Dashboard/>
                ) : (dashboard === "profile" ? (
                    <EditProfileClient session={session}/>
                ) : (dashboard === "admin" ? (
                    <AdminControlPanel/>
                ) : <></>))
                }
            </div>
        </>
    )
}

function LoginButton({session}: {
    session: Session | null
}) {
    return (
        <div className="ml-auto flex gap-2">
            {session?.user ? (
                <>
                    <img src="http://localhost:3000/api/profile-icon" className="mr-3 h-9 rounded-full object-cover"/>
                    <button className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none" onClick={() => signOut()}>
                        Sign Out
                    </button>
                </>
            ) : (
                <button className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none" onClick={() => signIn()}>
                    Sign In
                </button>
            )}
        </div>
    );
}

function Dashboard() {
    return (
        <>
            <p>Hello world!</p>
        </>
    )
}

function AdminControlPanel() {
    return (
        <>
            <p>Hello world!</p>
        </>
    )
}

function EditProfileClient({session}: {
    session: Session | null
}) {
    if (session === null || session === undefined) {
        return;
    }

    return (
        <div>
            <EditProfile emailName={session.user?.email}/>
        </div>
    )
}

function EditProfile({emailName}: {
    emailName: string | null | undefined;
}) {
    const [postBody, setPostBody] = useState({
        email: "",
        oldPassword: "",
        password: ""
    })

    const [validation, setValidation] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    })

    const [validate, setMinimumLength] = useState({
        length: false,
        hasUppercase: false,
        hasLowercase: false,
        hasDigit: false,
        hasSpecial: false,
        isMatched: false
    })

    const [profilePicture, setProfilePicture] = useState<string>("");
    const handleProfilePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target) {
                    const dataUrl = event.target.result as string;
                    setProfilePicture(dataUrl);
                }
            };

            reader.readAsDataURL(file);
        }
    };

    const validatePassword = (password: string) => {
        setMinimumLength({
            length: (/.{8,}/).test(password),
            hasUppercase: (/(?=.*?[A-Z])/).test(password),
            hasLowercase: (/(?=.*?[a-z])/).test(password),
            hasDigit: (/(?=.*?[0-9])/).test(password),
            hasSpecial: (/(?=.*?[#?!@$%^&*\-])/).test(password),
            isMatched: password === validation.confirmPassword
        })
    }

    return (
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">
            <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                <div className="p-6 space-y-4 md:space-y-4 sm:p-8">
                    <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                        Edit profile
                    </h1>

                    <div className="flex flex-col items-center space-y-2">
                        <img
                            src={profilePicture.length <= 0 ? `/default-profile.png` : profilePicture}
                            alt="Profile Picture"
                            className="w-32 h-32 rounded-full object-cover"
                        />
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                        <input
                            type="file"
                            accept="image/*"
                            id="profilePicture"
                            onChange={handleProfilePictureChange}
                            className="hidden"
                        />
                        <label
                            htmlFor="profilePicture"
                            className="cursor-pointer text-primary-600 hover:underline">
                            Set Profile Picture
                        </label>
                    </div>

                    <EmailTextBox onChange={e => setPostBody({...postBody, email: e})} emailContent={emailName ?? ""}/>

                    <PasswordInputBox onChange={(password) => {
                    }} titleName="Current Password" inputName="password-old" pattern=".{8,}" showTooltip={false}/>

                    <PasswordInputBox onChange={(password) => {
                        setValidation({...validation, password: password})
                        validatePassword(password)
                    }} titleName="New Password" inputName="password" pattern="^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}" showTooltip={false}/>
                    <PasswordInputBox onChange={(password) => {
                        setValidation({...validation, confirmPassword: password})
                        setMinimumLength({...validate, isMatched: password === validation.password})
                    }} titleName="Confirm Password" inputName="password-confirm" pattern="^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}" showTooltip={false}/>

                    <div className="grid grid-flow-row auto-rows-max gap-1 mt-4 text-sm mb-2">
                        <p>{(validate.length && <Success/>) || (<Failed/>)}Minimum 8 characters long</p>
                        <p>{(validate.hasUppercase && <Success/>) || (<Failed/>)}At least one uppercase English letter</p>
                        <p>{(validate.hasLowercase && <Success/>) || (<Failed/>)}At least one lowercase English letter</p>
                        <p>{(validate.hasDigit && <Success/>) || (<Failed/>)}At least one digit</p>
                        <p>{(validate.hasSpecial && <Success/>) || (<Failed/>)}At least one special character (#?!@$%^&*)</p>
                        <p>{(validate.isMatched && <Success/>) || (<Failed/>)}Password must match</p>
                    </div>
                    <SubmissionButton title="Save changes" currentState={false}/>
                </div>

            </div>
        </div>
    );
}

function NavButtonStyle({content, setActiveTab, active, hidden}: {
    content: string
    setActiveTab: (e: React.MouseEvent<HTMLAnchorElement>) => void
    active: boolean
    hidden?: boolean
}) {
    if (hidden) {
        return <></>
    }

    return active ? (
        <a href="/" onClick={(e) => {
            e.preventDefault()
            setActiveTab(e)
        }
        } className="block py-2 pr-4 pl-3 text-white rounded bg-primary-700 lg:bg-transparent lg:text-primary-700 lg:p-0" aria-current="page">
            {content}
        </a>
    ) : (
        <a href="/" onClick={(e) => {
            e.preventDefault()
            setActiveTab(e)
        }
        } className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0">
            {content}
        </a>
    )
}