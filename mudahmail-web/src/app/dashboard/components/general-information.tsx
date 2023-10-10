import {allPostcodes, findCities, getStates,} from "malaysia-postcodes";
import React, {useState} from "react";
import axios from "axios";
import {Failed} from "@/components/failed";
import {useSession} from "next-auth/react";

export function GeneralInformation() {
    const {data: session} = useSession()
    const [city, setCity] = useState(getCityByState("Wp Kuala Lumpur", undefined))
    const [postcode, setPostcode] = useState(getPostcodeByCity("Kuala Lumpur", undefined))
    const [loading, setLoading] = useState(false)
    const [allowed, setAllowed] = useState(true)
    const [result, setResult] = useState(<></>)
    const [isRunning, setIsRunning] = useState(false);
    const [defaultValue, setDefaultValue] = useState<{
        email: string,
        firstName: string,
        lastName: string,
        address: string,
        city: string,
        state: string,
        postcode: string,
        phoneNumber: string
    }>()

    if (session === null) {
        return (<></>);
    }

    const onStateChangeEvent = (e: React.FormEvent<HTMLSelectElement>, type: number) => {
        e.preventDefault()

        const select = e.target as HTMLSelectElement;
        const id = select.children[select.selectedIndex] as HTMLOptionElement;

        if (type === 0) {
            setCity(getCityByState(id.value, defaultValue?.city))
        } else {
            setPostcode(getPostcodeByCity(id.value, defaultValue?.postcode))
        }
    }

    const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        setLoading(true)

        try {
            const formData = new FormData(event.target as HTMLFormElement)
            formData.set("type", "general_information")

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

    const call = (async () => {
        if (isRunning) {
            return;
        }

        setIsRunning(true)
        try {
            const status = await axios.get("/api/profile")
            const userInformation = status.data;

            setDefaultValue({
                email: userInformation.email,
                firstName: userInformation.firstName,
                lastName: userInformation.lastName,
                address: userInformation.address,
                city: userInformation.city,
                state: userInformation.state,
                postcode: userInformation.postcode,
                phoneNumber: userInformation.phoneNumber
            })

            console.log(userInformation.postcode)
            setCity(getCityByState(userInformation.state, userInformation.city))
            setPostcode(getPostcodeByCity(userInformation.city, userInformation.postcode))
        } catch (e) {
        }
    });

    if (!isRunning) {
        call();
    }

    return (
        <>
            <h3 className="mb-4 text-xl font-semibold">General information</h3>
            <form className="group" method="post" onSubmit={onSubmitHandler} noValidate={true}>
                <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="first-name" className="block mb-2 text-sm font-medium text-gray-900">First Name</label>
                        <input type="text" name="first-name" defaultValue={defaultValue?.firstName} id="first-name" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" placeholder="Abu" required/>
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="last-name" className="block mb-2 text-sm font-medium text-gray-900">Last Name</label>
                        <input type="text" name="last-name" defaultValue={defaultValue?.lastName} id="last-name" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" placeholder="Bakar" required/>
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-900">Address</label>
                        <input type="text" name="address" id="address" defaultValue={defaultValue?.address} className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" placeholder="Kampung Pandan" required/>
                    </div>

                    {/* Needs validation -- State/City/Postcode */}

                    <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="state" className="block mb-2 text-sm font-medium text-gray-900">State</label>
                        <select id="state" name="state" defaultValue={defaultValue?.state} className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" onChange={e => onStateChangeEvent(e, 0)}>
                            {
                                getStates().map((data) => (
                                    <option key={data} value={data} selected={defaultValue?.state == data}>{data}</option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="city" className="block mb-2 text-sm font-medium text-gray-900">City</label>
                        <select id="city" name="city" defaultValue={defaultValue?.city} className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" onChange={e => onStateChangeEvent(e, 1)}>
                            {city}
                        </select>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="zip-code" className="block mb-2 text-sm font-medium text-gray-900">Postcode</label>
                        <select id="zip-code" name="zip-code" defaultValue={defaultValue?.postcode} className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                            {postcode}
                        </select>
                    </div>

                    {/* Needs validation -- Email */}

                    <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Email</label>
                        <input type="email" name="email" id="email" defaultValue={defaultValue?.email} className="shadow-sm bg-gray-50 border border-gray-300 invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 peer" placeholder="username@gmail.com" required/>
                        <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block">
                            <Failed/>
                            Please enter a valid email address
                        </span>
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="phone-number" className="block mb-2 text-sm font-medium text-gray-900">Phone Number</label>
                        <input type="number" name="phone-number" defaultValue={defaultValue?.phoneNumber} id="phone-number" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" placeholder="+(60)12 345 6789" required/>
                    </div>
                    <div className="col-span-6 sm:col-full">
                        <button className="inline-flex items-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-30 disabled:pointer-events-none group-invalid:pointer-events-none group-invalid:opacity-30 " type="submit" disabled={!allowed}>
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

                        {result}
                    </div>
                </div>
            </form>
        </>
    )
}

const getCityByState = (state: string, defaultCity: string | undefined) => {
    return (
        <>
            {
                allPostcodes.filter(selected => selected.name === state).map((data) => data.city.map(city => (
                    <option key={city.name} value={city.name} selected={defaultCity === city.name}>{city.name}</option>
                )))
            }
        </>
    )
}

const getPostcodeByCity = (city: string, defaultPostcode: string | undefined) => {
    const postcodes = findCities(city, true)?.postcodes;

    if (postcodes === undefined) {
        return (<></>)
    }

    return (
        <>
            {
                postcodes.map(code => (
                    <option key={code} value={code} selected={defaultPostcode === code}>{code}</option>
                ))
            }
        </>
    )
}