/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductList.AddedToCart.View"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';

import * as product_list_added_to_cart_tpl from 'product_list_added_to_cart.tpl';

import BackboneCompositeView = require('../../Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');
import ProductListDisplayFullView = require('./ProductList.DisplayFull.View');

// @class ProductList.AddedToCart.View @extends Backbone.View
export = BackboneView.extend({
    template: product_list_added_to_cart_tpl,

    attributes: { class: 'product-list-added-to-cart' },

    title: Utils.translate('Added to Cart'),

    initialize: function(options) {
        this.application = options.application;
        BackboneCompositeView.add(this);
    },

    // Render the view and show warning message if any item is not available to be added to the cart
    render: function() {
        BackboneView.prototype.render.apply(this);

        const { list } = this.options;
        const { not_purchasable_items_count } = this.options;

        if (list && not_purchasable_items_count > 0) {
            const warning_message =
                not_purchasable_items_count === 1
                    ? Utils.translate(
                          'One item not available for purchase was not added to the cart.'
                      )
                    : Utils.translate(
                          '$(0) items not available for purchase were not added to the cart.',
                          not_purchasable_items_count
                      );

            this.showWarningMessage(warning_message);
        }
    },

    showWarningMessage: function(message) {
        this.$('[data-warning-message]')
            .empty()
            .append(message);
    },

    isPurchasable: function(model) {
        return model.get('item').get('_isPurchasable');
    },

    childViews: {
        'ProductList.ItemsAddedToCart': function() {
            const { list } = this.options;
            const isItem = !list;

            return new BackboneCollectionView({
                childView: ProductListDisplayFullView,
                childViewOptions: {
                    application: this.application,
                    hide_rating: true,
                    hide_added_on: true,
                    hide_checkbox: true,
                    id: 'list',
                    name: 'List',
                    icon: 'icon-th-list',
                    isDefault: true
                },
                viewsPerRow: 1,
                collection: isItem
                    ? [this.options.item]
                    : list.get('items').models.filter(this.isPurchasable)
            });
        }
    },

    // @method getContext @return ProductList.AddedToCart.View.Context
    getContext: function() {
        const { list } = this.options;
        const isItem = !list;
        const models = isItem
            ? [this.options.item]
            : list.get('items').models.filter(this.isPurchasable);

        return {
            // @property {Boolean} isItem
            isItem: isItem,
            // @property {Boolean} hasMoreThanOneModel
            hasMoreThanOneModel: models.length > 1,
            // @property {String} listName
            listName: list.get('name'),
            // @property {Integer} modelsLength
            modelsLength: models.length
        };
    }
});
