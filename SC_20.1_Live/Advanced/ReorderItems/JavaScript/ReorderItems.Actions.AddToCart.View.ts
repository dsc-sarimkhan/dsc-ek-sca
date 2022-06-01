/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ReorderItems.Actions.AddToCart.View"/>
import * as _ from 'underscore';

import * as reorder_items_actions_add_to_cart_tpl from 'reorder_items_actions_add_to_cart.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class ReorderItems.Actions.AddToCart.View @extends Backbone.View
const ReorderItemsActionsAddToCartView: any = BackboneView.extend({
    // @propery {Function} template
    template: reorder_items_actions_add_to_cart_tpl,
    // @method initialize
    initialize: function(options) {
        this.line = options.model;
    },
    // @method getContext @returns ReorderItems.Actions.AddToCart.View.Context
    getContext: function() {
        const item = this.line.get('item');
        const item_id = item.get('_id');
        const parent_internalid = this.line.get('item').get('parent_internalid');
        const format_options = _.map(this.line.get('options_object'), function(option: any) {
            return option.id + '=' + option.value;
        }).join(',');
        // @class ReorderItems.Actions.AddToCart.View.Context
        return {
            // @propery {ReorderItems.Model} line
            line: this.line,
            // @propery {Boolean} disableButtonAddToCart
            disableButtonAddToCart: !item.get('_isPurchasable'),
            // @propery {String} itemOptions
            itemOptions: format_options,
            // @propery {String} lineId
            lineId: this.line.get('internalid'),
            // @propery {String} itemId
            itemId: item_id,
            // @propery {String} parentItemId
            parentItemId: parent_internalid
        };
    }
});

export = ReorderItemsActionsAddToCartView;
