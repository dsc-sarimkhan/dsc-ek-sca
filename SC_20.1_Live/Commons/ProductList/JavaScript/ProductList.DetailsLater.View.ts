/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductList.DetailsLater.View"/>

import '../../BackboneExtras/JavaScript/Backbone.View.render';

import * as product_list_details_later_tpl from 'product_list_details_later.tpl';
import * as products_detail_later_cell_tpl from 'products_detail_later_cell.tpl';
import * as backbone_collection_view_row_tpl from 'backbone_collection_view_row.tpl';
import * as jQuery from '../../Core/JavaScript/jQuery';
import * as Utils from '../../Utilities/JavaScript/Utils';

import ProductListDetailsLaterMacroView = require('./ProductList.DetailsLaterMacro.View');
import ProductListDetailsView = require('./ProductList.Details.View');
import ProductListDeletionView = require('./ProductList.Deletion.View');
import BackboneCompositeView = require('../../Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import ProfileModel = require('../../Profile/JavaScript/Profile.Model');
import LiveOrderModel = require('../../LiveOrder/JavaScript/LiveOrder.Model');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

let product_list_promise;

// @class ProductList.DetailsLater.View @extends Backbone.View
export = BackboneView.extend({
    template: product_list_details_later_tpl,

    events: {
        // items events
        'click [data-action="add-to-cart"]': 'addItemToCartHandler',
        'click [data-action="delete-item"]': 'askDeleteListItem',
        'change [data-action="change-quantity"]': 'updateItemQuantity',
        'keyup [data-action="change-quantity"]': 'updateItemQuantity',
        'click [data-ui-action="add"]': 'addQuantity',
        'click [data-ui-action="minus"]': 'subQuantity'
    },

    initialize: function(options) {
        // this.loadProductList();
        BackboneCompositeView.add(this);

        this.options = options;
        this.application = options.application;
        this.cart = LiveOrderModel.getInstance();

        this.model.on('change', this.render, this);

        this.model.get('items').on('add remove change reset', this.render, this);

        this.promise = this.loadProductList();
    },

    render: function() {
        if (ProfileModel.getInstance().get('isLoggedIn') === 'T') {
            this._render();
            const pushable = this.$el.find('[data-action="pushable"]');
            pushable.scPush({
                selector: this.$el.find(
                    `[data-type="sc-pusher"][data-target="${pushable.data('id')}"]`
                )
            });
        } else {
            this.$el.empty();
        }

        return this;
    },

    loadProductList: function() {
        const self = this;

        if (!product_list_promise) {
            ProfileModel.getPromise().done(function() {
                if (ProfileModel.getInstance().get('isLoggedIn') === 'T') {
                    product_list_promise = self.options.application.ProductListModule.Utils.getSavedForLaterProductList().done(
                        function(attributes) {
                            self.model.set(attributes);
                        }
                    );
                }
            });
        }

        return product_list_promise;
    },

    // @method addItemToCartHandler Add a particular item into the cart
    addItemToCartHandler: function(e) {
        e.stopPropagation();
        e.preventDefault();

        const selected_product_list_item_id = this.$(e.target)
            .closest('article')
            .data('id');
        const selected_product_list_item = this.model
            .get('items')
            .get(selected_product_list_item_id);
        const add_to_cart_promise = this.cart.addLine(selected_product_list_item);
        const whole_promise = jQuery.when(
            add_to_cart_promise,
            this.deleteListItem(selected_product_list_item)
        );

        this.disableElementsOnPromise(
            whole_promise,
            this.$(e.target)
                .closest('article')
                .find('button')
        );
    },

    // @method addQuantity Increase the product's Quantity by 1
    // @param {HTMLEvent} e
    addQuantity: function(e) {
        e.preventDefault();

        const $element = jQuery(e.target);
        const oldValue = $element
            .parent()
            .find('input')
            .val();
        const newVal = parseFloat(<any>oldValue) + 1;

        const input = $element.parent().find('input');

        input.val(newVal);
        input.trigger('change');
    },

    // @method subQuantity Decreases the product's Quantity by 1
    // @param {HTMLEvent} e
    subQuantity: function(e) {
        e.preventDefault();

        const $element = jQuery(e.target);
        const oldValue = $element
            .parent()
            .find('input')
            .val();
        let newVal = parseFloat(<any>oldValue) - 1;

        newVal = Math.max(1, newVal);

        const input = $element.parent().find('input');

        input.val(newVal);
        input.trigger('change');
    },

    // @method askDeleteListItem opens a confirmation dialog for deleting an item from the
    // Saved for Later list.
    // @param {HTMLEvent} e
    askDeleteListItem: function(e) {
        e.stopPropagation();

        this.deleteConfirmationView = new ProductListDeletionView({
            application: this.application,
            parentView: this,
            target: e.target,
            title: Utils.translate('Delete selected items'),
            body: Utils.translate('Are you sure you want to remove selected items?'),
            confirmLabel: Utils.translate('Yes'),
            confirm_delete_method: 'deleteListItemHandler'
        });

        this.deleteConfirmationView.showInModal();
    },

    // @method deleteListItemHandler deletes a single item from the Saved for Later list.
    // @param {HTMLEvent} e
    deleteListItemHandler: function(target) {
        const self = this;
        const itemid = jQuery(target)
            .closest('article')
            .data('id');
        const product_list_item = this.model.get('items').findWhere({
            internalid: itemid + ''
        });
        const success = function() {
            self.deleteConfirmationView.$containerModal
                .removeClass('fade')
                .modal('hide')
                .data('bs.modal', null);
            self.render();
            self.showConfirmationMessage(
                Utils.translate('The item was removed from your product list'),
                true
            );
        };

        self.model.get('items').remove(product_list_item);
        self.deleteListItem(product_list_item, success);
    },

    deleteListItem: ProductListDetailsView.prototype.deleteListItem,

    disableElementsOnPromise: ProductListDetailsView.prototype.disableElementsOnPromise,

    updateItemQuantity: ProductListDetailsView.prototype.updateItemQuantity,

    updateItemQuantityHelper: ProductListDetailsView.prototype.updateItemQuantityHelper,

    childViews: {
        'ProductList.DetailsLater.Collection': function() {
            return new BackboneCollectionView({
                collection: this.model.get('items'),
                childView: ProductListDetailsLaterMacroView,
                viewsPerRow: 4,
                cellTemplate: products_detail_later_cell_tpl,
                rowTemplate: backbone_collection_view_row_tpl,
                childViewOptions: {
                    application: this.application
                }
            });
        }
    },

    // @method getContext @return {ProductList.DetailsLater.View.Context}
    getContext: function() {
        const items = this.model.get('items');
        const itemsLength = items.length;
        // @class ProductList.DetailsLater.View.Context
        return {
            // @property {Integer} itemsLength
            itemsLength: itemsLength,
            // @property {Boolean} hasItems
            hasItems: itemsLength > 0,
            // @property {Boolean} isEmpty
            isEmpty: itemsLength === 0,
            // @property {Boolean} hasMoreThanOneItem
            hasMoreThanOneItem: itemsLength > 1
        };
    }
});
