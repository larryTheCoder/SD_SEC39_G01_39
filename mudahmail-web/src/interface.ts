// Define a role enum
import {DefaultUser} from "next-auth";

export enum Role {
    user = "user",
    admin = "admin",
}

// common interface for JWT and Session
export interface IUser extends DefaultUser {
    role?: Role;
}
