/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductDetailToQuote"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />

import ProductDetailsFullView = require('../../../Commons/ProductDetails/JavaScript/ProductDetails.Full.View');
import ProductDetailsQuickViewView = require('../../../Commons/ProductDetails/JavaScript/ProductDetails.QuickView.View');
import ProductDetailToQuoteView = require('./ProductDetailToQuote.View');

// @class ProductDetailToQuote @extend ApplicationModule
const ProductDetailToQuote: any = {
    // @method mountToApp
    // @param {ApplicationSkeleton} application
    // @return {Void}
    mountToApp: function mountToApp(application) {
        // We show the ProductDetailToQuote only if is not the SEO
        if (!SC.isPageGenerator()) {
            // Set the extra children of the ProductDetailsFullView
            ProductDetailsFullView.addChildViews({
                'ProductDetails.AddToQuote': function wrapperFunction(options) {
                    return function() {
                        return new ProductDetailToQuoteView({
                            model: options.model,
                            application: application
                        });
                    };
                }
            });

            // Set the extra children of the ProductDetailsQuickViewView
            ProductDetailsQuickViewView.addChildViews({
                'ProductDetails.AddToQuote': function wrapperFunction(options) {
                    return function() {
                        return new ProductDetailToQuoteView({
                            model: options.model,
                            application: application
                        });
                    };
                }
            });
        }
    }
};

export = ProductDetailToQuote;
