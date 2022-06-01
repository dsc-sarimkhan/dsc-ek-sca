/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ReorderItems.Actions.Quantity.View"/>
import * as reorder_items_actions_quantity_tpl from 'reorder_items_actions_quantity.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class ReorderItems.Actions.Quantity.View @extends Backbone.View
const ReorderItemsActionsQuantityView: any = BackboneView.extend({
    // @propery {Function} template
    template: reorder_items_actions_quantity_tpl,

    // @method initialize
    initialize: function(options) {
        this.line = options.model;
    },

    events: {
        'click [data-action="plus"]': 'addQuantity',
        'click [data-action="minus"]': 'subQuantity'
    },

    addQuantity: function(e) {
        e.preventDefault();

        const $element = jQuery(e.target);
        const oldValue: any = $element
            .parent()
            .find('input')
            .val();
        const newVal = parseFloat(<any>oldValue) + 1;

        $element
            .parent()
            .find('input')
            .val(newVal);
    },

    subQuantity: function(e) {
        e.preventDefault();

        const $element = jQuery(e.target);
        const oldValue = $element
            .parent()
            .find('input')
            .val();
        let newVal = parseFloat(<any>oldValue) - 1;

        newVal = Math.max(1, newVal);

        $element
            .parent()
            .find('input')
            .val(newVal);
    },

    // @method getContext @returns ReorderItems.Actions.Quantity.View.Context
    getContext: function() {
        const item = this.line.get('item');
        const minimum_quantity = item.get('_minimumQuantity', true) || 1;
        const maximum_quantity = item.get('_maximumQuantity', true) || 0;
        const itemQuantity =
            this.line.get('quantity') > minimum_quantity
                ? this.line.get('quantity')
                : minimum_quantity;

        // @class ReorderItems.Actions.Quantity.View.Context
        return {
            // @propery {ReorderItems.Model} line
            line: this.line,
            // @propery {Boolean} showQuantityInput
            showQuantityInput: !!item.get('_isPurchasable'),
            // @propery {String} lineId
            lineId: this.line.get('internalid'),
            // @propery {Number} itemQuantity
            itemQuantity: itemQuantity,
            // @propery {Boolean} showLastPurchased
            showLastPurchased: !!this.line.get('trandate'),
            // @property {Boolean} showMinimumQuantity
            showMinimumQuantity: minimum_quantity > 1,
            // @property {Integer} minimumQuantity
            minimumQuantity: minimum_quantity,
            // @property {Boolean} showMinimumQuantity
            showMaximumQuantity: maximum_quantity !== 0,
            // @property {Integer} minimumQuantity
            maximumQuantity: maximum_quantity
        };
    }
});

export = ReorderItemsActionsQuantityView;
