/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="RequestQuoteWizard.Permission.Error.View"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as requestquote_wizard_permission_error_tpl from 'requestquote_wizard_permission_error.tpl';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class RequestQuoteWizard.Permission.Error.View @extend Backbone.View
export = BackboneView.extend({
    // @property {Function} template
    template: requestquote_wizard_permission_error_tpl,

    // @property {String} page_header
    page_header: Utils.translate('Request a Quote'),

    // @property {String} title
    title: Utils.translate('Request a Quote'),

    // @property {String} bodyClass This property indicate the class used on the body to remove the My Account side menu
    bodyClass: 'force-hide-side-nav',

    // @method getContext
    // @return {RequestQuoteWizard.Permission.Error.View.Context}
    getContext: function() {
        // @class RequestQuoteWizard.Permission.Error.View.Context
        return {
            // @property {String} pageHeader
            pageHeader: this.page_header,
            // @property {Boolean} showSalesRepInformation Phone
            salesrepPhone: Configuration.get('quote.defaultPhone'),
            // @property {Boolean} showSalesRepInformation Email
            salesrepEmail: Configuration.get('quote.defaultEmail')
        };
        // @class RequestQuoteWizard.Permission.Error.View
    }
});
