/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductList.CartSaveForLater.View"/>

import '../../ErrorManagement/JavaScript/ErrorManagement';
import '../../Utilities/JavaScript/SC.Configuration';
import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as jQuery from '../../Core/JavaScript/jQuery';

import ProductListDetailsLaterView = require('./ProductList.DetailsLater.View');
import ProductListModel = require('./ProductList.Model');
import ProductListItemModel = require('./ProductList.Item.Model');
import CartDetailedView = require('../../Cart/JavaScript/Cart.Detailed.View');
import Session = require('../../Session/JavaScript/Session');
import Tracker = require('../../Tracker/JavaScript/Tracker');
import ProfileModel = require('../../Profile/JavaScript/Profile.Model');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

const original_initialize = CartDetailedView.prototype.initialize;
const product_list_model = new ProductListModel();

_.extend(CartDetailedView.prototype, {
    initialize: function() {
        const self = this;

        original_initialize.apply(this, arguments);

        this.productListModel = product_list_model;

        this.utils = this.application.ProductListModule && this.application.ProductListModule.Utils;

        ProfileModel.getPromise().done(function() {
            self.render();
        });
    },

    childViews: _.extend({}, CartDetailedView.prototype.childViews, {
        SavedForLater: function() {
            if (this.utils && this.utils.isProductListEnabled()) {
                return new ProductListDetailsLaterView({
                    application: this.options.application,
                    model: this.productListModel
                });
            }

            return null;
        }
    }),

    // save for later:
    // handles the click event of the save for later button
    // removes the item from the cart and adds it to the saved for later list
    saveForLaterItem: function(e) {
        e.preventDefault();

        if (!this.validateLogin()) {
            return;
        }

        const cart_line = this.model.get('lines').get(jQuery(e.target).data('internalid'));
        const internalid = cart_line.get('internalid');
        const whole_promise = jQuery.Deferred();
        const self = this;

        jQuery
            .when(this.model.removeLine(cart_line), self.addItemToList(cart_line))
            .then(function() {
                self.showConfirmationMessage(
                    Utils.translate(
                        'Good! You saved the item for later. If you want to add it back to your cart, see below in <b>"Saved for later"</b>'
                    )
                );

                whole_promise.resolve();
            });

        this.disableElementsOnPromise(whole_promise, '#' + internalid + ' button');
    },

    // Add a new product list item into a product list
    addItemToList: function(cart_line) {
        const defer = jQuery.Deferred();
        const self = this;

        if (this.productListModel.isNew()) {
            this.productListModel.save().done(function() {
                self.doAddItemToList(self.productListModel.get('internalid'), cart_line, defer);
            });
        } else {
            self.doAddItemToList(self.productListModel.get('internalid'), cart_line, defer);
        }

        return defer.promise();
    },
    // Adds the new item to the collection
    doAddItemToList: function(product_list_id, cart_line, internal_promise) {
        const self = this;

        const existingItem = self.productListModel.get('items').find(element => {
            return (
                element.get('item').get('internalid') === cart_line.get('item').get('internalid')
            );
        });

        if (existingItem) {
            const newQuantity: number = existingItem.get('quantity') + cart_line.get('quantity');
            existingItem.set('quantity', newQuantity);

            existingItem.save(null, { validate: false }).then(() => {
                Tracker.getInstance().trackAddToWishlist(cart_line);
                internal_promise.resolve();
            });
        } else {
            const product_list_item_model = ProductListItemModel.createFromTransactionLine(
                cart_line
            );

            product_list_item_model.set('productList', { id: product_list_id });

            product_list_item_model.set('description', '');

            product_list_item_model.set('item', cart_line.get('item'), { silent: true });

            product_list_item_model.save(null, { validate: false }).done(function() {
                product_list_item_model.set('item', cart_line.get('item'), { silent: true });

                self.productListModel.get('items').add(product_list_item_model, { at: 0 });

                Tracker.getInstance().trackAddToWishlist(cart_line);

                internal_promise.resolve();
            });
        }
    },
    validateLogin: function(): boolean {
        if (ProfileModel.getInstance().get('isLoggedIn') === 'F') {
            const parameters = {
                origin: this.application.getConfig('currentTouchpoint'),
                origin_hash: encodeURIComponent(Backbone.history.fragment)
            };

            window.location.href = Utils.addParamsToUrl(
                Session.get('touchpoints.login'),
                parameters
            );

            return false;
        }

        return true;
    }
});

CartDetailedView.prototype.events = _.extend({}, CartDetailedView.prototype.events, {
    'click [data-action="save-for-later-item"]': 'saveForLaterItem'
});

export = CartDetailedView;
