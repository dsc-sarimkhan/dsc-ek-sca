/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ErrorManagement.LoggedOut.View"/>

import * as Utils from '../../Utilities/JavaScript/Utils';
import * as error_management_logged_out_tpl from 'error_management_logged_out.tpl';

import ErrorManagementView = require('./ErrorManagement.View');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

const ErrorManagementLoggedOutView = ErrorManagementView.extend({
    template: error_management_logged_out_tpl,
    attributes: {
        id: 'logged-out'
    },
    title: Utils.translate('Logged out'),

    initialize: function() {
        this.labels = {
            title: Utils.translate('You have been logged out'),
            explanation: Utils.translate(
                'Your session expired or someone else logged in another device with your account. You must log in again to continue.'
            ),
            login: Utils.translate('Log in')
        };
    },
    showError: function() {},

    render: function() {
        const res = BackboneView.prototype.render.apply(this, arguments);
        this.$containerModal.find('[data-dismiss="modal"]').remove();
        return res;
    },

    // @method getContext @returns {ErrorManagement.LoggedOut.View.Context}
    getContext: function() {
        // @class ErrorManagement.LoggedOut.View.Context
        return {
            // @property {Object} labels
            labels: this.labels
        };
    }
});

export = ErrorManagementLoggedOutView;
