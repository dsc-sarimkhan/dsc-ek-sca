/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SC.MyAccount.Starter"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

import entryPointModules = require('./SC.MyAccount.Starter.Dependencies');
import extensionsPromise = require('../../../Commons/SC.Extensions/JavaScript/SC.Extensions');

import SCMyAccount = require('../../MyAccountApplication/JavaScript/SC.MyAccount');

class MyAccountStarter {
    private myAccount;

    constructor() {
        this.myAccount = SCMyAccount.getInstance();
        this.myAccount.getConfig().siteSettings = SC.ENVIRONMENT.siteSettings || {};
        const self = this;
        jQuery(function() {
            extensionsPromise.then((...entryPointExtensionsModules) =>
                self.init(entryPointModules.concat(entryPointExtensionsModules))
            );
        });
    }

    private init(allModules): void {
        const modulesList = this.myAccount.modulesToLoad(allModules);
        this.myAccount.start(modulesList, () => {
            this.checkForErrors();
            this.myAccount.getLayout().appendToDom();
        });
    }

    private checkForErrors(): void {
        if (SC.ENVIRONMENT.contextError) {
            this.myAccount
                .getLayout()
                .$('#site-header')
                .hide();
            this.myAccount
                .getLayout()
                .$('#site-footer')
                .hide();
            this.myAccount
                .getLayout()
                .internalError(
                    SC.ENVIRONMENT.contextError.errorMessage,
                    'Error ' +
                        SC.ENVIRONMENT.contextError.errorStatusCode +
                        ': ' +
                        SC.ENVIRONMENT.contextError.errorCode
                );
        } else {
            const { fragment } = Utils.parseUrlOptions(location.search);
            if (fragment && !location.hash) {
                location.hash = decodeURIComponent(fragment.toString());
            }
            Backbone.history.start();
        }
    }
}

export = new MyAccountStarter();
