/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Account.ResetPassword.Model"/>
// @module Account.ResetPassword.Model

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

// @class Account.ResetPassword.Model
// Sends user input data to the reset password service
// validating passwords before they are sent
// [Backbone.validation](https://github.com/thedersen/backbone.validation)
// @extend Backbone.Mode
const AccountResetPasswordModel: any = Backbone.Model.extend({
    // @property {String} urlRoot
    urlRoot: Utils.getAbsoluteUrl('services/Account.ResetPassword.Service.ss'),

    // @property {Object} validation. Backbone.Validation attribute used for validating the form before submit.
    validation: {
        confirm_password: [
            {
                required: true,
                msg: Utils.translate('Confirm password is required')
            },
            {
                equalTo: 'password',
                msg: Utils.translate('New Password and Confirm Password do not match')
            }
        ],

        password: {
            required: true,
            msg: Utils.translate('New  password is required')
        }
    }
});

export = AccountResetPasswordModel;
