// src/types/activity.ts
export interface ParamsDictionary {
    id: string;
}

export interface RequestBody {
    name: string;
    description?: string;
}

export interface Activity {
    id: number;
    name: string;
    description?: string;
}
