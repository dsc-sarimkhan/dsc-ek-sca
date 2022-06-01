/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Account.Register.Model"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts"/>
// @module Account.Register.Model

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

// @class Account.Register.Model
// Sends user input data to the register service
// validating fields before they are sent
// [Backbone.validation](https://github.com/thedersen/backbone.validation)
// @extend Backbone.Model
const AccountRegisterModel: any = Backbone.Model.extend({
    // @property {String} urlRoot
    urlRoot: Utils.getAbsoluteUrl('services/Account.Register.Service.ss'),

    // @property {Object} validation. Backbone.Validation attribute used for validating the form before submit.
    validation: {
        firstname: {
            required: true,
            msg: Utils.translate('First Name is required')
        },
        lastname: {
            required: true,
            msg: Utils.translate('Last Name is required')
        },
        email: {
            required: true,
            pattern: 'email',
            msg: Utils.translate('Valid Email is required')
        },
        company: {
            required: SC.ENVIRONMENT.siteSettings.registration.companyfieldmandatory === 'T',
            msg: Utils.translate('Company Name is required')
        },
        password: {
            required: true,
            msg: Utils.translate('Please enter a valid password')
        },
        password2: [
            {
                required: true,
                msg: Utils.translate('Confirm password is required')
            },
            {
                equalTo: 'password',
                msg: Utils.translate('New Password and Confirm Password do not match')
            }
        ]
    }
});

export = AccountRegisterModel;
