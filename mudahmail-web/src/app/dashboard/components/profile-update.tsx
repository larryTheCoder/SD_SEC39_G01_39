import React, {ChangeEvent, useState} from "react"
import axios from "axios";

export function ProfileUpdate({profileImage, profileUpdate} : {
    profileImage: string | null
    profileUpdate: (e: string) => void
}) {
    const [loadingUpload, setLoadingUpload] = useState(false)
    const [loadingDelete, setLoadingDelete] = useState(false)
    const [profilePicture, setProfilePicture] = useState<string>(profileImage ?? "")
    const handleProfilePictureChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        setLoadingUpload(true)

        if (file) {
            const reader = new FileReader()
            reader.onload = async (event) => {
                if (!event.target) {
                    console.log("Something went wrong??")
                    return;
                }

                const formData = new FormData();
                formData.append("file", file);

                try {
                    await axios.put('/api/update', formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        }
                    })
                } catch (e) {
                    if (axios.isAxiosError(e)) {
                        console.log(e)
                    }
                }

                setLoadingUpload(false)

                const dataUrl = event.target.result as string
                setProfilePicture(dataUrl)
                profileUpdate(dataUrl)
            }

            const defaultErrorFlow = () => {
                setLoadingUpload(false)
            };

            reader.onerror = defaultErrorFlow;
            reader.onabort = defaultErrorFlow;

            reader.readAsDataURL(file)
        }
    }
    const handleDelete = async () =>{
        setLoadingDelete(true)
        try {
            await axios.delete('/api/update')

            setProfilePicture("")
            profileUpdate("")
        } catch (e) {
            if (axios.isAxiosError(e)) {
                console.log(e)
            }
        }

        setLoadingDelete(false)
    }

    return (
        <>
            <img className="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0" src={profilePicture.length <= 0 ? `/default-profile.png` : profilePicture} alt="Jese picture"/>
            <input
                type="file"
                accept="image/*"
                id="profile-picture"
                onChange={handleProfilePictureChange}
                className="hidden"
            />
            <div>
                <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">Profile picture</h3>
                <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    JPG, GIF or PNG. Max size of 800K
                </div>
                <div className="flex items-center space-x-4">
                    <label htmlFor="profile-picture" className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 cursor-pointer">
                        {loadingUpload ? (
                            <svg aria-hidden={false} role="status" className="w-4 h-4 mr-2 -ml-1 animate-spin" viewBox="0 0 100 100" fill="none">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentColor"/>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 mr-2 -ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z"></path>
                                <path d="M9 13h2v5a1 1 0 11-2 0v-5z"></path>
                            </svg>
                        )}

                        Upload picture
                    </label>
                    <button type="button" onClick={handleDelete} className="py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                        Delete
                    </button>
                </div>
            </div>
        </>
    )
}