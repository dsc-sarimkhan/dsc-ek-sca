/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Overview.Shipping.View"/>
// Overview.Shipping.View.js
// -----------------------

import * as overview_shipping_tpl from 'overview_shipping.tpl';

import AddressDetailsView = require('../../../Commons/Address/JavaScript/Address.Details.View');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

const OverviewShippingView: any = BackboneView.extend({
    template: overview_shipping_tpl,

    initialize: function() {},
    childViews: {
        'Address.Details': function() {
            return new AddressDetailsView({
                hideDefaults: true,
                hideActions: true,
                model: this.model,
                hideSelector: true
            });
        }
    },
    // @method getContext @returns {Overview.Shipping.View.Context}
    getContext: function() {
        // @class Overview.Shipping.View.Context
        return {
            // @property {Boolean} hasDefaultShippingAddress
            hasDefaultShippingAddress: !!this.model,
            // @property {String} shippingAddressInternalid
            shippingAddressInternalid: this.model && this.model.get('internalid')
        };
    }
});

export = OverviewShippingView;
