/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ErrorManagement.ExpiredLink.View"/>
/// <reference path="../../Utilities/JavaScript/GlobalDeclarations.d.ts" />
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended.d.ts" />

import * as Utils from '../../Utilities/JavaScript/Utils';
import * as error_management_expired_link_tpl from 'error_management_expired_link.tpl';

import ErrorManagementView = require('./ErrorManagement.View');

const ErrorManagementExpiredLinkView: any = ErrorManagementView.extend({
    template: error_management_expired_link_tpl,
    attributes: {
        id: 'expired_link',
        class: 'expired_link'
    },

    initialize: function(options) {
        if (options.title) {
            this.title = options.title;
        }

        if (options.page_header) {
            this.page_header = options.page_header;
        }

        if (options.message) {
            this.message = options.message;
        }

        if (SC.ENVIRONMENT.jsEnvironment === 'server') {
            nsglobal.statusCode = 500;
        }
    },

    // @method getContext @returns {ErrorManagement.ExpiredLink.View.Context}
    getContext: function() {
        // @class ErrorManagement.ExpiredLink.View.Context
        return {
            // @property {String} pageHeader
            pageHeader: this.page_header || '',
            // @property {String} message
            message:
                this.message ||
                Utils.translate('Sorry, we could not load the content you requested.')
        };
    }
});

export = ErrorManagementExpiredLinkView;
