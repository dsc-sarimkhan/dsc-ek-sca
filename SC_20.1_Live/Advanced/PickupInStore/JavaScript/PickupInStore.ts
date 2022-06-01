/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PickupInStore"/>

import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import Location = require('../../Location.SCA/JavaScript/Location');
import ProductDetailsFullView = require('../../../Commons/ProductDetails/JavaScript/ProductDetails.Full.View');
import CartLinesView = require('../../../Commons/Cart/JavaScript/Cart.Lines.View');
import CartLinesFreeView = require('../../../Commons/Cart/JavaScript/Cart.Lines.Free.View');
import FacetsItemCellView = require('../../../Commons/Facets/JavaScript/Facets.ItemCell.View');
import PickupInStoreFulfillmentOptionsView = require('./PickupInStore.FulfillmentOptions.View');
import ProductLineCommonUrl = require('../../../Commons/ProductLine/JavaScript/ProductLine.Common.Url');
import ProductLineStockView = require('../../../Commons/ProductLine/JavaScript/ProductLine.Stock.View');
import PickupInStoreView = require('./PickupInStore.View');

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import Cookies = require('../../../Commons/Utilities/JavaScript/js.cookie');

const PickUpInStore: any =
    // @class ProductDetailToQuote @extend ApplicationModule
    {
        // @method mountToApp
        // @param {ApplicationSkeleton} application
        // @return {Void}
        mountToApp: function mountToApp(application) {
            if (!Configuration.get('siteSettings.isPickupInStoreEnabled')) {
                return;
            }

            ProductLineCommonUrl.attributesReflectedInURL.push('location');

            ProductLineCommonUrl.attributesReflectedInURL.push('fulfillmentChoice');

            // Set the extra children of the ProductDetailsFullView
            // We show the pickup in store view only if the item is purchasable.
            // If it is not, we show the Out of Stock message.
            ProductDetailsFullView.addChildViews({
                'Product.Stock.Info': function wrapperFunction(options) {
                    return function() {
                        if (options.model.getItem().get('ispurchasable')) {
                            return new PickupInStoreView({
                                model: options.model,
                                application: application
                            });
                        }
                        return new ProductLineStockView({
                            model: options.model
                        });
                    };
                }
            });

            // Set the extra children of the CartLinesView
            CartLinesView.addChildViews({
                'Product.Stock.Info': function wrapperFunction(options) {
                    return function() {
                        return new PickupInStoreView({
                            model: options.model,
                            application: application,
                            source: 'cart'
                        });
                    };
                }
            });

            // Set the extra children of the CartLinesView
            CartLinesFreeView.addChildViews({
                'Product.Stock.Info': function wrapperFunction(options) {
                    return function() {
                        return new PickupInStoreView({
                            model: options.model,
                            application: application,
                            source: 'cart'
                        });
                    };
                }
            });

            // Set the extra children of the FacetsItemCellView
            FacetsItemCellView.addChildViews({
                'ItemViews.Stock': function wrapperFunction(options) {
                    return function() {
                        if (
                            options.model.get('ispurchasable') &&
                            options.model.get('_isfulfillable')
                        ) {
                            return new PickupInStoreFulfillmentOptionsView({
                                model: options.model,
                                application: application
                            });
                        }
                        return new ProductLineStockView({
                            model: options.model
                        });
                    };
                }
            });

            application.getLayout().on('beforeAppendView', function(view) {
                if (view instanceof ProductDetailsFullView) {
                    const location_id =
                        view.model.get('location').get('internalid') || Cookies.get('myStore');

                    if (location_id) {
                        Location.fetchLocations(location_id).done(function() {
                            view.model.set('location', Location.get(location_id));
                        });
                    }
                }
            });
        }
    };

export = PickUpInStore;
