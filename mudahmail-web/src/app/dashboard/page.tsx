"use client";

import 'flowbite';
import {signIn, signOut, useSession} from "next-auth/react";
import React, {useState} from "react";
import {Session} from "next-auth";
import {Role} from "@/interface";
import {getDeploymentUrl} from "@/libs/util";
import {ProfileUpdate} from "@/app/dashboard/components/profile-update";
import {ChangePassword} from "@/app/dashboard/components/change-password";
import {GeneralInformation} from "@/app/dashboard/components/general-information";
import {Dashboard} from "@/app/dashboard/components/dashboard";
import {AdminControlPanel} from "@/app/dashboard/components/admin-dashboard";

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

            {session ? <>
                <div hidden={dashboard !== "dashboard"} className="justify-between items-center mx-auto max-w-8xl p-4 pt-16 md:pr-16 md:pl-16">
                    <div className="grid grid-cols-1 pt-6 xl:grid-cols-3 xl:gap-4 dark:bg-gray-900">
                        <Dashboard/>
                    </div>
                </div>
                <div hidden={dashboard !== "profile"} className="justify-between items-center mx-auto max-w-8xl p-4 pt-16 md:pr-16 md:pl-16">
                    <div className="grid grid-cols-1 pt-6 xl:grid-cols-3 xl:gap-4 dark:bg-gray-900">
                        <EditProfile profilePicture={profilePicture} profileUpdate={setProfilePicture}/>
                    </div>
                </div>
                <div hidden={dashboard !== "admin"} className="p-4 pt-16 md:pr-16 md:pl-16">
                    <div className="pt-6">
                        <AdminControlPanel/>
                    </div>
                </div>
            </> : <p>Session has expired</p>
            }
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


function EditProfile({profilePicture, profileUpdate}: {
    profilePicture: string,
    profileUpdate: (e: string) => void
}) {
    return (
        <>
            <div className="mb-4 col-span-full xl:mb-2">
                <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">My Profile</h1>
            </div>

            {/* Right content */}
            <div className="col-span-full xl:col-auto">
                <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 sm:p-6">
                    <div className="items-center sm:flex xl:block 2xl:flex sm:space-x-4 xl:space-x-0 2xl:space-x-4">
                        <ProfileUpdate profilePicture={profilePicture} setProfilePicture={profileUpdate}/>
                    </div>
                </div>
                <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 sm:p-6">
                    <ChangePassword/>
                </div>
            </div>

            <div className="col-span-2">
                <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                    <GeneralInformation/>
                </div>
            </div>
        </>
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