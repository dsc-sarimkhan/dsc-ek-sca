/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Transaction.Line.Views.Cell.Selectable.View"/>

import * as _ from 'underscore';

import * as transaction_line_views_cell_selectable_tpl from 'transaction_line_views_cell_selectable.tpl';

import TransactionLineViewsOptionsSelectedView = require('./Transaction.Line.Views.Options.Selected.View');
import ProductLineStockView = require('../../ProductLine/JavaScript/ProductLine.Stock.View');
import ProductLineSkuView = require('../../ProductLine/JavaScript/ProductLine.Sku.View');
import ProductLineStockDescriptionView = require('../../ProductLine/JavaScript/ProductLine.StockDescription.View');

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

const TransactionLineViewsCellSelectableView: any = BackboneView.extend({
    template: transaction_line_views_cell_selectable_tpl,

    initialize: function(options) {
        this.options = options;
        this.application = options.application;
        this.model = options.model;
    },

    childViews: {
        'Item.Options': function() {
            return new TransactionLineViewsOptionsSelectedView({
                model: this.model
            });
        },
        'Detail1.View': function() {
            const View = this.options.detail1;
            const detail1_options = _.extend(
                {
                    model: this.model
                },
                this.options.detail1Options || {}
            );

            return new View(detail1_options);
        },
        'ItemViews.Stock.View': function() {
            return new ProductLineStockView({
                model: this.model.get('item')
            });
        },
        'Item.Sku': function() {
            return new ProductLineSkuView({
                model: this.model
            });
        },
        StockDescription: function() {
            return new ProductLineStockDescriptionView({
                model: this.model.get('item')
            });
        }
    },

    // @method getContext
    // @return {Transaction.Line.Views.Selectable.View.Context}
    getContext: function() {
        const item = this.model.get('item');
        const line = this.model;

        // @class Transaction.Line.Views.Selectable.View.Context
        return {
            // @property {String} itemId
            itemId: item.get('internalid'),
            // @property {String} itemType
            itemType: item.get('itemtype'),
            // @property {String} itemName
            itemName: item.get('_name'),
            // @property {String} lineId
            lineId: line.id,
            // @property {Boolean} isLineSelected
            isLineSelected: line.get('check'),
            // @property {String} rateFormatted
            rateFormatted: line.get('rate_formatted'),
            // @property {Boolean} showOptions
            showOptions: !!(line.get('options') && line.get('options').length),
            // @property {Boolean} isNavigable
            isNavigable: !!this.options.navigable,
            // @property {String} itemURLAttributes
            itemURLAttributes: this.model.getFullLink({
                quantity: null,
                location: null,
                fulfillmentChoice: null
            }),
            // @property {Boolean} showDetail1Title
            showDetail1Title: !!this.options.detail1Title,
            // @property {String} detail1Title
            detail1Title: this.options.detail1Title,
            // @property {String} detail1
            detail1: line.get(this.options.detail1),
            // @property {Boolean} isDetail1Composite
            isDetail1Composite: _.isFunction(this.options.detail1),
            // @property {Boolean} showDetail2Title
            showDetail2Title: !!this.options.detail2Title,
            // @property {String} detail2Title
            detail2Title: this.options.detail2Title,
            // @property {String} detail2
            detail2: line.get(this.options.detail2),
            // @property {Boolean} showDetail3Title
            showDetail3Title: !!this.options.detail3Title,
            // @property {String} detail3Title
            detail3Title: this.options.detail3Title,
            // @property {String} detail3
            detail3: line.get(this.options.detail3),
            // @property {ImageContainer} thumbnail
            thumbnail: this.model.getThumbnail()
        };
    }
});
export = TransactionLineViewsCellSelectableView;
