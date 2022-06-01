/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductViews.Price.View"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as product_views_price_tpl from 'product_views_price.tpl';

import ProfileModel = require('../../Profile/JavaScript/Profile.Model');
import Session = require('../../Session/JavaScript/Session');
import Configuration = require('../../Utilities/JavaScript/SC.Configuration');

import Backbone = require('../../Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// @class ProductViews.Price.View @extends BackboneView
const ProductViewsPriceView: any = BackboneView.extend(
    {
        // @property {Function} template
        template: product_views_price_tpl,

        // @method initialize
        // @param {ProductViews.Price.View.Initialize.Options} options
        // @return {Void}
        initialize: function() {
            this.model.on('change', this.render, this);
        },

        // @method getUrlLogin Get the login URL contains an origin hash parameter indicating the current URL to came back after login
        // @return {String}
        getUrlLogin: function(): string {
            const url =
                Session.get('touchpoints.login') +
                '&origin=' +
                (Configuration.get('currentTouchpoint') || 'home') +
                '&origin_hash=';

            return (
                url +
                encodeURIComponent(
                    this.options.origin === 'PDPQUICK'
                        ? this.model.generateURL().replace('/', '')
                        : Backbone.history.fragment
                )
            );
        },

        // @method getContext
        // @returns {ProductViews.Price.View.Context}
        getContext: function() {
            const price_container_object = this.model.getPrice();
            const is_price_range = !!(price_container_object.min && price_container_object.max);
            let showComparePrice = false;
            const frequency = this.model.get('frequency');
            const frequency_label = frequency ? ' / ' + frequency : '';

            // Show PreOrder or InStock when allow backorders.
            const backOrderPreOrder =
                Configuration.get('structureddatamarkup').availabilityonbackorder === 'PreOrder';

            if (!this.options.hideComparePrice) {
                showComparePrice = is_price_range
                    ? price_container_object.max.price < price_container_object.compare_price
                    : price_container_object.price < price_container_object.compare_price;
            }

            // @class ProductViews.Price.View.Context
            return {
                // @property {Boolean} isPriceEnabled
                isPriceEnabled: !ProfileModel.getInstance().hidePrices(),
                // @property {String} urlLogin
                urlLogin: this.getUrlLogin(),

                // @property {Boolean} isPriceRange
                isPriceRange: is_price_range,
                // @property {Boolean} showComparePrice
                showComparePrice: showComparePrice,
                // @property {Boolean} isInStock
                isInStock: this.model.getStockInfo().isInStock,
                // @property {Boolean} isPurchasable
                isPurchasable: this.model.getStockInfo().isPurchasable,
                // @property {Boolean} backOrderPreOrder
                backOrderPreOrder: backOrderPreOrder,
                // @property {Item.Model|Product.Model} model
                model: this.model,
                // @property {String} currencyCode
                currencyCode:
                    SC.getSessionInfo('currency') && SC.getSessionInfo('currency').code
                        ? SC.getSessionInfo('currency').code
                        : Configuration.get('siteSettings.shopperCurrency.code'),
                // @property {String} priceFormatted
                priceFormatted: price_container_object.price_formatted || '',
                // @property {String} comparePriceFormatted
                comparePriceFormatted: price_container_object.compare_price_formatted || '',
                // @property {String} minPriceFormatted
                minPriceFormatted: price_container_object.min
                    ? price_container_object.min.price_formatted
                    : '',
                // @property {String} maxPriceFormatted
                maxPriceFormatted: price_container_object.max
                    ? price_container_object.max.price_formatted
                    : '',
                // @property {Number} price
                price: price_container_object.price ? price_container_object.price : 0,
                // @property {Number} price
                frequency: frequency_label,
                // @property {Number} comparePrice
                comparePrice: price_container_object.compare_price
                    ? price_container_object.compare_price
                    : 0,
                // @property {Number} minPrice
                minPrice: price_container_object.min ? price_container_object.min.price : 0,
                // @property {Number} maxPrice
                maxPrice: price_container_object.max ? price_container_object.max.price : 0,

                // @property {Boolean} showHighlightedMessage
                showHighlightedMessage:
                    _.indexOf(ProductViewsPriceView.highlightedViews, this.options.origin) >= 0
            };
            // @class ProductViews.Price.View
        }
    },
    {
        // @property {Array<String>} highlightedViews Contains the list of all origins that in case of using the "LOGIN TO SEE PRICES" feature must render a highlighted notification message
        // @static
        highlightedViews: ['PDPQUICK', 'PDPFULL']
    }
);

export = ProductViewsPriceView;

// @class ProductViews.Price.View.Initialize.Options
// @property {String?} origin Possible values are:
//	PDPCONFIRMATION 		For the PDP confirmation message
//	ITEMCELL 				For each item being shown in the item list (ex your-domain.com/search)
//	PDPQUICK 				For a PDP being shown on a quick view form
//	PDPFULL 				Full PDP view
//	RELATEDITEM				Related Item
//	PRODUCTLISTDETAILSLATER	Used to render each item that was saved for later
//	PRODUCTLISTDETAILSFULL	Used to render each item that is shown inside My Account in the details of a particular Product List
//	PRODUCTLISTDETAILSEDIT	Used when rendering the form to edit an item inside a product list
//	ITEMVIEWCELL			For all list where items are rendered
//
// @property {Number?} linePrice Specify this value if you want to use a different price rather than the one of the line
// @property {String?} linePriceFormatted This string valid must be present if you want to use a custom price containing the formatted value of linePrice
// @property {Boolean?} hideComparePrice
// @property {Item.Model|Product.Model} model
