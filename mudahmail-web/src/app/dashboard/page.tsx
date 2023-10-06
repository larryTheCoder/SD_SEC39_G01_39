"use client";

import React, {ChangeEvent, useState} from "react";
import {CardMenu} from "@/app/components/card";
import Image from "next/image";
import {SubmissionButton} from "@/app/components/input";

export default function Home() {

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


    return (
        <section>

            <div>
                <header>
                    <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
                        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
                            <a href="https://flowbite.com" className="flex items-center">
                                <img src="mudahmail.svg" className="mr-3 h-6 sm:h-9" alt="Flowbite Logo" />
                                <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Mudahmail</span>
                            </a>
                            <div className="flex items-center lg:order-2">
                                <a href="#" className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">Log Out</a>
                                <button data-collapse-toggle="mobile-menu-2" type="button" className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="mobile-menu-2" aria-expanded="false">
                                    <span className="sr-only">Open main menu</span>
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12 a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
                                    <svg className="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                </button>
                            </div>
                            <div className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1" id="mobile-menu-2">
                                <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                                    <li>
                                        <a href="#" className="block py-2 pr-4 pl-3 text-white rounded bg-primary-700 lg:bg-transparent lg:text-primary-700 lg:p-0 dark:text-white" aria-current="page">Home</a>
                                    </li>
                                    <li>
                                        <a href="#" className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Profile</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </nav>
                </header>

                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">

                    <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                        <div className="p-6 space-y-4 md:space-y-4 sm:p-8">
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                                Edit profile
                            </h1>

                            {profilePicture && (
                                <div className="flex flex-col items-center space-y-2">
                                    <img
                                        src={profilePicture}
                                        alt="Profile Picture"
                                        className="w-32 h-32 rounded-full object-cover"
                                    />
                                </div>
                            )}

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
                                    className="cursor-pointer text-primary-600 hover:underline"
                                >
                                    Set Profile Picture
                                </label>
                            </div>

                            <label htmlFor="editEmail" className="block mb-2 text-sm font-medium text-gray-900">
                                Edit Email
                            </label>
                            <input
                                type="text"
                                name="email"
                                id="editEmail"
                                onChange={e => {}}
                                className="bg-gray-50 invalid:[&:not(:placeholder-shown):not(:focus)]:bg-red-50 border border-gray-300 invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                placeholder="Edit Email"
                                required={true}

                            />

                            <label htmlFor="editName" className="block mb-2 text-sm font-medium text-gray-900">
                                Edit Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="editName"
                                onChange={e => {}}
                                className="bg-gray-50 invalid:[&:not(:placeholder-shown):not(:focus)]:bg-red-50 border border-gray-300 invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                placeholder="Edit Name"
                                required={true}

                            />

                            <label htmlFor="editPass" className="block mb-2 text-sm font-medium text-gray-900">
                                Change Password
                            </label>
                            <input
                                type="text"
                                name="password"
                                id="editPass"
                                onChange={e => {}}
                                className="bg-gray-50 invalid:[&:not(:placeholder-shown):not(:focus)]:bg-red-50 border border-gray-300 invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                placeholder="new password"
                                required={true}

                            />

                            <SubmissionButton title="Save changes" currentState={false} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
