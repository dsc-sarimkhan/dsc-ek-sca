/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Facets.ItemCell.View"/>

import * as _ from 'underscore';

import * as Utils from '../../Utilities/JavaScript/Utils';

import ProductLineStockView = require('../../../Commons/ProductLine/JavaScript/ProductLine.Stock.View');
import ProductModel = require('../../../Commons/Product/JavaScript/Product.Model');
import GlobalViewsStarRating = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.StarRating.View');
import CartQuickAddToCartView = require('../../../Commons/Cart/JavaScript/Cart.QuickAddToCart.View');
import ProductViewsOptionView = require('../../../Commons/ProductViews/JavaScript/ProductViews.Option.View');
import ProductLineStockDescriptionView = require('../../../Commons/ProductLine/JavaScript/ProductLine.StockDescription.View');
import Configuration = require('../../Utilities/JavaScript/SC.Configuration');

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
// @module Facets

// @class Facets.ItemCell.View @extends Backbone.View
export = BackboneView.extend({
    // @method initialize Override default method to convert this View into Composite
    // @param {Facets.ItemCell.View.Initialize.Options} options
    // @return {Void}
    initialize: function() {
        BackboneCompositeView.add(this);
    },

    contextData: {
        item: function() {
            return Utils.deepCopy(this.model);
        }
    },

    childViews: {
        'ItemViews.Stock': function() {
            return new ProductLineStockView({
                model: this.model
            });
        },

        'GlobalViews.StarRating': function() {
            const view = new GlobalViewsStarRating({
                model: this.model,
                showRatingCount: false,
                queryOptions: Utils.parseUrlOptions(location.href)
            });

            return this.options.showStarRating === false ? null : view;
        },

        'ItemDetails.Options': function() {
            const options_configuration = Configuration.get('ItemOptions.optionsConfiguration', []);

            return new BackboneCollectionView({
                collection: _.filter(this.model.get('options').sortBy('index'), function(
                    option: any
                ) {
                    const option_configuration: any = _.findWhere(options_configuration, {
                        cartOptionId: option.get('cartOptionId')
                    });
                    return option_configuration && option_configuration.showSelectorInList;
                }),
                childView: ProductViewsOptionView,
                viewsPerRow: 1,
                childViewOptions: {
                    item: this.model,
                    templateName: 'facetCell',
                    showLink: true,
                    hideLabel: true,
                    showSmall: true
                }
            });
        },

        'Cart.QuickAddToCart': function() {
            const product = new ProductModel({
                item: this.model,
                quantity: this.model.get('_minimumQuantity', true)
            });

            return new CartQuickAddToCartView({
                model: product,
                application: this.options.application
            });
        },

        StockDescription: function() {
            return new ProductLineStockDescriptionView({
                model: this.model
            });
        }
    },

    // @method getContext @returns {Facets.ItemCell.View.Context}
    getContext: function() {
        // @class Facets.ItemCell.View.Context
        return {
            // @property {String} itemId
            itemId: this.model.get('_id'),
            // @property {String} name
            name: this.model.get('_name'),
            // @property {String} url
            url: this.model.get('_url'),
            // @property {String} sku
            sku: this.model.getSku(),
            // @property {Boolean} isEnvironmentBrowser
            isEnvironmentBrowser:
                SC.ENVIRONMENT.jsEnvironment === 'browser' && !SC.ENVIRONMENT.isTouchEnabled,
            // @property {ImageContainer} thumbnail
            thumbnail: this.model.getThumbnail(),
            // @property {Boolean} itemIsNavigable
            itemIsNavigable: !_.isUndefined(this.options.itemIsNavigable)
                ? !!this.options.itemIsNavigable
                : true,
            // @property {Boolean} showRating
            showRating: SC.ENVIRONMENT.REVIEWS_CONFIG && SC.ENVIRONMENT.REVIEWS_CONFIG.enabled,
            // @property {Number} rating
            rating: this.model.get('_rating'),
            // @property {String} track_productlist_list
            track_productlist_list: this.model.get('track_productlist_list'),
            // @property {String} track_productlist_position
            track_productlist_position: this.model.get('track_productlist_position'),
            // @property {String} track_productlist_category
            track_productlist_category: this.model.get('track_productlist_category')
        };
        // @class Facets.ItemCell.View
    }
});
