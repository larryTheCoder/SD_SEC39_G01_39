"use client";

import 'flowbite';
import {signIn, signOut, useSession} from "next-auth/react";
import React, {useState} from "react";
import {Success} from "@/components/success";
import {Failed} from "@/components/failed";
import {Session} from "next-auth";
import {Role} from "@/interface";
import axios from "axios";
import {getDeploymentUrl} from "@/libs/util";
import {ProfileUpdate} from "@/app/dashboard/components/profile-update";

const delay = (ms: number) => new Promise(
    resolve => setTimeout(resolve, ms)
);

export default function Home() {
    const {data: session, update} = useSession();

    const [dashboard, setDashboard] = useState("dashboard")
    const [profilePicture, setProfilePicture0] = useState<string>(session?.user?.image ?? "")

    const setProfilePicture = async (e: string) => {
        setProfilePicture0(e);

        await update({})
    }

    return (
        <>
            <header className="bg-white fixed top-0 w-full shadow-md border-gray-200 px-4 lg:px-6 py-2.5">
                <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
                    <a href={getDeploymentUrl()} className="flex items-center">
                        <img src="/mudahmail.svg" className="mr-3 h-9" alt="MudahMail Logo"/>
                        <span className="self-center text-xl font-semibold whitespace-nowrap">MudahMail</span>
                    </a>
                    <div className="flex items-center lg:order-2">
                        <LoginButton session={session} profile={profilePicture}/>
                        <button data-collapse-toggle="mobile-menu-2" type="button" className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200" aria-controls="mobile-menu-2" aria-expanded="false">
                            <span className="sr-only">Open main menu</span>
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12 a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
                            </svg>
                            <svg className="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                            </svg>
                        </button>
                    </div>
                    <div className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1" id="mobile-menu-2">
                        <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                            <NavButtonStyle active={dashboard === "dashboard"} content="Home" setActiveTab={e => setDashboard("dashboard")}/>
                            <NavButtonStyle active={dashboard === "profile"} content="Profile" setActiveTab={e => setDashboard("profile")}/>
                            <NavButtonStyle active={dashboard === "admin"} hidden={session?.user?.role !== Role.admin} content="Administrative" setActiveTab={e => setDashboard("admin")}/>
                        </ul>
                    </div>
                </div>
            </header>

            <div className="mt-8 h-screen">
                {dashboard === "dashboard" ? (
                    <Dashboard/>
                ) : (dashboard === "profile" ? (
                    <EditProfileClient session={session} profileUpdate={(e) => setProfilePicture(e)}/>
                ) : (dashboard === "admin" ? (
                    <AdminControlPanel/>
                ) : <></>))
                }
            </div>
        </>
    )
}

function LoginButton({session, profile}: {
    session: Session | null
    profile: string | null
}) {
    return (
        <div className="ml-auto flex gap-2">
            {session?.user ? (
                <>
                    <img src={profile && profile.length > 0 ? profile : "/default-profile.png"} className="mr-3 h-9 rounded-full object-cover"/>
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

function EditProfileClient({session, profileUpdate}: {
    session: Session | null,
    profileUpdate: (e: string) => void
}) {
    if (session === null || session === undefined) {
        return;
    }

    return (
        <div>
            <EditProfile emailName={session.user?.email} profileImage={session.user?.image ?? null} profileUpdate={profileUpdate}/>
        </div>
    )
}

function EditProfile({emailName, profileImage, profileUpdate}: {
    emailName: string | null | undefined
    profileImage: string | null
    profileUpdate: (e: string) => void
}) {
    const [animation, setAnimation] = useState(false)
    const [output, setOutput] = useState<React.JSX.Element | undefined>(undefined)

    const [postBody, setPostBody] = useState({
        email: emailName,
        oldPassword: "",
        newPassword: ""
    })

    const [validation, setValidation] = useState({
        email: emailName,
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

    const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setAnimation(true)

        try {
            const resultFetch = await axios.post("/api/update", postBody);

            if (resultFetch.status === 200) {
                setOutput(<p><Success/>Successfully updated your account credentials.</p>)
                setAnimation(false)

                await delay(5 * 1000)

                location.reload()
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;

                if (status === 409) {
                    setOutput(<p className="text-red-500"><Failed/>That email is currently being used by another user.</p>)
                } else if (status == 403) {
                    setOutput(<p className="text-red-500"><Failed/>Your current password does not match.</p>)
                } else {
                    setOutput(<p className="text-red-500"><Failed/>Something went wrong in the backend.</p>)
                }
            }
        }

        setAnimation(false)
    }

    return (
        <div className="justify-between items-center mx-auto max-w-8xl p-8">
            <div className="grid grid-cols-1 pt-6 xl:grid-cols-3 xl:gap-4 dark:bg-gray-900">
                <div className="mb-4 col-span-full xl:mb-2">
                    <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">My Profile</h1>
                </div>

                {/* Right content */}
                <div className="col-span-full xl:col-auto">
                    <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                        <div className="items-center sm:flex xl:block 2xl:flex sm:space-x-4 xl:space-x-0 2xl:space-x-4">
                            <ProfileUpdate profileImage={profileImage} profileUpdate={profileUpdate}/>
                        </div>
                    </div>
                    <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                        <h3 className="mb-4 text-xl font-semibold dark:text-white">Password information</h3>
                        <form action="#">
                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6 sm:col-span-6">
                                    <label htmlFor="current-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Current password</label>
                                    <input type="password" name="current-password" id="current-password" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="••••••••" required/>
                                </div>
                                <div className="col-span-6 sm:col-span-6">
                                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">New password</label>
                                    <input data-popover-target="popover-password" data-popover-placement="bottom" type="password" id="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="••••••••" required/>
                                </div>
                                <div className="col-span-6 sm:col-span-6">
                                    <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm password</label>
                                    <input type="password" name="confirm-password" id="confirm-password" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="••••••••" required/>
                                </div>
                                <div className="col-span-6 sm:col-full">
                                    <button className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" type="submit">Save all</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="col-span-2">
                    <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                        <h3 className="mb-4 text-xl font-semibold dark:text-white">General information</h3>
                        <form action="#">
                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="first-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">First Name</label>
                                    <input type="text" name="first-name" id="first-name" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Bonnie" required/>
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="last-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Last Name</label>
                                    <input type="text" name="last-name" id="last-name" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Green" required/>
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="country" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Country</label>
                                    <input type="text" name="country" id="country" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="United States" required/>
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="city" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">City</label>
                                    <input type="text" name="city" id="city" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="e.g. San Francisco" required/>
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Address</label>
                                    <input type="text" name="address" id="address" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="e.g. California" required/>
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                                    <input type="email" name="email" id="email" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="example@company.com" required/>
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="phone-number" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone Number</label>
                                    <input type="number" name="phone-number" id="phone-number" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="e.g. +(12)3456 789" required/>
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="zip-code" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Zip/postal code</label>
                                    <input type="number" name="zip-code" id="zip-code" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="123456" required/>
                                </div>
                                <div className="col-span-6 sm:col-span-6">
                                    <label htmlFor="zip-code" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Device Identifier</label>
                                    <input type="text" name="device-id" id="device-id" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="7dae63d0-742f-4b04-8330-5cbd6c68ffe3" required/>
                                </div>
                                <div className="col-span-6 sm:col-full">
                                    <button className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" type="submit">Save all</button>
                                </div>
                            </div>
                        </form>
                    </div>
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