/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import * as Nruntime from 'N/runtime';

class Session {
    private session: Nruntime.Session;

    public static instance: Session = null;

    private constructor() {
        this.session = Nruntime.getCurrentSession();
    }

    public static getInstance(): Session {
        if (!Session.instance) {
            Session.instance = new Session();
        }

        return Session.instance;
    }

    public get(name: string): string {
        return this.session.get({
            name: name
        });
    }

    public set(name: string, value: string): void {
        this.session.set({
            name: name,
            value: value
        });
    }
}

export default Session;