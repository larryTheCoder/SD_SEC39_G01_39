import React, {useEffect, useState} from "react";
import axios from "axios";

// Define the desired type
type MailboxEvent = {
    event_type: string;
    timestamp: string;
    data: any;
}

type MailboxTypeRaw = {
    events: MailboxEvent[];
    locked: boolean
    current_weight: number,
    live_weight: number,
    is_online: boolean,
    device_id: string
};

type MailboxData = {
    name: string;
    timestamp: Date;
    value: string;
}

export function Dashboard() {
    const [types, setTypes] = useState<MailboxData[]>([])
    const [allTypes, setAllTypes] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [liveWeight, setLiveWeight] = useState("0.0")
    const [isOnline, setOnline] = useState(false)
    const [deviceUUID, setDeviceUUID] = useState("Loading...")
    const [doorStatus, setDoorStatus] = useState(<div className="col-span-3"><p>Loading...</p></div>)

    const fetchData = async () => {
        setLoading(true)
        try {
            const mailboxData: MailboxTypeRaw = (await axios.get("/api/stats")).data;
            const mailboxEvents: MailboxEvent[] = mailboxData.events;

            setDeviceUUID(mailboxData.device_id)
            setLiveWeight(mailboxData.live_weight.toFixed(2))
            setOnline(mailboxData.is_online)

            if (mailboxData.locked) {
                setDoorStatus(
                    <div className="col-span-3">
                        <p>Locked</p>
                        <p>{mailboxData.current_weight.toFixed(2)}kg</p>
                    </div>
                )
            } else {
                setDoorStatus(
                    <div className="col-span-3">
                        <p>Unlocked</p>
                    </div>
                )
            }

            setTypes(mailboxEvents.map<MailboxData>((event): MailboxData => {
                console.log(event)

                switch (event.event_type) {
                    case 'DOOR_STATE_OPEN':
                        return {name: "Door State", value: "Open", timestamp: new Date(event.timestamp)}
                    case 'DOOR_STATE_CLOSED':
                        return {name: "Door State", value: "Closed", timestamp: new Date(event.timestamp)}
                    case 'DOOR_LOCKED':
                        return {name: "Door Security", value: "Locked", timestamp: new Date(event.timestamp)}
                    case 'DOOR_UNLOCKED':
                        return {name: "Door Security", value: "Unlocked", timestamp: new Date(event.timestamp)}
                    case 'WEIGHT_STATE_UPDATE':
                        return {name: "Parcel Weight", value: event.data.weight.toFixed(2) + "kg", timestamp: new Date(event.timestamp)}
                }

                return {
                    name: event.event_type,
                    timestamp: new Date(event.timestamp),
                    value: "Unknown"
                };
            }))

            setAllTypes(Array.from(new Set(mailboxEvents.map((data) => {
                return data.event_type
            }))))
        } catch (e) {
            console.log(e)
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchData().catch(console.error)
    }, []);

    let i = 0;

    return (
        <>
            <div className="mb-4 col-span-full xl:mb-2">
                <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">My Dashboard</h1>
            </div>

            <div className="col-span-full xl:col-auto">
                <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 sm:p-6">
                    <h3 className="mb-4 text-xl font-semibold">Device Information</h3>

                    <div className="grid grid-cols-5 gap-3">
                        <div className="col-span-6">
                            <p className="font-medium">Device UUID:</p>
                            <p>{deviceUUID}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="font-medium">Door Status:</p>
                        </div>
                        {doorStatus}
                        <div className="col-span-6">
                            <p className="font-medium">Device Status:</p>
                            <p>{isOnline ? `Online` : `Offline`}</p>
                        </div>
                        <div className="col-span-6">
                            <p className="font-medium">Live weight:</p>
                            <p>{liveWeight}kg</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-span-2 h-3">
                <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                    <h3 className="mb-4 text-xl font-semibold">Device Statistics</h3>

                    <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 pt-4 pb-4 pr-4">
                        <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                            <button type="button" onClick={fetchData} className="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`h-3.5 w-3.5 mr-2 ${loading ? `animate-spin` : ``}`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                                </svg>

                                Refresh
                            </button>
                            <div className="flex items-center space-x-3 w-full md:w-auto">
                                <button id="filterDropdownButton" data-dropdown-toggle="filterDropdown" data-dropdown-trigger="hover"
                                        className="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" type="button">
                                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/>
                                    </svg>
                                    Filter
                                    <svg className="-mr-1 ml-1.5 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path clipRule="evenodd" fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                                    </svg>
                                </button>
                                <div id="filterDropdown" className="z-10 hidden w-48 p-3 bg-white rounded-lg shadow dark:bg-gray-700">
                                    <h6 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">Filter by</h6>
                                    <ul className="space-y-2 text-sm" aria-labelledby="filterDropdownButton">
                                        {
                                            allTypes.map((data) => (
                                                <li key={data} className="flex items-center">
                                                    <input id={data} type="checkbox" checked={true} className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"/>
                                                    <label htmlFor={data} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">{data}</label>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="display:block text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-4 py-3">Event Name</th>
                                <th scope="col" className="px-4 py-3">Timestamp</th>
                                <th scope="col" className="px-4 py-3">Data value</th>
                            </tr>
                            </thead>
                            <tbody className="overflow-y-scroll h-72">
                            {
                                types.map((data) => (
                                    <tr key={i++} className="border-b dark:border-gray-700">
                                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">{data.name}</th>
                                        <td className="px-4 py-3">{data.timestamp.toLocaleString('default', {timeZone: 'Asia/Kuala_Lumpur'})}</td>
                                        <td className="px-4 py-3">{data.value}</td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </>
    )
}