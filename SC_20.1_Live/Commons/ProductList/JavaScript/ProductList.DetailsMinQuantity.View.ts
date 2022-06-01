/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductList.DetailsMinQuantity.View"/>

import * as product_list_details_min_quantity_tpl from 'product_list_details_min_quantity.tpl';

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// @class ProductList.DetailsMinQuantity.View @extends Backbone.View
export = BackboneView.extend({
    template: product_list_details_min_quantity_tpl,

    // @method getContext
    // @return {ProductList.DetailsMinQuantity.View.Context}
    getContext: function() {
        const item_model = this.model.get('item');

        // @class ProductList.DetailsMinQuantity.View.Context
        return {
            // @property {Boolean} fulfillsMinQuantityRequirements
            fulfillsMinQuantityRequirements: this.model.fulfillsMinimumQuantityRequirement(),
            // @property {Number} minimumQuantity
            minimumQuantity: item_model.get('_minimumQuantity'),
            // @property {Boolean} fulfillsMaxQuantityRequirements
            fulfillsMaxQuantityRequirements: this.model.fulfillsMaximumQuantityRequirement(),
            // @property {Number} maximumQuantity
            maximumQuantity: item_model.get('_maximumQuantity'),
            // @property {Number} quantity
            quantity: this.model.get('quantity'),
            // @property {String} id
            id: this.model.get('internalid')
        };
        // @class ProductList.DetailsMinQuantity.View
    }
});
