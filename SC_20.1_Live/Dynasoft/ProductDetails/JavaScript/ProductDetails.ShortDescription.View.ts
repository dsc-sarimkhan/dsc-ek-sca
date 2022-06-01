/// <amd-module name="ProductDetails.ShortDescription.View"/>

import * as product_details_short_description_tpl from 'product_details_short_description.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class ProductDetails.ShortDescription.View @extends Backbone.View
const ProductDetailsShortDescription: any = BackboneView.extend({
    template: product_details_short_description_tpl,

    // @method getContext
    getContext: function getContext() {
        return {
            // @property {Product.Model.Item} model
            item: this.model.get('item')
        };
    }
});

export = ProductDetailsShortDescription;
