/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductLine.Stock.View"/>

import * as product_line_stock_tpl from 'product_line_stock.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class ProductLine.Stock.View @extends Backbone.View
export = BackboneView.extend({
    template: product_line_stock_tpl,

    // @method initialize Override default method to attach model's change event to re-render
    // @param {ProductLine.Stock.View.Initialize.options} options
    // @return {Void}
    initialize: function() {
        this.model.on('change', this.render, this);
    },

    // @method destroy Override default method to detach from model's change event
    // @return {Void}
    destroy: function destroy() {
        BackboneView.prototype.destroy.apply(this, arguments);
        this.model.off('change', this.render, this);
    },

    // @method getContext
    // @return {ProductLine.Stock.View.Context}
    getContext: function() {
        this.stock_info = this.model.getStockInfo();

        // @class ProductLine.Stock.View.Context
        return {
            // @property {Boolean} showOutOfStockMessage
            showOutOfStockMessage: !!(
                !this.stock_info.isInStock && this.stock_info.showOutOfStockMessage
            ),
            // @property {Item.Model.StockInfo} stockInfo
            stockInfo: this.stock_info,
            // @property {Item.Model|Transaction.Line.Model|Item.Model model
            model: this.model,
            // @property {Boolean} showInStockMessage
            showInStockMessage:
                !(!this.stock_info.isInStock && this.stock_info.showOutOfStockMessage) &&
                !!this.stock_info.showInStockMessage,
            // @property {Boolean} isNotAvailableInStore
            isNotAvailableInStore: this.stock_info.isNotAvailableInStore,
            // @property {Boolean} showStockView
            showStockView: !SC.ENVIRONMENT.standalone
        };
        // @class ProductLine.Stock.View
    }
});

// @class ProductLine.Stock.View.Initialize.options
// @property {Transaction.Line.Model|Item.Model|Product.Model} model
