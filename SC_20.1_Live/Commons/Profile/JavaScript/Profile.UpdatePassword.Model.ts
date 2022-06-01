/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Profile.UpdatePassword.Model"/>
import * as Utils from '../../Utilities/JavaScript/Utils';

import Backbone = require('../../Utilities/JavaScript/backbone.custom');

// Profile.UpdatePassword.Model.js
// -----------------------
// View Model for changing user's password

// @class Profile.UpdatePassword.Model @extends Backbone.Model
const ProfileUpdatePasswordModel: any = Backbone.Model.extend({
    urlRoot: 'services/Profile.Service.ss',
    validation: {
        current_password: { required: true, msg: Utils.translate('Current password is required') },
        confirm_password: [
            { required: true, msg: Utils.translate('Confirm password is required') },
            {
                equalTo: 'password',
                msg: Utils.translate('New Password and Confirm Password do not match')
            }
        ],

        password: { required: true, msg: Utils.translate('New password is required') }
    }
});

export = ProfileUpdatePasswordModel;
