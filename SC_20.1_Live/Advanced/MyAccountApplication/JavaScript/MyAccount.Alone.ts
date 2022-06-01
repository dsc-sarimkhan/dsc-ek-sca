/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="MyAccount.Alone"/>

import * as _ from 'underscore';
import * as Layout from './SC.MyAccount.Layout';

import MyAccountFull = require('./MyAccount.Full');
import IMyAccount = require('./IMyAccount');

class MyAccountAlone extends MyAccountFull implements IMyAccount {
    public isStandalone: boolean;

    static readonly _internalName: string = 'MyAccount.Alone';

    public static getName(): string {
        return MyAccountAlone._internalName;
    }

    constructor(appName: string) {
        super(appName);
        this.Layout = Layout;
        this.isStandalone = true;
        this.on('afterModulesLoaded', this.onAfterModulesLoadedHandler);
    }

    onAfterModulesLoadedHandler = (): void => {
        this.off('afterModulesLoaded');
    };

    modulesToLoad = (entryPointModules: any) => {
        return _.filter(entryPointModules, (module: any) => module && !module.excludeFromMyAccount);
    };

    clearLayout = layout => {
        const applicationLayout = layout.application._layoutInstance;
    };
}

export = MyAccountAlone;
