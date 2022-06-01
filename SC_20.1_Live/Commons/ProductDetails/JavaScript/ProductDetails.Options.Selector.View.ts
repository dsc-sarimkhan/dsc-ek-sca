/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductDetails.Options.Selector.View"/>

import * as product_details_options_selector_tpl from 'product_details_options_selector.tpl';

import ProductViewsOptionView = require('../../ProductViews/JavaScript/ProductViews.Option.View');
import BackboneCompositeView = require('../../Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import ProductViewsPriceView = require('../../ProductViews/JavaScript/ProductViews.Price.View');
import ProductLineStockView = require('../../ProductLine/JavaScript/ProductLine.Stock.View');
import ProductLineStockDescriptionView = require('../../ProductLine/JavaScript/ProductLine.StockDescription.View');
import ProductDetailsOptionsSelectorPusherView = require('./ProductDetails.Options.Selector.Pusher.View');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// @class ProductDetails.Options.Selector.View.initialize
// @property {Transaction.Line.Model} model

const ProductDetailsOptionsSelectorView: any = BackboneView.extend({
    // @property {Function} template
    template: product_details_options_selector_tpl,

    // @method initialize Override default method to made current view composite
    // @param {ProductDetails.Options.Selector.View.initialize} options
    // @return {Void}
    initialize: function() {
        BackboneView.prototype.initialize.apply(this, arguments);
        BackboneCompositeView.add(this);
    },

    // @method render Override default method to made current view composite
    // @param {ProductDetails.Options.Selector.View.render}
    // @return {Void}
    render: function() {
        if (!this.model.get('options').length) {
            return;
        }

        this._render();
    },
    // @property {ChildViews} childViews
    childViews: {
        Pusher: function() {
            return new ProductDetailsOptionsSelectorPusherView({
                model: this.model
            });
        },
        'Options.Collection': function() {
            return new BackboneCollectionView({
                collection: this.model.getVisibleOptions(),
                childView: ProductViewsOptionView,
                viewsPerRow: 1,
                childViewOptions: {
                    line: this.model,
                    item: this.model.get('item'),
                    templateName: 'selector',
                    show_required_label: this.options.show_required_label
                }
            });
        },
        'Item.Price': function() {
            return new ProductViewsPriceView({
                model: this.model,
                origin: 'PDPOPTIONS'
            });
        },
        'Item.Stock': function() {
            return new ProductLineStockView({
                model: this.model
            });
        },
        StockDescription: function() {
            return new ProductLineStockDescriptionView({
                model: this.model
            });
        }
    },

    // @method getContext
    // @return {ProductDetails.Options.Selector.View.Context}
    getContext: function() {
        // @class ProductDetails.Options.Selector.View.Context
        return {
            // @property {ProductModel} model
            model: this.model,
            // @property {Boolean} showPusher
            showPusher: this.options.show_pusher,
            // @property {Boolean} showRequiredLabel
            showRequiredLabel: this.options.show_required_label
        };
        // @class ProductDetails.Options.Selector.View
    }
});

export = ProductDetailsOptionsSelectorView;
