/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

declare module 'N/internal/*' {
    export enum Type {SCA, SCS, SCIS}

    interface Logger {
        info(data: object): void;
        error(data: object): void;
    }

    export function create({type: Type}): Logger;
}
