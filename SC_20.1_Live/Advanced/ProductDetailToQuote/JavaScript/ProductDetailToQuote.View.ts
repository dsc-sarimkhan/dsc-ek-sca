/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductDetailToQuote.View"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as productDetailToQuote_tpl from 'product_detail_to_quote.tpl';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import GlobalViewsMessageView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Message.View');
import ProductListModel = require('../../../Commons/ProductList/JavaScript/ProductList.Model');
import ProductListItemModel = require('../../../Commons/ProductList/JavaScript/ProductList.Item.Model');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import Session = require('../../../Commons/Session/JavaScript/Session');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class ProductDetailToQuote.View @extend Backbone.View
const ProductDetailToQuoteView: any = BackboneView.extend({
    // @property {Function} template
    template: productDetailToQuote_tpl,

    // @property {Object} events
    events: {
        'click [data-type="add-to-quote"]': 'itemToQuote'
    },

    // @method initialize
    // @param {ProductDetailToQuote.View.initialize.Options} options
    // @return {Void}
    initialize: function initialize(options) {
        this.application = options.application;

        this.profile_promise = ProfileModel.getPromise();

        this.state = {
            feedbackMessage: '',
            quote_permissions: false,
            feedbackMessageType: 'warning'
        };

        this.model.on('change', this.render, this);
        this.once('afterViewRender', this.attachOnProfileModelEvents, this);
    },

    // @method attachOnProfileModelEvents When the profile ends loading reload the page to properly show the status of permission the current user has.
    // @return {Void}
    attachOnProfileModelEvents: function attachOnProfileModelEvents() {
        const self = this;
        this.profile_promise.done(function user_profile_done_loading() {
            self.profile_model = ProfileModel.getInstance();
            self.state.quote_permissions =
                SC.ENVIRONMENT.permissions.transactions.tranEstimate >= 2;
            self.render();
        });
    },

    // @method destroy Overrides default method to detach from model change event
    // @return {Void}
    destroy: function destroy() {
        this.model.off('change');
        return this._destroy();
    },

    // @method itemToQuote Add/update an item from the pdp to current user quote
    // If the quote doesn't exist, we create one
    // If the quote exist but the item is not present, we put it there
    // If the quote exist and has the item, we update the quantity
    // @param {HTMLEvent} e
    // @return {Void}
    itemToQuote: function itemToQuote(e) {
        const self = this;

        e.preventDefault();

        this.state.feedbackMessage = '';

        // if user is logged in but isn't allowed to quote, we warn him.
        if (this.profile_model.get('isLoggedIn') === 'T' && !this.state.quote_permissions) {
            const phone = Configuration.get('quote.defaultPhone', '');
            const email = Configuration.get('quote.defaultEmail', '');

            this.state.feedbackMessageType = 'warning';
            this.state.feedbackMessage = Utils.translate(
                "Sorry, you don't have sufficient permissions to request a quote online. <br/> For immediate assistance <strong>call us at $(0)</strong> or email us to <strong>$(1)</strong>",
                phone,
                email
            );
            this.render();
        } else if (this.model.isSelectionComplete() && this.isQuotable() && this.validateLogin()) {
            this.application.ProductListModule.Utils.getRequestAQuoteProductList().done(function(
                product_list_json
            ) {
                const product_list_line = ProductListItemModel.createFromProduct(self.model);

                if (!product_list_json.internalid) {
                    const product_list_model = new ProductListModel(product_list_json);

                    product_list_model.save().done(function(product_list_json) {
                        self.addItemToQuote(product_list_json, product_list_line, self.model);
                    });
                } else {
                    const product_list_line_json = product_list_line.toJSON();
                    const item_present_in_list = _.find(product_list_json.items, function(
                        product_list_line_aux: any
                    ) {
                        return (
                            parseInt(product_list_line_aux.item.internalid) ===
                                product_list_line_json.item.internalid &&
                            _.isEqual(product_list_line_json.options, product_list_line_aux.options)
                        );
                    });

                    if (item_present_in_list) {
                        self.updateItemInQuote(item_present_in_list);
                    } else {
                        self.addItemToQuote(product_list_json, product_list_line, self.model);
                    }
                }
            });
        }
    },

    // @method addItemToQuote Add a new item to the quote collection
    // @param {Object} product_list (Please note that it is not a Backbone collection, but a JSON object).
    // @param {ProductList.Item.Model} productListItem
    // @return {Void}
    addItemToQuote: function(product_list, product_list_line, product) {
        let quantity_to_add;
        const self = this;
        let show_enforced_quantity_message = false;

        if (product.get('item').get('_matrixParent').internalid) {
            // As the quote is a line, it will only save the child item, but product list saves the parent item
            // so we override the item with the parent one
            product_list_line.set('item', product.get('item').get('_matrixParent'), {
                silent: true
            });
        }

        if (product.get('quantity') < product.get('_minimumQuantity')) {
            quantity_to_add = product.get('_minimumQuantity');
            show_enforced_quantity_message = true;
        } else {
            quantity_to_add = product.get('quantity');
        }

        product_list_line.set('productList', {
            id: product_list.internalid
        });
        product_list_line.set('quantity', quantity_to_add);

        product_list_line
            .save(null, {
                // Note this is lack of validation is required to not validate the JSON returned from the services as it will lack the Model/Collection structure required
                // to run the validation. for example the list of options will be an array and not a collection as the event handle that parse them didn't run yet
                validate: false
            })
            .done(function(obj) {
                self.state.feedbackMessageType = 'success';
                const product_name = self.model.get('item').get('_name');

                product.set('pl_item_internalid', obj.internalid, { silent: true });

                if (show_enforced_quantity_message) {
                    self.state.feedbackMessage = Utils.translate(
                        '$(0) has been added to your <a href="#" data-hashtag="#request-a-quote" data-touchpoint="customercenter" data-trigger="go-to-quote">Quote Request</a><br>Quantity: $(1). (Enforced minimum quantity)',
                        product_name,
                        quantity_to_add
                    );
                } else {
                    self.state.feedbackMessage = Utils.translate(
                        '$(0) has been added to your <a href="#" data-hashtag="#request-a-quote" data-touchpoint="customercenter" data-trigger="go-to-quote">Quote Request</a><br>Quantity: $(1)',
                        product_name,
                        quantity_to_add
                    );
                }

                self.render();
            });
    },

    // @method updateItemInQuote Update the item in the quote collection
    // @param {Object} item_in_list Object with item list model data. (Please note that it is not a Backbone Model).
    // @return {Void}
    updateItemInQuote: function(item_in_list) {
        const self = this;
        const quantity_to_add = this.model.get('quantity');
        const new_quantity = parseInt(item_in_list.quantity, 10) + parseInt(quantity_to_add, 10);
        const product_list_item_model = new ProductListItemModel({
            internalid: item_in_list.internalid
        });

        product_list_item_model.set('quantity', new_quantity);
        // Set the options otherwise backend will remove them
        product_list_item_model.set('options', this.model.get('options'));

        product_list_item_model.save().done(function() {
            const product_name = self.model.get('item').get('_name');

            self.state.feedbackMessageType = 'success';
            self.state.feedbackMessage = Utils.translate(
                '$(0) has been added to your <a href="#" data-hashtag="#request-a-quote" data-touchpoint="customercenter" data-trigger="go-to-quote">Quote Request</a><br>Quantity: $(1)',
                product_name,
                quantity_to_add
            );

            self.render();
        });
    },

    // @method isQuotable Check if this item is able to be quoted
    // @return {Boolean} True if item is OK to be quoted
    isQuotable: function() {
        return (
            !(
                this.model.get('item') &&
                (this.model.get('item').get('itemtype') === 'GiftCert' ||
                    this.model.get('item').get('itemtype') === 'Discount')
            ) && this.application.ProductListModule.Utils.isProductListEnabled()
        );
    },

    // @method validateLogin Check if user is logged in. Else he is redirected to do so
    // @return {Boolean}
    validateLogin: function validateLogin() {
        if (this.profile_model.get('isLoggedIn') === 'T') {
            return true;
        }

        const params = {
            origin: this.application.getConfig('currentTouchpoint'),
            origin_hash: encodeURIComponent(this.model.generateURL())
        };

        window.location.href = Utils.addParamsToUrl(Session.get('touchpoints.login'), params);

        return false;
    },

    childViews: {
        'GlobalViews.FeedbackMessage': function() {
            const message = this.state.feedbackMessage;
            this.state.feedbackMessage = '';

            return new GlobalViewsMessageView({
                message: message,
                type: this.state.feedbackMessageType || 'success',
                closable: true
            });
        }
    },

    // @method getContext
    // @return {ProductDetailToQuote.View.Context}
    getContext: function getContext() {
        // @class ProductDetailToQuote.View.Context
        return {
            // @property {Boolean} isQuotable
            isQuotable: this.isQuotable(),
            // @property {Boolean} isLoading
            isLoading: this.profile_promise.state() === 'pending',
            // @property {Boolean} isReadyForQuote
            isReadyForQuote: this.model.isSelectionComplete(),
            // @property {Boolean} showMessage
            showMessage: !!this.state.feedbackMessage
        };
    }
});

export = ProductDetailToQuoteView;
