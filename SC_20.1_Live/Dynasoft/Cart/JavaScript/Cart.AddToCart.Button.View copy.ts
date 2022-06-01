/*
    © 2020 NetSuite Inc.
    User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
    provided, however, if you are an authorized user with a NetSuite account or log-in, you
    may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Cart.AddToCart.Button.View"/>

import * as _ from 'underscore';
import * as cart_add_to_cart_button_tpl from 'cart_add_to_cart_button.tpl';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import {
    Loggers
} from '../../../Commons/Loggers/JavaScript/Loggers';
import {
    ItemTrack
} from '../../../Commons/Instrumentation/JavaScript/APMTrackerParameters';
import * as InstrumentationAddToCart from '../../../Commons/Instrumentation/JavaScript/InstrumentationAddToCart';

import LiveOrderModel = require('../../LiveOrder/JavaScript/LiveOrder.Model');
import LiveOrderLineModel = require('../../LiveOrder/JavaScript/LiveOrder.Line.Model');
import CartConfirmationHelpers = require('./Cart.Confirmation.Helpers');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import ProductModel = require('../../../Commons/Product/JavaScript/Product.Model')
import TransactionLineModel = require('../../../Commons/Transaction/JavaScript/Transaction.Line.Model');
import BackboneFormView = require('../../../Commons/Backbone.FormView/JavaScript/Backbone.FormView');
import QuickAddModel = require('../../../Advanced/QuickAdd/JavaScript/QuickAdd.Model');
import ItemRelationsRelatedCollection = require('../../ItemRelations/JavaScript/ItemRelations.Related.Collection');
import {
    Model
} from '../../../Commons/Core/JavaScript/backbone/backbone';


// @class Cart.AddToCart.Button.View @extend Backbone.View
export = BackboneView.extend({
    // @property {Function} template
    template: cart_add_to_cart_button_tpl,

    events: {
        'mouseup [data-type="add-to-cart"]': 'addToCart',
        'click [data-type="add-to-cart"]': 'addToCart'
    },

    // @method initialize
    // @param {ProductDeatils.AddToCart.ViewCart.AddToCart.Button.View.Initialize.Options} options
    // @return {Void}
    initialize: function initialize() {
        BackboneView.prototype.initialize.apply(this, arguments);

        this.cart = LiveOrderModel.getInstance();

        this.model.on('change', this.render, this);
        $(document).on('click', 'input[type="checkbox"]', function (event) {
            $(this).prev('input').prop("checked", function (i, val) {
                return !val;
            });
            event.preventDefault();
        })

    },

    // @method destroy Override default method to detach from change event of the current model
    // @return {Void}
    destroy: function destroy() {
        BackboneView.prototype.destroy.apply(this, arguments);
        this.model.off('change', this.render, this);
    },

    // @method getAddToCartValidators Returns the extra validation to add a product into the cart
    // @return {BackboneValidationObject}
    getAddToCartValidators: function getAddToCartValidators() {
        const self = this;

        return {
            quantity: {
                fn: function () {
                    const line_on_cart = self.cart.findLine(self.model);
                    const quantity = self.model.get('quantity');
                    const minimum_quantity = self.model.getItem().get('_minimumQuantity') || 1;
                    let maximum_quantity = self.model.getItem().get('_maximumQuantity');

                    if (!_.isNumber(quantity) || _.isNaN(quantity) || quantity < 1) {
                        return Utils.translate('Invalid quantity value');
                    }

                    if (!line_on_cart && quantity < minimum_quantity) {
                        return Utils.translate(
                            'Please add $(0) or more of this item',
                            minimum_quantity
                        );
                    }

                    if (maximum_quantity) {
                        maximum_quantity = !line_on_cart ?
                            maximum_quantity :
                            maximum_quantity - line_on_cart.get('quantity');

                        if (quantity > maximum_quantity) {
                            return Utils.translate(
                                'Please add $(0) or less of this item',
                                maximum_quantity
                            );
                        }
                    }
                }
            }
        };
    },

    // @method submitHandler Public method that fulfill
    // the require interface of the Main action View of the PDP
    // @param {jQuery.Event} e
    // @return {Boolean}
    submitHandler: function submitHandler(e) {
        return this.addToCart(e);
    },

    // @method addToCart Updates the Cart to include the current model
    // also takes care of updating the cart if the current model is already in the cart
    // @param {jQuery.Event} e
    // @return {Boolean}
    addToCart: function addToCart(e) {
        e.preventDefault();
        const self = this;
        
        let cart_promise;
        this.intervalId;
        if (
            !this.model.areAttributesValid(['options', 'quantity'], self.getAddToCartValidators())
        ) {
            return;
        }

        // self.selectedFulfillmentChoice = 'ship';

        _.each(this.cart.get('lines').models, function (model: {
            id: string
        }) {
            if (self.cart.get("lines").get(model.id)) {
                self.selectedFulfillmentChoice = self.cart.get("lines").get(model.id).get('fulfillmentChoice');
            }
        }); //get the current selected fulfillment option
 
        if (!this.model.isNew() && this.model.get('source') === 'cart') {
            cart_promise = this.cart.updateProduct(this.model);
            cart_promise.done(function () {
                self.options.application.getLayout().closeModal();
            });
        } else {
            const line = LiveOrderLineModel.createFromProduct(this.model);
            const itemTrack: ItemTrack = InstrumentationAddToCart.itemToTrack(line);
            const loggers = Loggers.getLogger();
            const actionId = loggers.start('Add to Cart');
            if (self.selectedFulfillmentChoice != undefined) {
                line.set('fulfillmentChoice', self.selectedFulfillmentChoice); //set the fulfillment of cart
            }
            cart_promise = this.cart.addLine(line);
            var parentLine = line;
            // self.parentItemLine = line;

            self.modelsToAdd = [];
                $("input[name='include_upsell']:checked").each(function () {
                    let selectedItemId = $(this).val();
                    let selectedItemModel: any = $("input[name='model_" + selectedItemId + "']").val();
                    self.modelsToAdd.push({
                        model: JSON.parse(selectedItemModel)
                    });
                });
      
            cart_promise.then(() => {
                self.upsellCounter = 0;
                if (self.modelsToAdd.length) {

                    this.upsellItemsAdd(self.modelsToAdd, (counter:Number) => {
                        self.upsellCounter = counter;
                        // const addToCartOperationIds = InstrumentationAddToCart.getAddToCartOperationId(
                        //     self.cart.get('lines').models,
                        //     line
                        // );
                        // loggers.end(actionId, {
                        //     operationIds: addToCartOperationIds,
                        //     status: 'success',
                        //     itemId: itemTrack.itemId,
                        //     itemQuantity: itemTrack.itemQuantity
                        // });
                  
                    });
                } 
                // else {
                  

                    const addToCartOperationIds = InstrumentationAddToCart.getAddToCartOperationId(
                        self.cart.get('lines').models,
                        line
                    );
                    loggers.end(actionId, {
                        operationIds: addToCartOperationIds,
                        status: 'success',
                        itemId: itemTrack.itemId,
                        itemQuantity: itemTrack.itemQuantity
                    });
             
                    console.log("ITEM TRACK ->",itemTrack.itemId)
                // }
            })

            self.intervalId = setInterval(function(){
                if(!self.modelsToAdd.length || self.modelsToAdd.length == self.upsellCounter){
                    self.showConfirmation(cart_promise,parentLine,self.options.application);
                }
            },1000);
        }

        cart_promise.fail(function (jqXhr) {
            let error_details = null;
            try {
                if (jqXhr && jqXhr.responseText) {
                    const response = JSON.parse(jqXhr.responseText);
                    error_details = response.errorDetails;
                }
            } catch (error) {
                console.error(error);
            } finally {
                if (error_details && error_details.status === 'LINE_ROLLBACK') {
                    self.model.set('internalid', error_details.newLineId);
                }
            }
        });

        this.disableElementsOnPromise(cart_promise, e.target);
        return false;
    },


    showConfirmation : function showConfirmation(cart_promise, parentline, application){
        console.log("ParentLine ->",parentline)
        clearInterval(this.intervalId);
        CartConfirmationHelpers.showCartConfirmation(
            cart_promise,
            parentline,
            application
        );
    },

    upsellItemsAdd: function upsellItemsAdd(array: any, cb: any) {
        var self = this;
        const collection = new ItemRelationsRelatedCollection({
            itemsIds: self.model.getItemId()
        });
        const selectedLinesArr = [];
        collection.fetch({
            aysnc: false,
            success: function (response) {
                _.each(array, function (item: any) {
                    self.product = null;

                    const selectedItem = response.get(item.model._id)
                    self.product = new ProductModel();
                    self.product.set('item', selectedItem);
                    self.product.set('quantity', '1');
                    if (self.product.isValid(true) && self.product) {
                        // this.product.set('quantity', parseInt(this.model.get('quantity'), 10));
                        const selected_line = new TransactionLineModel(self.product.toJSON());
                        selected_line.set('internalid', _.uniqueId('item_line'));
                        selected_line.set('item', self.product.getItem().clone());
                        selected_line.set('fulfillmentChoice', 'ship');
                        selected_line.set('options', self.product.get('options').clone());
                        // if the item is a matrix we add the parent so when saving the item in a product list (request a quote case)
                        // we have the parent
                        if (self.product.get('item').get('_matrixChilds').length) {
                            selected_line.get('item').set('_matrixParent', self.product.get('item'));
                        }
                        selectedLinesArr.push(selected_line);

                    }
                });

                LiveOrderModel.getInstance().addLines(selectedLinesArr).then(function (res) {
                    //Success Message
                    if (res) {
                        console.log("Item Added Successfully");
                        cb(selectedLinesArr.length);
                    }
                    // itemSelectedId = null
                })



            }
        });
    },
    // @method getContext
    // @return {Cart.AddToCart.Button.View.Context}
    getContext: function getContext() {
        // @class Cart.AddToCart.Button.View.Context
        return {
            // @property {Boolean} isCurrentItemPurchasable
            // Indicate if the current item is valid to be purchase or not
            isCurrentItemPurchasable: this.model.getItem().get('_isPurchasable'),
            // @property {Boolean} isUpdate
            isUpdate: !this.model.isNew() && this.model.get('source') === 'cart'
        };
        // @class Cart.AddToCart.Button.View
    }
});

// @class Cart.AddToCart.Button.View.Initialize.Options
// @property {Product.Model} model This view is only capable of adding new PRODUCTs into the cart.
// If you need to add something else please convert it into a Product.Model.
//