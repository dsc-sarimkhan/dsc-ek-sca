/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Receipt.Details.Item.Summary.View"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import * as receipt_details_tiem_summary_tpl from 'receipt_details_item_summary.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class Receipt.Details.Item.Summary.View @extend Backbone.View
const ReceiptDetailsItemSummaryView: any = BackboneView.extend({
    template: receipt_details_tiem_summary_tpl,

    // @method getContext @return Receipt.Details.Item.Summary.View.Context
    getContext: function() {
        const line = this.model;

        // @class Receipt.Details.Item.Summary.View.Context
        return {
            // @property {Model} line
            line: line,
            // @property {Boolean} isDiscount
            isDiscountType: line.get('type') === 'Discount',
            // @property {Number} quantity
            quantity: line.get('quantity') || 0,
            // @property {Boolean} showAmount
            showAmount: !!line.get('amount_formatted'),
            // @property {String} amountFormatted
            amountFormatted: Utils.formatCurrency(line.get('amount_formatted')),
            // @property {String} totalFormatted
            totalFormatted: Utils.formatCurrency(line.get('total')),
            // @property {Boolean} hasDiscount
            hasDiscount: !!line.get('discount'),
            // @property {Boolean} showAmountLabel
            showAmountLabel: !!line.get('amount_label')
        };
    }
});

export = ReceiptDetailsItemSummaryView;
