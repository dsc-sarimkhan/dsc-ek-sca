/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Cart.Detailed.View"/>

import * as _ from 'underscore';
import '../../../Commons/jQueryExtras/JavaScript/jQuery.scStickyButton';
import * as cart_detailed_tpl from 'cart_detailed.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import GlobalViewsMessageView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Message.View');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import BackboneFormView = require('../../../Commons/Backbone.FormView/JavaScript/Backbone.FormView');
import CartLinesView = require('./Cart.Lines.View');
import CartLinesFreeView = require('./Cart.Lines.Free.View');
import CartPromocodeNotifications = require('./Cart.Promocode.Notifications.View');
import CartSummaryView = require('./Cart.Summary.View');
import CartItemSummaryView = require('./Cart.Item.Summary.View');
import CartItemActionsView = require('./Cart.Item.Actions.View');
import LiveOrderModel = require('../../LiveOrder/JavaScript/LiveOrder.Model');
import Tracker = require('../../../Commons/Tracker/JavaScript/Tracker');
import Utils = require('../../../Commons/Utilities/JavaScript/Utils.js');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import Configuration = require('../../../Commons/Utilities/JavaScript/SC.Configuration');
import CartPurchasedItemsView = require('../JavaScript/Cart.PurchasedItems.View');
import PaymentMethodModel = require('../../../Commons/Transaction/JavaScript/Transaction.Paymentmethod.Model');

let colapsibles_states = {};

