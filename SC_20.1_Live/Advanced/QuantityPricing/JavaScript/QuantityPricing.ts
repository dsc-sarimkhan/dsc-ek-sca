/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="QuantityPricing"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />

import QuantityPricingView = require('./QuantityPricing.View');
import ProductDetailsFullView = require('../../../Commons/ProductDetails/JavaScript/ProductDetails.Full.View');
import ProductDetailsQuickViewView = require('../../../Commons/ProductDetails/JavaScript/ProductDetails.QuickView.View');
import RequestQuoteWizardModuleItemsLineQuantityView = require('../../RequestQuoteWizard/JavaScript/RequestQuoteWizard.Module.Items.Line.Quantity.View');
import ReorderItemsActionsQuantityView = require('../../ReorderItems/JavaScript/ReorderItems.Actions.Quantity.View');
import CartItemSummaryView = require('../../../Commons/Cart/JavaScript/Cart.Item.Summary.View');

// @class QuantityPricing @extend ApplicationModule
const QuantityPricing: any = {
    // @method mountToApp
    // @param {ApplicationSkeleton} application
    // @return {Void}
    mountToApp: function() {
        if (SC.ENVIRONMENT.siteSettings.quantitypricing) {
            // Set the quantity pricing on PDP
            ProductDetailsFullView.addChildViews &&
                ProductDetailsFullView.addChildViews({
                    'Quantity.Pricing': function wrapperFunction(options) {
                        return function() {
                            return new QuantityPricingView({
                                notUseAccordion: false,
                                model: options.model
                            });
                        };
                    }
                });

            // Set the quantity pricing on Request Quote Wizard Module Items Line Quantity
            RequestQuoteWizardModuleItemsLineQuantityView.addChildViews &&
                RequestQuoteWizardModuleItemsLineQuantityView.addChildViews({
                    'Quantity.Pricing': function wrapperFunction(options) {
                        return function() {
                            return new QuantityPricingView({
                                notUseAccordion: true,
                                model: options.model
                            });
                        };
                    }
                });

            // Set the quantity pricing on Reorder Item Action Quantity
            ReorderItemsActionsQuantityView.addChildViews &&
                ReorderItemsActionsQuantityView.addChildViews({
                    'Quantity.Pricing': function wrapperFunction(options) {
                        return function() {
                            return new QuantityPricingView({
                                notUseAccordion: true,
                                model: options.model
                            });
                        };
                    }
                });

            // Set the quantity pricing on QuickView
            ProductDetailsQuickViewView.addChildViews &&
                ProductDetailsQuickViewView.addChildViews({
                    'Quantity.Pricing': function wrapperFunction(options) {
                        return function() {
                            return new QuantityPricingView({
                                notUseAccordion: false,
                                model: options.model
                            });
                        };
                    }
                });

            // Set the quantity pricing on Cart transaction line
            CartItemSummaryView.addChildViews &&
                CartItemSummaryView.addChildViews({
                    'Quantity.Pricing': function wrapperFunction(options) {
                        return function() {
                            return new QuantityPricingView({
                                notUseAccordion: false,
                                model: options.model
                            });
                        };
                    }
                });
        }
    }
};

export = QuantityPricing;
