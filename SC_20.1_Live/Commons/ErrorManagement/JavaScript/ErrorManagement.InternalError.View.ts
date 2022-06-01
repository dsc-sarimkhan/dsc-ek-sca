/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ErrorManagement.InternalError.View"/>
/// <reference path="../../Utilities/JavaScript/GlobalDeclarations.d.ts" />
import * as Utils from '../../Utilities/JavaScript/Utils';

import * as error_management_internal_error_tpl from 'error_management_internal_error.tpl';

import ErrorManagementView = require('./ErrorManagement.View');

const ErrorManagementInternalErrorView: any = ErrorManagementView.extend({
    template: error_management_internal_error_tpl,
    attributes: {
        id: 'internal-error',
        class: 'internal-error'
    },
    title: Utils.translate('Internal Error'),
    page_header: Utils.translate('Internal Error'),

    initialize: function(options) {
        if (options.title) {
            this.title = options.title;
        }

        if (options.page_header || options.pageHeader) {
            this.page_header = options.page_header || options.pageHeader;
        }

        if (options.message) {
            this.message = options.message;
        }

        if (SC.ENVIRONMENT.jsEnvironment === 'server') {
            nsglobal.statusCode = 500;
        }
    },

    // @method getContext @returns {ErrorManagement.InternalError.View.Context}
    getContext: function() {
        // @class ErrorManagement.InternalError.View.Context
        return {
            // @property {String} pageHeader
            pageHeader: this.page_header,
            // @property {String} message
            message:
                this.message ||
                Utils.translate('Sorry, we could not load the content you requested.')
        };
    }
});

export = ErrorManagementInternalErrorView;
