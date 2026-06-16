import type {Member} from "@/types/family.ts";

export interface Task{
    id : string,
    taskName: string,
    description: string,
    createdBy: Member,
    issuedTo: Member,
    createdDate: Date,
    dueDate: Date,
    isMarked: boolean,
    isChecked: boolean
}
