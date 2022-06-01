/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Transaction.Line.Views.Cell.Actionable.View"/>

import * as _ from 'underscore';

import * as transaction_line_views_cell_actionable_tpl from 'transaction_line_views_cell_actionable.tpl';

import TransactionLineViewsPriceView = require('./Transaction.Line.Views.Price.View');
import ProductLineStockView = require('../../ProductLine/JavaScript/ProductLine.Stock.View');
import ProductLineSkuView = require('../../ProductLine/JavaScript/ProductLine.Sku.View');
import ProductLineStockDescriptionView = require('../../ProductLine/JavaScript/ProductLine.StockDescription.View');
import TransactionLineViewsTax = require('./Transaction.Line.Views.Tax');
import TransactionLineViewsOptionsSelectedView = require('./Transaction.Line.Views.Options.Selected.View');

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

const TransactionLineViewsCellActionableView: any = BackboneView.extend({
    template: transaction_line_views_cell_actionable_tpl,

    // @method initialize
    // @param {Transaction.Line.Views.Cell.Actionable.Initialize.Options} options
    // @return {Void}
    initialize: function() {},

    childViews: {
        'Item.Price': function() {
            return new TransactionLineViewsPriceView({
                model: this.model,
                showComparePrice: this.options.showComparePrice
            });
        },
        'Item.Sku': function() {
            return new ProductLineSkuView({
                model: this.model
            });
        },
        'Item.Tax.Info': function() {
            if (this.options.showTaxDetails) {
                return new TransactionLineViewsTax({
                    model: this.model
                });
            }
        },
        'Item.SelectedOptions': function() {
            return new TransactionLineViewsOptionsSelectedView({
                model: this.model
            });
        },
        'ItemViews.Stock.View': function() {
            return new ProductLineStockView({
                model: this.model
            });
        },
        'Item.Summary.View': function() {
            return new this.options.SummaryView(
                _.extend(
                    {
                        model: this.model,
                        application: this.options.application
                    },
                    this.options.summaryOptions || {}
                )
            );
        },
        'Item.Actions.View': function() {
            return new this.options.ActionsView(
                _.extend(
                    {
                        model: this.model,
                        application: this.options.application
                    },
                    this.options.actionsOptions || {}
                )
            );
        },
        StockDescription: function() {
            return new ProductLineStockDescriptionView({
                model: this.model
            });
        }
    },

    // @method getContext
    // @return {Transaction.Line.Views.Actionable.View.Context}
    getContext: function() {
        const item = this.model.get('item');

        // @class Transaction.Line.Views.Actionable.View.Context
        return {
            // @property {OrderLine.Model|Transaction.Line.Model} line
            line: this.model,
            // @property {OrderLine.Model|Transaction.Line.Model} model is an alias for line
            model: this.model,
            // @property {String} lineId
            lineId: this.model.get('internalid'),
            // @property {Item.Model} item
            item: item,
            // @property {String} itemId
            itemId: item.get('internalid'),
            // @property {String} linkAttributes
            linkAttributes: this.model.getFullLink({
                quantity: null,
                location: null,
                fulfillmentChoice: null
            }),
            // @property {Boolean} isNavigable
            isNavigable: !!this.options.navigable && !!item.get('_isPurchasable'),
            // @property {Boolean} showCustomAlert
            showCustomAlert: !!item.get('_cartCustomAlert'),
            // @property {String} customAlertType
            customAlertType: item.get('_cartCustomAlertType') || 'info',
            // @property {Boolean} showActionsView
            showActionsView: !!this.options.ActionsView,
            // @property {Boolean} showSummaryView
            showSummaryView: !!this.options.SummaryView,
            // @property {Boolean} showAlert
            showAlert: !_.isUndefined(this.options.showAlert) ? !!this.options.showAlert : true,
            // @property {Boolean} showGeneralClass
            showGeneralClass: !!this.options.generalClass,
            // @property {String} generalClass
            generalClass: this.options.generalClass,
            // @property {ImageContainer} thumbnail
            thumbnail: this.model.getThumbnail(),
            // @property {Boolean} isFreeGift
            isFreeGift: this.model.get('free_gift') === true
        };
        // @class Transaction.Line.Views.Actionable.View
    }
});

export = TransactionLineViewsCellActionableView;
