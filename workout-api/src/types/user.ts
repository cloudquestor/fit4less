// src/types/user.ts
export interface ParamsDictionary {
    id: string;
}

export interface UserRequestBody {
    name: string;
}

export interface User {
    id: number;
    name: string;
}
