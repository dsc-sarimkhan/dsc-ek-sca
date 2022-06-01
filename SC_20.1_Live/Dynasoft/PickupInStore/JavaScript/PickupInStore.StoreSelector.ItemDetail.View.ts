/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PickupInStore.StoreSelector.ItemDetail.View"/>

import * as transaction_line_views_cell_navigable_tpl from 'transaction_line_views_cell_navigable.tpl';

import TransactionLineViewsPriceView = require('../../../Commons/Transaction.Line.Views/JavaScript/Transaction.Line.Views.Price.View');
import ProductLineSkuView = require('../../../Commons/ProductLine/JavaScript/ProductLine.Sku.View');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

const PickupInStoreStoreSelectorItemDetailView: any = BackboneView.extend({
    // @property {Function} template
    template: transaction_line_views_cell_navigable_tpl,

    // @method initialize
    // @param {PickupInStore.StoreSelector.ItemDetail.View.InitializeParameters} options
    initialize: function(options) {
        this.options = options;
        this.application = options.application;
        this.model = options.model;
    },

    // @property {ChildViews} childViews
    childViews: {
        'Item.Price': function() {
            return new TransactionLineViewsPriceView({
                model: this.model
            });
        },
        'Item.Sku': function() {
            return new ProductLineSkuView({
                model: this.model
            });
        }
    },

    // @method getContext
    // @return {PickupInStore.StoreSelector.ItemDetail.View.Context}
    getContext: function() {
        const item = this.model.get('item');

        // @class PickupInStore.StoreSelector.ItemDetail.View.Context
        return {
            // @property {String} itemName
            itemName: item.get('_name'),
            // @property {ImageContainer} thumbnail
            thumbnail: this.model.getThumbnail()
        };
    }
});

export = PickupInStoreStoreSelectorItemDetailView;
