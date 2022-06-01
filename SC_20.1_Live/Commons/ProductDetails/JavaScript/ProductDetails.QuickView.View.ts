/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductDetails.QuickView.View"/>

import * as _ from 'underscore';
import * as product_details_quickview_tpl from 'product_details_quickview.tpl';

import ProductDetailsBaseView = require('./ProductDetails.Base.View');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// @class ProductDetails.QuickView.View Handles the PDP and quick view @extend Backbone.View
const ProductDetailsQuickViewView: any = ProductDetailsBaseView.extend({
    // @property {Function} template
    template: product_details_quickview_tpl,

    // @property {Object} attributes List of HTML attributes applied by Backbone into the $el
    attributes: {
        id: 'ProductDetails.QuickView.View',
        class: 'view product-detail',
        'data-root-component-id': 'ProductDetails.QuickView.View'
    },

    bindings: _.extend({}, ProductDetailsBaseView.prototype.bindings, {}),

    events: _.extend({}, ProductDetailsBaseView.prototype.events, {
        'click [data-action="go-to-fullview"]': 'goToFullView'
    }),

    // @method goToFullView Fix the url of the Full View link.
    // @param {jQuery.Event} e
    // @return {void}
    goToFullView: function goToFullView(e) {
        this.$(e.target).attr('href', this.model.generateURL());
    },

    childViews: _.extend({}, ProductDetailsBaseView.prototype.childViews, {}),

    // @method getExtraChildrenOptions Allows adding extra option to the child view.
    // @return {ProductDetails.QuickView.View.ExtraChildrenOptions}
    getExtraChildrenOptions: function getExtraChildrenOptions() {
        // @class ProductDetails.QuickView.View.ExtraChildrenOptions
        return {
            // @property {Boolean} isModal
            isModal: true
        };
        // @class ProductDetails.QuickView.View
    },

    // @method getContext
    // @return {ProductDetails.QuickView.View.Context}
    getContext: function() {
        // @class ProductDetails.QuickView.View.Context @extend ProductDetails.Base.View.Context
        return _.extend(ProductDetailsBaseView.prototype.getContext.apply(this, arguments), {});
        // @class ProductDetails.QuickView.View
    }
});

export = ProductDetailsQuickViewView;
