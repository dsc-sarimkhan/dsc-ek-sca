/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderHistory.Item.Actions.View"/>

import '../../../Commons/Utilities/JavaScript/Utils';

import * as order_history_item_actions_tpl from 'order_history_item_actions.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class OrderHistory.Item.Actions.View @extend Backbone.View
const OrderHistoryItemActionsView: any = BackboneView.extend({
    // @property {Function} template
    template: order_history_item_actions_tpl,

    // @method getContext @return OrderHistory.Item.Actions.View.Context
    getContext: function() {
        const line = this.model;
        const item = line.get('item');

        // @class OrderHistory.Item.Actions.View.Context
        return {
            isStandalone: !!this.options.application.isStandalone,
            // @property {Model} line
            line: line,
            // @property {String} lineId
            lineId: line.get('internalid') || line.get('id'),
            // @property {Boolean} showActions
            showActions:
                !!line.get('item').get('_isPurchasable') &&
                item.get('itemtype') !== 'GiftCert' &&
                line.get('free_gift') !== true,
            // @property {String} itemURL
            itemURL: item.get('_url'),
            // @property {String} itemSKU
            itemSKU: item.get('_sku'),
            // @property {String} itemParentId
            itemParentId: item.get('parent_internalid'),
            // @property {String} lineFormatOptions
            lineFormatOptions: line.format_options,
            // @property {String} itemId
            itemId: item.get('_id'),
            // @property {Boolean} isQuantityGreaterThan1
            isQuantityGreaterThan1: line.quantity > 1
        };
    }
});

export = OrderHistoryItemActionsView;
