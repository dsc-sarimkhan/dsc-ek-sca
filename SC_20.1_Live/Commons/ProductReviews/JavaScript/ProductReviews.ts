/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductReviews"/>
/// <reference path="../../Utilities/JavaScript/GlobalDeclarations.d.ts" />

import * as Utils from '../../Utilities/JavaScript/Utils';

import ProductReviewsFormView = require('./ProductReviews.Form.View');
import ProductReviewsCenterView = require('./ProductReviews.Center.View');
import GlobalViewsStarRatingView = require('../../GlobalViews/JavaScript/GlobalViews.StarRating.View');
import ProductDetailsFullView = require('../../ProductDetails/JavaScript/ProductDetails.Full.View');

// Defines the ProductReviews module (Model, Collection, Views)
// Mount to App also handles rendering of the reviews
// if the current view has any placeholder for them

// @class ProductReviews @extends ApplicationModule
const ProductReviewsModule: any = {
    mountToApp: function(application) {
        if (SC.ENVIRONMENT.REVIEWS_CONFIG && SC.ENVIRONMENT.REVIEWS_CONFIG.enabled) {
            const pageType = application.getComponent('PageType');

            pageType.registerPageType({
                name: 'product-review-form',
                routes: [':product/:id/newReview', ':url/newReview'],
                view: ProductReviewsFormView,
                defaultTemplate: {
                    name: 'product_reviews_form.tpl',
                    displayName: 'Product review form default',
                    thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                        'img/default-layout-product-review-form.png'
                    )
                }
            });

            ProductDetailsFullView.addChildViews({
                'ProductReviews.Center': function wrapperFunction(options) {
                    return function() {
                        return new ProductReviewsCenterView({
                            item: options.model.get('item'),
                            application: options.application
                        });
                    };
                }
            });

            ProductDetailsFullView.addChildViews({
                'Global.StarRating': function wrapperFunction(options) {
                    return function() {
                        return new GlobalViewsStarRatingView({
                            model: options.model.get('item'),
                            showRatingCount: true,
                            showSchemaInfo: true
                        });
                    };
                }
            });
        }
    }
};

export = ProductReviewsModule;
