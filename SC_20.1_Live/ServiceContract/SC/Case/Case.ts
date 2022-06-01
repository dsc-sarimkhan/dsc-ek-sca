/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

export interface CaseField {
    id: string;
    name: string;
}

export interface CaseFieldText {
    id: string;
    text: string;
}

export interface CaseFields {
    categories: CaseFieldText[];
    origins: CaseFieldText[];
    statuses: CaseFieldText[];
    priorities: CaseFieldText[];
}

export interface Case {
    internalid?: string;
    caseNumber: string;
    title: string;
    status: CaseField;
    origin: CaseField;
    category: CaseField;
    company: CaseField;
    priority: CaseField;
    createdDate: string;
    lastMessageDate: string;
    email: string;
    messages_count: number;
    grouped_messages: {
        date: string;
        messages: {}[];
    }[]; // Keep this name for backwards compatibility.
    id?: string;
    isNewCase?: boolean;
    reply?: string;
    statusid?: string;
    message?: string;
    customerId?: number;
}

export interface Message {
    author: string;
    text: string;
    messageDate: string;
    internalid: string;
    initialMessage: boolean;
}
