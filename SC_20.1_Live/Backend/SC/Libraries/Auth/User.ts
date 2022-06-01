/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import * as runtime from 'N/runtime';

export class User {
    private currentUser: runtime.User = runtime.getCurrentUser();

    private static instance: User;

    private constructor() {}

    public static getInstance(): User {
        if (!this.instance) {
            this.instance = new User();
        }
        return this.instance;
    }

    public getPermission(permissions: string[]): runtime.Permission {
        return Math.max(
            ...permissions.map(
                (permission: string): runtime.Permission =>
                    this.currentUser.getPermission({ name: permission })
            )
        );
    }

    public isLoggedIn(): boolean {
        return this.currentUser.id > 0 && this.currentUser.role !== 17;
    }

    public getId(): number {
        return this.currentUser.id;
    }

    public getEmail(): string {
        return this.currentUser.email;
    }
}