// @class Cart.Detailed.View This is the Shopping Cart view @extends Backbone.View
export = BackboneView.extend({
    // @property {Function} template
    template: cart_detailed_tpl,

    enhancedEcommercePage: true,

    // @property {String} title
    title: Utils.translate('Shopping Cart'),

    // @property {String} page_header
    page_header: Utils.translate('Shopping Cart'),

    // @property {Object} attributes
    attributes: {
        id: 'Cart.Detailed.View',
        'data-root-component-id': 'Cart.Detailed.View'
    },

    bindings: {
        '[name="zip"]': 'zip'
    },

    selectedFulfillmentChoice: 'ship',

    // @property {Object} events
    events: {
        'change [data-type="cart-item-quantity-input"]': 'debouncedUpdateItemQuantity',
        'keypress [data-type="cart-item-quantity-input"]': 'debouncedUpdateItemQuantity',
        'submit [data-action="update-quantity"]': 'updateItemQuantityFormSubmit',
        'click [data-action="remove-item"]': 'removeItem',
        'submit form[data-action="estimate-tax-ship"]': 'estimateTaxShip',
        'click [data-action="remove-shipping-address"]': 'removeShippingAddress',
        'click [data-touchpoint="checkout"]': 'trackEvent',
        'change [data-action="estimate-tax-ship-country"]': 'changeCountry',
        'change [data-action="changeFulfillment"]': 'changeFulfillment'
    },

    // @method initialize
    // @param {Cart.Detailed.View.InitializeParameters} options
    // @return {Void}
    initialize: function(options) {
        this.upsell=false;
        this.application = options.application;
        this.showEstimated = false;
        this.model = LiveOrderModel.getInstance();
        this.options.model = this.model;
        BackboneFormView.add(this);
        
        this.model.on('change', this.render, this);
        this.model.get('lines').on('add remove', this.render, this);
        this.model.on('LINE_ROLLBACK', this.render, this);
        this.model.on('promocodeNotificationShown', this.removePromocodeNotification, this);

        this.on('afterCompositeViewRender', this.resetColapsiblesState, this);
        this.on('afterCompositeViewRender', this.initPlugins, this);
        
        this.urlOptions = Utils.parseUrlOptions(
            (options.routerArguments && options.routerArguments[0]) || ''
        );
        if(window.location.href.indexOf('upsell')!=-1)
        {
            this.upsell=true;
        }
        
    },

    changeFulfillment: function(e){
        LiveOrderModel.getInstance().save({'fulfillment_choice': $(e.target).val()});
    },

    beforeShowContent: function() {
        return LiveOrderModel.loadCart().done(function() {
            Tracker.getInstance().trackPageviewForCart({
                url: '/' + Backbone.history.fragment
            });
        });
    },

    // @method getBreadcrumbPages
    // @return {BreadcrumbPage}
    getBreadcrumbPages: function() {
        return { href: '/cart', text: Utils.translate('Shopping Cart') };
    },

    // @method initPlugins
    // initialize plugins
    initPlugins: function initPlugins() {
        if (Configuration.get('siteSettings.sitetype') === 'ADVANCED') {
            this.$('[data-action="sticky"]').scStickyButton();
        }
        Utils.initBxSlider(
            this.$('[data-type="carousel-items"]'),
            Configuration.get('bxSliderDefaults')
        );
    },

    render: function render() {
        this.storeColapsiblesState();
        this._render();
        return this;
    },

    // @method hideError
    hideError: function hideError(selector) {
        const el = selector
            ? selector.find('[data-type=alert-placeholder]')
            : this.$('[data-type=alert-placeholder]');
        el.empty();
    },

    // @method showError
    showError: function showError(message, line, error_details) {
        let placeholder;
        this.hideError();

        if (line) {
            // if we detect its a rolled back item, (this i an item that was deleted
            // but the new options were not valid and was added back to it original state)
            // We will move all the references to the new line id
            if (error_details && error_details.status === 'LINE_ROLLBACK') {
                const new_line_id = error_details.newLineId;
                line.attr('id', new_line_id);
                line.find('[name="internalid"]').attr({
                    id: 'update-internalid-' + new_line_id,
                    value: new_line_id
                });
            }

            placeholder = line.find('[data-type="alert-placeholder"]');
            this.hideError(line);
        } else {
            placeholder = this.$('[data-type="alert-placeholder"]');
            this.hideError();
        }

        // Finds or create the placeholder for the error message
        if (!placeholder.length) {
            placeholder = jQuery('<div/>', {
                'data-type': 'alert-placeholder'
            });
            this.$el
                .children()
                .first()
                .prepend(placeholder);
        }

        const global_view_message = new GlobalViewsMessageView({
            message: message,
            type: 'error',
            closable: true
        });

        // Renders the error message and into the placeholder
        placeholder.append(global_view_message.render().$el.html());

        // Re Enables all posible disableded buttons of the line or the entire view
        if (line) {
            line.find(':disabled').attr('disabled', false);
        } else {
            this.$(':disabled').attr('disabled', false);
        }
    },

    // @method validInputValue
    // Check if the input[type="number"] has empty string or NaN value
    // input.val() == '' && validInput == false: NaN
    // input.val() == '' && validInput == true: empty string
    validInputValue: function(input) {
        // html5 validation
        if ((input.validity && !input.validity.valid) || input.value === '') {
            return false;
        }

        // Fallback to browsers that don't yet support html5 input validation
        return !isNaN(input.value);
    },

    // @method updateItemQuantity
    // Finds the item in the cart model, updates its quantity and saves the cart model
    updateItemQuantity: function updateItemQuantity(e) {
        const self = this;
        const $form = jQuery(e.target).closest('form');
        const options = (<any>$form).serializeObject();
        let { internalid } = options;
        let line = this.model.get('lines').get(internalid);
        const $input = $form.find('[name="quantity"]');
        const validInput = this.validInputValue($input[0]);

        if (!line || this.isRemoving) {
            return;
        }

        if (!validInput || options.quantity) {
            const new_quantity = parseInt(options.quantity, 10);
            const item = line.get('item');
            const min_quantity = item
                ? item.get('_minimumQuantity', true)
                : line.get('minimumquantity');
            const max_quantity = item
                ? item.get('_maximumQuantity', true)
                : line.get('maximumquantity');
            const current_quantity = parseInt(line.get('quantity'), 10);

            let new_valid_quantity = new_quantity >= min_quantity ? new_quantity : min_quantity;
            new_valid_quantity =
                !!max_quantity && new_quantity > max_quantity ? max_quantity : new_quantity > min_quantity ? new_quantity : min_quantity;

            $input.val(new_valid_quantity);

            if (new_quantity !== current_quantity) {
                $input.val(new_valid_quantity).prop('disabled', true);
                line.set('quantity', new_valid_quantity);

                const invalid = line.validate();

                if (!invalid) {
                    const update_promise = this.model.updateLine(line, true);
                    this.disableElementsOnPromise(update_promise, '#' + internalid + ' button');

                    update_promise
                        .fail(function(jqXhr) {
                            const result = JSON.parse(jqXhr.responseText);
                            const { errorDetails } = result;

                            if (errorDetails && errorDetails.newLineId) {
                                internalid = errorDetails.newLineId;
                                // we use the new line
                                line = self.model.get('lines').get(internalid);
                            }

                            // revert quantity to the last quantity
                            line.set('quantity', current_quantity);
                            self.render();
                        })
                        .always(function() {
                            $input.prop('disabled', false);
                        });
                } else {
                    const placeholder = this.$(
                        '#' + internalid + ' [data-type="alert-placeholder"]'
                    );
                    placeholder.empty();

                    _.each(invalid, function(value) {
                        const global_view_message = new GlobalViewsMessageView({
                            message: value,
                            type: 'error',
                            closable: true
                        });

                        placeholder.append(global_view_message.render().$el.html());
                    });

                    $input.prop('disabled', false);
                    line.set('quantity', current_quantity);
                }
            }
        }
    },

    debouncedUpdateItemQuantity: _.debounce(function(e) {
        this.updateItemQuantity(e);
    }, 1000),

    // @method updateItemQuantityFormSubmit
    updateItemQuantityFormSubmit: function updateItemQuantityFormSubmit(e) {
        e.preventDefault();
        this.updateItemQuantity(e);
    },

    // @method removeItem
    // handles the click event of the remove button
    // removes the item from the cart model and saves it.
    removeItem: function removeItem(e) {
        const self = this;
        const product = this.model.get('lines').get(this.$(e.target).data('internalid'));
        const remove_promise = this.model.removeLine(product);
        const internalid = product.get('internalid');

        this.isRemoving = true;
        this.disableElementsOnPromise(
            remove_promise,
            'article[id="' + internalid + '"] a, article[id="' + internalid + '"] button'
        );

        remove_promise.always(function() {
            self.isRemoving = false;
        });

        return remove_promise;
    },

    // @method estimateTaxShip
    // Sets a fake address with country and zip code based on the options.
    estimateTaxShip: function estimateTaxShip(e) {
        e.preventDefault();

        const options = this.$(e.target).serializeObject();
        const self = this;

        const fake_address = {
            zip: options.zip,
            country: options.country,
            internalid: null
        };

        this.model
            .cancelableTrigger('before:LiveOrder.estimateShipping', fake_address)
            .then(function() {
                const address_internalid = fake_address.zip + '-' + fake_address.country + '-null';
                fake_address.internalid = address_internalid;
                self.model.get('addresses').push(fake_address);
                self.model.set('shipaddress', address_internalid);
                const promise = self.saveForm(e);

                if (promise) {
                    self.swapEstimationStatus();
                }

                promise.done(function(lines) {
                    self.model.cancelableTrigger(
                        'after:LiveOrder.estimateShipping',
                        _.isUndefined(lines) ? false : lines
                    );
                });
            });
    },

    // @method changeEstimationStatus
    swapEstimationStatus: function swapEstimationStatus() {
        this.showEstimated = !this.showEstimated;
    },

    // @method removeShippingAddress
    // sets a fake null address so it gets removed by the backend
    removeShippingAddress: function removeShippingAddress(e) {
        const self = this;
        const ship_address = self.model.get('addresses');

        self.model
            .cancelableTrigger('before:LiveOrder.clearEstimateShipping', ship_address)
            .then(function() {
                e.preventDefault();
                self.swapEstimationStatus();

                self.model.save({
                    shipmethod: null,
                    shipaddress: null
                });

                self.model.cancelableTrigger('after:LiveOrder.clearEstimateShipping', true);
            });
    },

    // @method changeCountry
    changeCountry: function changeCountry(e) {
        e.preventDefault();

        const options = this.$(e.target).serializeObject();
        const AddressModel = this.model.get('addresses').model;

        this.model
            .get('addresses')
            .add(new AddressModel({ country: options.country, internalid: options.country }));
        this.model.set({ shipaddress: options.country });
    },

    // @method resetColapsiblesState
    // @return {Void}
    resetColapsiblesState: function resetColapsiblesState() {
        const self = this;
        _.each(colapsibles_states, function(is_in, element_selector) {
            self.$(element_selector)
                [is_in ? 'addClass' : 'removeClass']('in')
                .css('height', is_in ? 'auto' : '0');
        });
    },

    // @method storeColapsiblesState
    // @return {Void}
    storeColapsiblesState: function() {
        this.$('.collapse').each(function(index, element) {
            colapsibles_states[Utils.getFullPathForElement(element)] = jQuery(element).hasClass(
                'in'
            );
        });
    },

    // @method removePromocodeNotification
    // @param String promocode_id
    // @return {Void}
    removePromocodeNotification: function(promocode_id) {
        const promocode: any = _.findWhere(this.model.get('promocodes'), {
            internalid: promocode_id
        });
        delete promocode.notification;
    },

    trackEvent: function() {
        Tracker.getInstance().trackProceedToCheckout();
    },

    destroy: function() {
        colapsibles_states = {};

        this.model.off('change', this.render, this);
        this.model.get('lines').off('add remove', this.render, this);
        this.model.off('LINE_ROLLBACK', this.render, this);

        this.off('afterCompositeViewRender', this.resetColapsiblesState, this);
        this.off('afterCompositeViewRender', this.initPlugins, this);

        this._destroy();
    },

    // @property {ChildViews} childViews
    childViews: {
        'Cart.Summary': function() {
            return new CartSummaryView({
                model: this.model,
                showEstimated: this.showEstimated,
                application: this.application
            });
        },
        'Item.ListNavigable': function() {
            const lines = _.filter(this.model.get('lines').models || [], function(line: any) {
                return line.get('free_gift') !== true;
            });

            return new BackboneCollectionView({
                collection: lines,
                viewsPerRow: 1,
                childView: CartLinesView,
                childViewOptions: {
                    navigable: true,
                    application: this.application,
                    SummaryView: CartItemSummaryView,
                    ActionsView: CartItemActionsView,
                    showAlert: false
                }
            });
        },

        'Promocode.Notifications': function() {
            const promotions = _.filter(this.model.get('promocodes') || [], function(
                promocode: any
            ) {
                return promocode.notification === true;
            });

            if (promotions.length) {
                return new BackboneCollectionView({
                    collection: promotions,
                    viewsPerRow: 1,
                    childView: CartPromocodeNotifications,
                    childViewOptions: {
                        parentModel: this.model
                    }
                });
            }
        },

        'Item.FreeGift': function() {
            const free_gifts = _.filter(this.model.get('lines').models || [], function(line: any) {
                return line.get('free_gift') === true;
            });

            if (free_gifts.length) {
                return new BackboneCollectionView({
                    collection: free_gifts,
                    viewsPerRow: 1,
                    childView: CartLinesFreeView,
                    childViewOptions: {
                        navigable: true
                    }
                });
            }
        },

        'FreeGift.Info': function() {
            let message;
            const free_gifts = _.filter(this.model.get('lines').models || [], function(line: any) {
                return line.get('free_gift') === true;
            });

            if (free_gifts.length === 1) {
                message = Utils.translate(
                    'The following item is free but it may generate shipping costs.'
                );
            } else if (free_gifts.length > 1) {
                message = Utils.translate(
                    'The following items are free but they may generate shipping costs.'
                );
            }

            if (message) {
                return new GlobalViewsMessageView({
                    message: message,
                    type: 'info',
                    closable: false
                });
            }
        },
        GlobalMessageNoFulfillment: function() {
            return new GlobalViewsMessageView({
                message: Utils.translate('Please Select Fulfillment Choice'),
                type: 'error',
                closable: true
            });
        },
         'Cart.Purchased.Items': function(): any {
            return new CartPurchasedItemsView({
                model: this.model//LiveOrderModel.getInstance().get('lines').models[0].collection
            });
        },
    },

    // @method getExtraChildrenOptions Overridable method used to add params to url to open the accordion
    // @return {Cart.Detailed.View.ExtraChildrenOptions}
    getExtraChildrenOptions: function() {
        // @class Cart.Detailed.View.ExtraChildrenOptions
        return {
            // @property {String} urlOptions
            urlOptions: this.urlOptions
        };
        // @class Cart.Detailed.View
    },

    // @method getContext @return {Cart.Detailed.View.Context}
    getContext: function() {
        const lines = this.model.get('lines');
        const product_count = lines.length;
        const item_count = _.reduce(
            lines.models,
            function(memo, line: any) {
                return memo + line.get('quantity');
            },
            0
        );
        let product_and_items_count = '';

        if (product_count === 1) {
            if (item_count === 1) {
                product_and_items_count = Utils.translate('1 Product, 1 Item');
            } else {
                product_and_items_count = Utils.translate('1 Product, $(0) Items', item_count);
            }
        } else if (item_count === 1) {
            product_and_items_count = Utils.translate('$(0) Products, 1 Item', product_count);
        } else {
            product_and_items_count = Utils.translate(
                '$(0) Products, $(1) Items',
                product_count,
                item_count
            );
        }

        var self = this;
        let pivot = null;
        var itemOutOfStock = false;
        var kitItemsInCart = false;
        var anItemIsOutOfStock = false;
        var notForPickupMessage = "Out of stock items can only be shipped!";
        _.each(this.model.get('lines').models, function(model: any){
          
            if(!model.get('internalid') ||  model.get('internalid') == undefined){
             location.reload();
            }
            if(self.model.get("lines").get(model.id) != undefined){
                if(pivot == null){
                    pivot = self.model.get("lines").get(model.id).get('fulfillmentChoice')
                };
                self.selectedFulfillmentChoice = self.model.get("lines").get(model.id).get('fulfillmentChoice');
                if(pivot != self.model.get("lines").get(model.id).get('fulfillmentChoice')){
                    self.selectedFulfillmentChoice = false;
                }
            }
            if(model.get("item").get('itemtype').toLowerCase() === 'kit'){ //check if there is any kit item in cart
                kitItemsInCart = true;
            }
            if(!model.get("item").getStockInfo().isInStock || !model.get("item").getStockInfo().isAvailableForPickup){
                itemOutOfStock = true;
                if(!model.get("item").getStockInfo().isInStock){ //to check if there is no out of stock item in cart
                    anItemIsOutOfStock = true;
                }
            }
        });
        if(itemOutOfStock && this.selectedFulfillmentChoice != 'ship'){this.selectedFulfillmentChoice = false};

        if(kitItemsInCart && !anItemIsOutOfStock){ //change the message for kit items
            notForPickupMessage = "KIT items can only be shipped! (or purchased directly at our Caloundra showroom)";
        }

        // @class Cart.Detailed.View.Context
        return {

            // @property {LiveOrder.Model} model
            model: this.model,
            // @property {Boolean} showLines
            showLines: !!(lines && lines.length),
            // @property {Orderline.Collection} lines
            lines: lines,
            // @property {String} productsAndItemsCount
            productsAndItemsCount: product_and_items_count,
            // @property {Number} productCount
            productCount: product_count,
            // @property {Number} itemCount
            itemCount: item_count,
            // @property {String} pageHeader
            pageHeader: this.page_header,

            selectedFulfillmentChoice: this.selectedFulfillmentChoice,

            itemOutOfStock: itemOutOfStock,

            upsell:this.upsell,

            notForPickupMessage: notForPickupMessage 
        };
        // @class Cart.Detailed.View
    }
});
