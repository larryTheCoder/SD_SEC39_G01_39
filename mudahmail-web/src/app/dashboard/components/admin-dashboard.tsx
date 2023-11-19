'use client';

import React, {useEffect, useState} from "react"
import axios from "axios"
import {Button, Modal} from 'flowbite-react';
import {HiCheckCircle, HiOutlineStatusOffline} from 'react-icons/hi';

type MailboxEvent = {
    event_type: string;
    timestamp: string;
    data: any;
}

type MailboxData = {
    name: string;
    timestamp: Date;
    value: string;
}

type AdminUserList = {
    email: string,
    role: string,
    profile: string,
    device: string,
    liveWeight: number,
    locked: boolean,
    lockedWeight: number,
    online: boolean,
    events: MailboxEvent[],
    eventsParsed: MailboxData[]
}

export function AdminControlPanel() {
    const [types, setUserList] = useState<AdminUserList[]>([])
    const [openModal, setOpenModal] = useState(false)
    const [successModal, setOpenSuccessModal] = useState(false)
    const [failModal, setFailOpenModel] = useState(false)
    const [loading, setLoading] = useState(true)
    const [deviceLoading, setDeviceLoading] = useState(false)

    const unlockDevice = async (deviceId: string) => {
        setDeviceLoading(true);
        try {
            const formData = new FormData()
            formData.set("device", deviceId)
            formData.set("toggle", "false")

            await axios.put('/api/admin/users', formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            })

            await fetchData()

            setOpenSuccessModal(true)
        } catch (e) {
            if (axios.isAxiosError(e)) {
                setFailOpenModel(true);
            }
        }

        setDeviceLoading(false);
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            const userList: AdminUserList[] = (await axios.get("/api/admin/users")).data


            setUserList(userList.map((list) => {
                return {
                    ...list, eventsParsed: list.events.map<MailboxData>((event): MailboxData => {
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
                    })
                }
            }))
        } catch (e) {
            console.log(e)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchData().catch(console.error)
    }, [])

    return (
        <>
            <div className="mb-4 col-span-full xl:mb-2">
                <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Administrator Dashboard</h1>
            </div>

            <div className="pt-4 pb-4 block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <div className="sm:flex">
                        <button type="button" onClick={fetchData} className="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-6 py-2 focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`h-3.5 w-3.5 mr-2 ${loading ? `animate-spin` : ``}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                            </svg>

                            Refresh
                        </button>
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
                                    <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase">
                                        Name
                                    </th>
                                    <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase">
                                        Door Status
                                    </th>
                                    <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase">
                                        Device Status
                                    </th>
                                    <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                                </thead>

                                <tbody className="bg-white divide-y divide-gray-200">
                                {
                                    types.map((data, key) => {
                                        return (
                                            <tr key={key} className="hover:bg-gray-100">
                                                <td className="flex items-center p-4 mr-12 space-x-6 whitespace-nowrap">
                                                    <img className="w-10 h-10 rounded-full" src="/default-profile.png" alt="{{ .name }} avatar"/>
                                                    <div className="text-sm font-normal text-gray-500">
                                                        <div className="text-base font-semibold text-gray-900">{data.email}</div>
                                                        <div className="text-sm font-normal text-gray-500">{data.role == 'admin' ? "Administrator" : "User"}</div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap">{data.locked ? "Locked" : "Unlocked"}</td>
                                                <td className="p-4 text-base font-normal text-gray-900 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className={`h-2.5 w-2.5 rounded-full ${data.online ? "bg-green-400" : "bg-red-400"} mr-2`}></div>
                                                        <p className="text-base font-medium text-red-900 whitespace-nowrap">{data.online ? "Online" : "Offline"}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4 space-x-2 whitespace-nowrap">
                                                    <button type="button" onClick={() => setOpenModal(true)} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300">
                                                        <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/>
                                                            <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                                                        </svg>

                                                        View History
                                                    </button>
                                                    <button type="button" data-modal-toggle="delete-user-modal" className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300">
                                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                                                        </svg>
                                                        Delete user
                                                    </button>

                                                    <Modal show={openModal} size="4xl" onClose={() => setOpenModal(false)}>
                                                        <Modal.Header>Device History</Modal.Header>
                                                        <Modal.Body>
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
                                                                    data.eventsParsed.map((event, eventKey) => (
                                                                        <tr key={eventKey} className="border-b dark:border-gray-700">
                                                                            <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">{event.name}</th>
                                                                            <td className="px-4 py-3">{event.timestamp.toLocaleString('default', {timeZone: 'Asia/Kuala_Lumpur'})}</td>
                                                                            <td className="px-4 py-3">{event.value}</td>
                                                                        </tr>
                                                                    ))
                                                                }
                                                                </tbody>
                                                            </table>
                                                        </Modal.Body>
                                                        <Modal.Footer>
                                                            <Button onClick={() => unlockDevice(data.device)}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`h-3.5 w-3.5 mr-2 ${deviceLoading ? `animate-spin` : ``}`}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                                                                </svg>

                                                                Unlock Device
                                                            </Button>
                                                            <Button color="gray" onClick={() => setOpenModal(false)}>
                                                                Close
                                                            </Button>
                                                        </Modal.Footer>

                                                        <Modal show={failModal} size="md" onClose={() => setFailOpenModel(false)} popup>
                                                            <Modal.Header />
                                                            <Modal.Body>
                                                                <div className="text-center">
                                                                    <HiOutlineStatusOffline className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                                                                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                                                        Device is currently offline please try again later.
                                                                    </h3>
                                                                </div>
                                                            </Modal.Body>
                                                        </Modal>

                                                        <Modal show={successModal} size="md" onClose={() => setOpenSuccessModal(false)} popup>
                                                            <Modal.Header />
                                                            <Modal.Body>
                                                                <div className="text-center">
                                                                    <HiCheckCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                                                                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                                                        Device has successfully been unlocked.
                                                                    </h3>
                                                                </div>
                                                            </Modal.Body>
                                                        </Modal>
                                                    </Modal>

                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
