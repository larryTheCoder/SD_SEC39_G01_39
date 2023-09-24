import React from "react";

export function SignUp() {
    return (
        <p className="text-sm font-light text-gray-500 ">
            Don&#39;t have an account yet? ​
            <a href="#" className="font-medium text-primary-600 hover:underline">
                Sign up
            </a>
        </p>
    )
}

export function SignIn() {
    return (
        <p className="text-sm font-light text-gray-500">
            Already have an account? ​
            <a href="#" className="font-medium text-primary-600 hover:underline">
                Sign in
            </a>
        </p>
    )
}