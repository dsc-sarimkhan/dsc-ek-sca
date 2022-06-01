/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductDetails.Full.View"/>

import * as _ from 'underscore';
import * as product_details_full_tpl from 'product_details_full.tpl';
import { JSONObject } from '../../Utilities/JavaScript/Utils.Interfaces';
import {
    Product as JsonldProduct,
    Offer as JsonldOffer
} from '../../../node_modules/schema-dts/schema';
import * as jQuery from '../../Core/JavaScript/jQuery';

import ProductDetailsBaseView = require('./ProductDetails.Base.View');
import Configuration = require('../../Utilities/JavaScript/SC.Configuration');
import ItemRelationsRelatedView = require('../../ItemRelations/JavaScript/ItemRelations.Related.View');
import ItemRelationsCorrelatedView = require('../../ItemRelations/JavaScript/ItemRelations.Correlated.View');
import ProductDetailsInformationView = require('./ProductDetails.Information.View');
import SocialSharingFlyoutView = require('../../SocialSharing/JavaScript/SocialSharing.Flyout.View');

import ProfileModel = require('../../Profile/JavaScript/Profile.Model');

// @class ProductDetails.Full.View Handles the PDP and quick view @extend Backbone.View
const ProductDetailsFullView: any = ProductDetailsBaseView.extend({
    // @property {Function} template
    template: product_details_full_tpl,

    // @property {Object} attributes List of HTML attributes applied by Backbone into the $el
    attributes: {
        id: 'ProductDetails.Full.View',
        class: 'view product-detail',
        'data-root-component-id': 'ProductDetails.Full.View'
    },

    bindings: _.extend({}, ProductDetailsBaseView.prototype.bindings, {}),

    // @method initialize Override default method to update the url on changes in the current
    // product
    // @param {ProductDetails.Full.View.Initialize.Options} options
    // @return {Void}
    initialize: function initialize(): void {
        ProductDetailsBaseView.prototype.initialize.apply(this, arguments);
        this.model.on('change', this.updateURL, this);
        // Tracker.getInstance().trackProductView(this.model);
    },

    childViews: _.extend({}, ProductDetailsBaseView.prototype.childViews, {
        'Correlated.Items': function(): any {
            return new ItemRelationsCorrelatedView({
                itemsIds: this.model.get('item').get('internalid'),
                application: this.application
            });
        },
        'Related.Items': function(): any {
            return new ItemRelationsRelatedView({
                itemsIds: this.model.get('item').get('internalid'),
                application: this.application
            });
        },
        'Product.Information': function(): any {
            return new ProductDetailsInformationView({
                model: this.model
            });
        },
        'SocialSharing.Flyout': function(): any {
            return new SocialSharingFlyoutView({});
        }
    }),

    // @method destroy Override default method to detach from change event of the current product
    // @return {Void}
    destroy: function destroy(): any {
        this.model.off('change');
        return this._destroy();
    },

    // @method Create JsonLd object with product basic info
    // @param {JSONObject} childJsonLd
    // @return {JQuery.Deferred<JsonldProduct>}
    getJsonLd: function getJsonLd(childJsonLd: JSONObject): JQuery.Deferred<JsonldProduct> {
        if (Configuration.get('structureddatamarkup.type') !== 'JSON-LD') {
            return jQuery.Deferred().resolve(null);
        }

        const priceContainerObject = this.model.getPrice();
        const isPriceRange = priceContainerObject.min && priceContainerObject.max;
        const modelItem = this.model.get('item');
        const stockInfo = this.model.getStockInfo();

        const offers: JsonldOffer = {
            '@type': 'Offer',
            url: modelItem.get('_url'),
            availability: 'http://schema.org/OutOfStock'
        };

        // Get availability
        if (stockInfo.isPurchasable && !stockInfo.isInStock) {
            offers.availability =
                Configuration.get('structureddatamarkup').availabilityonbackorder === 'PreOrder'
                    ? 'http://schema.org/PreOrder'
                    : 'http://schema.org/InStock';
        } else if (stockInfo.isInStock) {
            offers.availability = 'http://schema.org/InStock';
        }

        // Get price
        if (!ProfileModel.getInstance().hidePrices()) {
            if (isPriceRange) {
                offers.priceSpecification = {
                    '@type': 'PriceSpecification',
                    price: this.model.getPrice().price,
                    minPrice: priceContainerObject.min.price,
                    maxPrice: priceContainerObject.max.price
                };
            } else {
                offers.price = this.model.getPrice().price;
            }

            offers.priceCurrency =
                SC.getSessionInfo('currency') && SC.getSessionInfo('currency').code
                    ? SC.getSessionInfo('currency').code
                    : Configuration.get('siteSettings.shopperCurrency.code');
        }

        const storedetaileddescription = jQuery(
            `<div>${modelItem.attributes.storedetaileddescription}</div>`
        ).text();

        const childJsonLdCopy = childJsonLd;
        delete childJsonLdCopy['@type'];

        const jsonld: JsonldProduct = {
            '@type': 'Product',
            name: this.page_header,
            image: this.model.getImages()[0].url.toString(),
            offers: offers,
            description: storedetaileddescription.length > 0 ? storedetaileddescription : undefined,
            sku: this.model.getSku() ? this.model.getSku() : undefined,
            ...childJsonLdCopy
        };

        return jQuery.Deferred().resolve(jsonld);
    },

    // @method showOptionsPusher Override parent method to allow hide/show the option's pusher on
    // mobile depending on the configuration value: ItemOptions.maximumOptionValuesQuantityWithoutPusher
    // @return {Booelan}
    showOptionsPusher: function showOptionsPusher(): boolean {
        const options_values_length = _.reduce(
            this.model.getVisibleOptions().map(function(option) {
                if (_.isArray(option.get('values'))) {
                    const invalid_values = _.filter(option.get('values'), (value: any) => {
                        return !value.internalid;
                    });

                    return option.get('values').length - invalid_values.length;
                }
                return 0;
            }),
            (memo: any, num: any) => {
                return memo + num;
            },
            0
        );

        return (
            options_values_length >
            Configuration.get('ItemOptions.maximumOptionValuesQuantityWithoutPusher', 1)
        );
    },

    // @method getContext
    // @return {ProductDetails.Full.View.Context}
    getContext: function getContext(): any {
        // @class ProductDetails.Full.View.Context @extend ProductDetails.Base.View.Context
        return _.extend(ProductDetailsBaseView.prototype.getContext.apply(this, arguments), {});
        // @class ProductDetails.Full.View
    }
});

export = ProductDetailsFullView;

// @class ProductDetails.Full.View.Initialize.Options
// @extend ProductDetails.Base.View.Initialize.Options
