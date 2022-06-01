/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Account.Login.Model"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts"/>
// @module Account.Login.Model

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

// @class Account.Login.Model
// Sends user input data to the login service
// validating email and password before they are sent
// [Backbone.validation](https://github.com/thedersen/backbone.validation)
// @extend Backbone.Model
const AccountLoginModel: any = Backbone.Model.extend({
    // @property {String} urlRoot
    urlRoot:
        Utils.getAbsoluteUrl('services/Account.Login.Service.ss') +
        '?n=' +
        SC.ENVIRONMENT.siteSettings.siteid,

    // @property validation. Backbone.Validation attribute used for validating the form before submit.
    validation: {
        email: {
            required: true,
            pattern: 'email',
            msg: Utils.translate('Valid Email is required')
        },
        password: {
            required: true,
            msg: Utils.translate('Please enter a valid password')
        }
    }
});

export = AccountLoginModel;
