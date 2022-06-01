/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PickupInStore.FulfillmentOptions.View"/>

import * as pickup_in_store_fulfillment_options_tpl from 'pickup_in_store_fulfillment_options.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

const PickupInStoreFulfillmentOptionsView: any = BackboneView.extend({
    // @property {Function} template
    template: pickup_in_store_fulfillment_options_tpl,

    // @method initialize
    initialize: function initialize(options) {
        this.model = options.model;
    },

    // @method getContext
    getContext: function getContext() {
        this.item = this.model;

        const stock_information = this.model.getStockInfo();
        const is_available_for_ship =
            this.item.get('_isBackorderable') || this.item.get('_isInStock');

        return {
            // @property {Boolean} isAvailableForShip
            isAvailableForShip: is_available_for_ship,
            // @property {Boolean} isAvailableForPickup
            isAvailableForPickup: stock_information.isAvailableForPickup
        };
    }
});

export = PickupInStoreFulfillmentOptionsView;
