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



function AdminControlPanel() {
    return (
        <>
            <div className="mb-4 col-span-full xl:mb-2">
                <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Administrator Dashboard</h1>
            </div>

            <div className="pt-4 pb-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <div className="sm:flex">
                        <div className="items-center hidden mb-3 sm:flex sm:divide-x sm:divide-gray-100 sm:mb-0 dark:divide-gray-700">
                            <form className="lg:pr-3" action="#" method="GET">
                                <label htmlFor="users-search" className="sr-only">Search</label>
                                <div className="relative mt-1 lg:w-64 xl:w-96">
                                    <input type="text" name="email" id="users-search" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Search for users"/>
                                </div>
                            </form>
                            <div className="flex pl-0 mt-3 space-x-1 sm:pl-2 sm:mt-0">
                                <a href="#" className="inline-flex justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd"
                                              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                                              clipRule="evenodd"></path>
                                    </svg>
                                </a>
                                <a href="#" className="inline-flex justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                                    </svg>
                                </a>
                                <a href="#" className="inline-flex justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                                    </svg>
                                </a>
                                <a href="#" className="inline-flex justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center ml-auto space-x-2 sm:space-x-3">
                            <button type="button" data-modal-toggle="add-user-modal" className="inline-flex items-center justify-center w-1/2 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                                <svg className="w-5 h-5 mr-2 -ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
                                </svg>
                                Add user
                            </button>
                            <a href="#" className="inline-flex items-center justify-center w-1/2 px-3 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700">
                                <svg className="w-5 h-5 mr-2 -ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd"></path>
                                </svg>
                                Export
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                            <table className="min-w-full divide-y divide-gray-200 table-fixed">
                                <thead className="bg-gray-100">
                                <tr>
                                    <th scope="col" className="p-4">
                                        <div className="flex items-center">
                                            <input id="checkbox-all" aria-describedby="checkbox-1" type="checkbox" className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"/>
                                            <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                                        </div>
                                    </th>
                                    <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase">
                                        Name
                                    </th>
                                    <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase">
                                        Biography
                                    </th>
                                    <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase">
                                        Position
                                    </th>
                                    <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase">
                                        Country
                                    </th>
                                    <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                                </thead>

                                <tbody className="bg-white divide-y divide-gray-200">
                                {/*{{< users.inline >}}*/}
                                {/*{{- range (index $.Site.Data "users") }}*/}
                                <tr className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <td className="w-4 p-4">
                                        <div className="flex items-center">
                                            <input id="checkbox-{{ .id }}" aria-describedby="checkbox-1" type="checkbox" className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"/>
                                            <label htmlFor="checkbox-{{ .id }}" className="sr-only">checkbox</label>
                                        </div>
                                    </td>
                                    <td className="flex items-center p-4 mr-12 space-x-6 whitespace-nowrap">
                                        <img className="w-10 h-10 rounded-full" src="/default-profile.png" alt="{{ .name }} avatar"/>
                                        <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                            <div className="text-base font-semibold text-gray-900 dark:text-white">Placeholder</div>
                                            <div className="text-sm font-normal text-gray-500 dark:text-gray-400">username@gmail.com</div>
                                        </div>
                                    </td>
                                    <td className="max-w-sm p-4 overflow-hidden text-base font-normal text-gray-500 truncate xl:max-w-xs dark:text-gray-400">Placeholder</td>
                                    <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">Placeholder</td>
                                    <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">Placeholder</td>
                                    <td className="p-4 text-base font-normal text-gray-900 whitespace-nowrap dark:text-white">
                                        <div className="flex items-center">
                                            <div className="h-2.5 w-2.5 rounded-full bg-green-400 mr-2"></div>
                                        </div>
                                    </td>
                                    <td className="p-4 space-x-2 whitespace-nowrap">
                                        <button type="button" data-modal-toggle="edit-user-modal" className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path>
                                                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path>
                                            </svg>
                                            Edit user
                                        </button>
                                        <button type="button" data-modal-toggle="delete-user-modal" className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900">
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                                            </svg>
                                            Delete user
                                        </button>
                                    </td>
                                </tr>

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
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