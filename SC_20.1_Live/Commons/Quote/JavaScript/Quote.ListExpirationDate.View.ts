/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Quote.ListExpirationDate.View"/>

import * as quote_list_expiration_date_tpl from 'quote_list_expiration_date.tpl';

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');
import Backbone = require('../../Utilities/JavaScript/backbone.custom');

// @class Quote.ListExpirationDate.View @extends Backbone.View
export = BackboneView.extend({
    // @property {Function} template
    template: quote_list_expiration_date_tpl,

    // @method getContext
    // @return {Quote.ListExpirationDate.View.Context}
    getContext: function() {
        // @class Quote.ListExpirationDate.View.Context
        return {
            // @property {Quote.Model} collection
            model: this.model
        };
        // @class Quote.ListExpirationDate.View
    }
});
