/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Receipt.Details.Item.Actions.View"/>

import '../../../Commons/Utilities/JavaScript/Utils';

import * as receipt_details_item_actions_tpl from 'receipt_details_item_actions.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class Receipt.Details.Item.Actions.View @extend Backbone.View
const ReceiptDetailsItemActionsView: any = BackboneView.extend({
    template: receipt_details_item_actions_tpl,

    // @method getContext @return Receipt.Details.Item.Actions.View.Context
    getContext: function() {
        const line = this.model;
        const item = line.get('item');

        // @class Receipt.Details.Item.Actions.View.Context
        return {
            // @property {Model} line
            line: line,
            // @property {Boolean} showActions
            showActions:
                !!line.get('item').get('_isPurchasable') && item.get('itemtype') !== 'GiftCert',
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
export = ReceiptDetailsItemActionsView;
