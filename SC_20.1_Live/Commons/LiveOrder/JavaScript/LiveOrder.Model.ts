/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="LiveOrder.Model"/>
// @module LiveOrder

import * as _ from 'underscore';
import { Loggers } from '../../Loggers/JavaScript/Loggers';

import * as Utils from '../../Utilities/JavaScript/Utils';
import { ItemTrack } from '../../Instrumentation/JavaScript/APMTrackerParameters';
import * as InstrumentationAddToCart from '../../Instrumentation/JavaScript/InstrumentationAddToCart';

import * as jQuery from '../../Core/JavaScript/jQuery';

import TransactionModel = require('../../Transaction/JavaScript/Transaction.Model');
import TransactionShipmethodCollection = require('../../Transaction/JavaScript/Transaction.Shipmethod.Collection');
import LiveOrderLineCollection = require('../../LiveOrder/JavaScript/LiveOrder.Line.Collection');
import LiveOrderLineModel = require('../../LiveOrder/JavaScript/LiveOrder.Line.Model');
import ProfileModel = require('../../Profile/JavaScript/Profile.Model');
import Session = require('../../Session/JavaScript/Session');
import Singleton = require('../../Main/JavaScript/Singleton');
import AjaxRequestsKiller = require('../../AjaxRequestsKiller/JavaScript/AjaxRequestsKiller');
import Configuration = require('../../Utilities/JavaScript/SC.Configuration');
import Tracker = require('../../Tracker/JavaScript/Tracker');

// @class LiveOrder.Model Model for showing information about an open order.
// It is a singleton so you can obtain the instance fro anywhere by calling ```LiveOrderModel.getInstance()```
// @extends Transaction.Model
const ClassProperties = _.extend(
    {
        // @method loadCart
        // @return {jQuery.Deferred}
        // @static
        loadCart: function() {
            // if the Page Generator is on, do not fetch the cart. Instead, return an empty solved promise
            if (_.result(SC, 'isPageGenerator')) {
                return jQuery.Deferred().resolve();
            }

            const cart_instance = this.getInstance();

            if (cart_instance.cartLoad) {
                if (cart_instance.isLoading) {
                    cart_instance.isLoading = false;
                }
            } else {
                cart_instance.cartLoad = jQuery.Deferred();

                ProfileModel.getPromise().done(function() {
                    cart_instance
                        .fetch()
                        .done(function() {
                            cart_instance.cartLoad.resolve.apply(this, arguments);
                        })
                        .fail(function() {
                            cart_instance.cartLoad.reject.apply(this, arguments);
                        })
                        .always(function() {
                            if (cart_instance.isLoading) {
                                cart_instance.isLoading = false;
                            }
                        });
                });
            }

            return cart_instance.cartLoad;
        },
        countItems: function(lines) {
            let item_count = 0;

            _.each(lines.models ? lines.models : lines, function(line: any) {
                if (line.get('quantity')) {
                    item_count += line.get('quantity');
                }
            });

            return item_count;
        }
    },
    Singleton
);

const LiveOrderModel = TransactionModel.extend(
    {
        linesCollection: LiveOrderLineCollection,

        validation: {
            zip: { fn: Utils.validateZipCode }
        },

        // @method urlRoot
        // @return {String}
        urlRoot: function urlRoot() {
            if (SC.SESSION.currency && SC.SESSION.currency.internalid) {
                return Utils.getAbsoluteUrl(
                    'services/LiveOrder.Service.ss?cur=' + SC.SESSION.currency.internalid
                );
            }
            return Utils.getAbsoluteUrl('services/LiveOrder.Service.ss');
        },

        // @method url redefine url to avoid possible cache problems from browser
        // @return {Void}
        url: function url() {
            const base_url = TransactionModel.prototype.url.apply(this, arguments);
            return base_url + (base_url.indexOf('?') > 0 ? '&' : '?') + 't=' + new Date().getTime();
        },

        initialize: function initialize(attributes) {
            // call the initialize of the parent object, equivalent to super()
            TransactionModel.prototype.initialize.apply(this, arguments);

            this.set('internalid', 'cart');

            this.on('change:confirmation', function(model, confirmation) {
                model.set('confirmation', new TransactionModel(confirmation), { silent: true });
            });
            this.trigger(
                'change:confirmation',
                this,
                (attributes && attributes.confirmation) || {}
            );

            this.on('change:multishipmethods', function(model, multishipmethods) {
                if (multishipmethods) {
                    _.each(_.keys(multishipmethods), function(address_id) {
                        multishipmethods[address_id] = new TransactionShipmethodCollection(
                            multishipmethods[address_id],
                            { silent: true }
                        );
                    });
                }

                model.set('multishipmethods', multishipmethods, { silent: true });
            });
            this.trigger(
                'change:multishipmethods',
                this,
                (attributes && attributes.multishipmethods) || []
            );

            // Some actions in the live order may change the url of the checkout so to be sure we re send all the touchpoints
            this.on('change:touchpoints', function(model, touchpoints) {
                Session.set('touchpoints', touchpoints);
            });
            // metadata of the attribute options(custom fields)
            if (
                SC.ENVIRONMENT.customFieldsMetadata &&
                SC.ENVIRONMENT.customFieldsMetadata.salesorder
            ) {
                this.__customFieldsMetadata = SC.ENVIRONMENT.customFieldsMetadata.salesorder;
            }
        },

        // @method getLatestAddition
        // @return {LiveOrder.Line.Model}
        getLatestAddition: function getLatestAddition() {
            let model = null;

            if (this.get('latest_addition')) {
                model = this.get('lines').get(this.get('latest_addition'));
            }

            if (!model && this.get('lines').length) {
                model = this.get('lines').at(0);
            }

            return model;
        },

        // @method findItemInCart Algorithm to search an line in the cart. We can't use internalid only because for matrix items, the internalid change when is added to the cart
        // @param {Transaction.Line.Model} line
        // @return {LiveOrder.Line.Model}
        findLine: function findLine(line) {
            return this.get('lines').find(function(cart_line) {
                return cart_line.isEqual(line);
            });
        },

        // @method addLines Add the passed in collection of products as new lines to the Cart
        // @param {Array<TransactionLineModel|LiveOrder.Line.Collection>} lines
        // @return {jQuery.Deferred}
        addLines: function addLines(lines) {
            const self = this;

            return this.cancelableTrigger('before:LiveOrder.addLines', lines).then(function() {
                lines =
                    lines instanceof LiveOrderLineCollection
                        ? lines
                        : new LiveOrderLineCollection(lines);

                // As the LiveOrder.Live.Service IS NOT REST we cannot use lines.save,
                // instead we directly call lines.sync
                const old_lines = self.get('lines').clone();
                const promise = lines.sync('create', lines, {
                    killerId: AjaxRequestsKiller.getKillerId()
                });

                promise.done(function(attributes) {
                    // Though this should be a restful api, the live-order-line returns the full
                    // live-order back (lines and summary are interconnected)

                    self.set(attributes);

                    Tracker.getInstance().trackAddToCart(
                        self.get('lines').get(self.get('latest_addition'))
                    );

                    Tracker.getInstance().trackCartUpdate(self.get('lines'));

                    InstrumentationAddToCart.addOperationIdToCartLine(
                        self.get('lines').models,
                        lines
                    );
                    self.cancelableTrigger(
                        'after:LiveOrder.addLines',
                        old_lines,
                        self.get('lines').clone()
                    );
                });

                return promise;
            });
        },

        // @method addLine
        // @param {Transaction.Line.Model} line
        // @return {jQuery.Deferred}
        addLine: function addLine(line) {
            return this.addLines([line]);
        },

        // @method addProduct
        // @param {Product.Model} line
        // @return {jQuery.Deferred}
        addProduct: function addProduct(product) {
            return this.addLine(LiveOrderLineModel.createFromProduct(product));
        },

        // @method addProducts
        // @param {Array<Product.Model>} products
        // @return {jQuery.Deferred}
        addProducts: function addProducts(products) {
            const lines = _.map(products, function(product) {
                return LiveOrderLineModel.createFromProduct(product);
            });

            return this.addLines(lines);
        },

        // @method updateProduct
        // @param {Product.Model} product
        // @return {jQuery.Deferred}
        updateProduct: function updateProduct(product) {
            return this.updateLine(LiveOrderLineModel.createFromProduct(product));
        },

        // @method updateLine
        // @param {Transaction.Line.Model} line
        // @return {jQuery.Deferred}
        updateLine: function updateLine(line, preventDefault) {
            const self = this;

            return this.cancelableTrigger('before:LiveOrder.updateLine', line).then(function() {
                // As the LiveOrder.Live.Service IS NOT REST we
                // cannot use line.save, instead we directly call line.sync
                return line
                    .sync('update', line, {
                        killerId: AjaxRequestsKiller.getKillerId(),
                        validate: false,
                        preventDefault: preventDefault
                    })
                    .done(function(attributes) {
                        // Although this should be a restful api, the live-order-line returns
                        // the full live-order back (lines and summary are interconnected)
                        self.set(attributes);

                        Tracker.getInstance().trackAddToCart(self.getLatestAddition());

                        self.cancelableTrigger('after:LiveOrder.updateLine', line);
                    })
                    .fail(function(jqXhr) {
                        let error_details = null;
                        try {
                            const response = JSON.parse(jqXhr.responseText);
                            error_details = response.errorDetails;
                        } finally {
                            if (error_details && error_details.status === 'LINE_ROLLBACK') {
                                const line = self.get('lines').get(error_details.oldLineId);

                                if (line) {
                                    line.set('internalid', error_details.newLineId);
                                    self.trigger('LINE_ROLLBACK', line);
                                }
                            }
                        }
                    });
            });
        },

        // @method removeLine
        // @param {LiveOrder.Line.Model} line
        // @return {jQuery.Deferred}
        removeLine: function removeLine(line) {
            const self = this;
            const loggers = Loggers.getLogger();
            const actionId = loggers.start('Remove from Cart');

            return this.cancelableTrigger('before:LiveOrder.removeLine', line).then(function() {
                const item: ItemTrack = InstrumentationAddToCart.itemToTrack(line);
                return line
                    .sync('delete', line, {
                        killerId: AjaxRequestsKiller.getKillerId(),
                        validate: false
                    })
                    .done(function(attributes) {
                        self.set(attributes);
                        loggers.end(actionId, {
                            operationIds: line.getOperationIds(),
                            status: 'success',
                            itemId: item.itemId,
                            itemQuantity: item.itemQuantity
                        });

                        self.cancelableTrigger('after:LiveOrder.removeLine', line);
                    });
            });
        },

        // @method submit invoked when the user place/submit the order
        // @return {jQuery.Deferred}
        submit: function submit() {
            const loggers = Loggers.getLogger();
            const actionId = loggers.start('Place Order');

            const self = this;

            return this.cancelableTrigger('before:LiveOrder.submit').then(function() {
                self.set('internalid', null);

                const creditcard = self.get('paymentmethods').findWhere({ type: 'creditcard' });
                const paypal = self.get('paymentmethods').findWhere({ type: 'paypal' });

                if (creditcard && !creditcard.get('creditcard')) {
                    self.get('paymentmethods').remove(creditcard);
                }

                if (paypal && !paypal.get('complete')) {
                    self.get('paymentmethods').remove(paypal);
                }

                if (!self.shippingAddressIsRequired()) {
                    self.unset('shipaddress', { silent: true });
                    self.set('sameAs', false, { silent: true });
                }
                const beforeActionOperationIds = _.clone(self.getOperationIds());

                return self
                    .save()
                    .done(function(order) {
                        let lastOperationIdIndex = self.getOperationIds().length;
                        if (beforeActionOperationIds && beforeActionOperationIds.length > 0) {
                            lastOperationIdIndex = beforeActionOperationIds.length;
                        }
                        const orderOperationIds = self.getLatestOperationIds(lastOperationIdIndex);
                        loggers.end(actionId, {
                            operationIds: orderOperationIds,
                            status: 'success',
                            transactionId: order.confirmation.internalid
                        });
                        const suiteTaxEnabled = Configuration.get('siteSettings.isSuiteTaxEnabled');

                        if (suiteTaxEnabled) {
                            jQuery
                                .get(
                                    Utils.getAbsoluteUrl(
                                        'SC/OrderHistory/OrderHistory.ss?internalid=' +
                                            order.confirmation.internalid+'&n='+SC.ENVIRONMENT.siteSettings.siteid+'&domain='+SC.ENVIRONMENT.shoppingDomain,
                                        true
                                    )
                                )
                                .then(function(result) {
                                    self.set('suitetaxes', _.isArray(result) ? result : []);
                                });
                        }

                        self.cancelableTrigger('after:LiveOrder.submit', order.confirmation);
                    })
                    .fail(function() {
                        loggers.end(actionId, {
                            operationIds: self.getOperationIds(),
                            status: 'fail'
                        });
                        self.set('internalid', 'cart');
                    });
            });
        },

        // @method save Override default save method to just return a resolved promise when the cart have already been saved.
        // @return {jQuery.Deferred}
        save: function save() {
            if (this.get('confirmation') && this.get('confirmation').get('internalid')) {
                return jQuery.Deferred().resolve();
            }
            return TransactionModel.prototype.save.apply(this, arguments);
        },

        // @method getTotalItemCount
        // @return {Number}
        getTotalItemCount: function getTotalItemCount() {
            return _.reduce(
                this.get('lines').pluck('quantity'),
                function(memo, quantity) {
                    return memo + (parseFloat(<any>quantity) || 1);
                },
                0
            );
        },

        parse: function parse(_response, options) {
            if (options && !options.parse) {
                return;
            }

            return TransactionModel.prototype.parse.apply(this, arguments);
        },

        // @method getUnsetLines
        // @returns {Array<Transaction.Line.Model>} the order's lines that have not set its addresses to Multi Ship To yet
        getUnsetLines: function getUnsetLines() {
            return this.get('lines').filter(function(line) {
                return !line.get('shipaddress') && line.get('item').get('_isfulfillable');
            });
        },

        // @method getNonShippableLines
        // @returns {Array<Transaction.Line.Model>} the order's line that are NON Shippable
        getNonShippableLines: function getNonShippableLines() {
            return this.get('lines').filter(function(line) {
                return !line.get('item').get('_isfulfillable');
            });
        },

        // @method getSetLines
        // @returns {Array<Transaction.Line.Model>} the list of lines already set its shipping address
        getSetLines: function getSetLines() {
            return this.get('lines').filter(function(line) {
                return line.get('shipaddress') && line.get('item').get('_isfulfillable');
            });
        },

        // @method getShippableLines
        // @returns {Array<Transaction.Line.Model>} the order's line that are shippable without taking into account if their have or not set a shipaddress
        getShippableLines: function getShippableLines() {
            return this.get('lines').filter(function(line) {
                return (
                    line.get('item').get('_isfulfillable') &&
                    line.get('fulfillmentChoice') !== 'pickup' &&
                    line.get('quantity')
                );
            });
        },

        // @method getItemsIds
        // @returns {Array<String>} an array containing the cart items ids
        // @return {Array<String>}
        getItemsIds: function getItemsIds() {
            return this.get('lines').map(function(line) {
                return line.get('item').get('internalid');
            });
        },

        // @method getIfThereAreDeliverableItems Determines if at least one item is shippable
        // @return {Boolean}
        getIfThereAreDeliverableItems: function getIfThereAreDeliverableItems() {
            return (
                this.get('lines').length -
                    this.getNonShippableLines().length -
                    this.getPickupInStoreLines().length >
                0
            );
        },

        // @method shippingAddressIsRequired Checks if the shipping address is require and if all items in the order are non-shippable.
        // @return {Boolean}
        shippingAddressIsRequired: function shippingAddressIsRequired() {
            return (
                this.getIfThereAreDeliverableItems() &&
                Configuration.get('siteSettings.requireshippinginformation', 'F') === 'T'
            );
        },

        getPickupInStoreLines: function getPickupInStoreLines() {
            const lines = [];
            this.get('lines').each(function(line) {
                if (line.get('fulfillmentChoice') === 'pickup') {
                    lines.push(line);
                }
            });

            return lines;
        },

        addPromotion: function addPromotion(promocode) {
            const self = this;

            return this.cancelableTrigger('before:LiveOrder.addPromotion', {
                code: promocode
            }).then(function() {
                const pre_promocodes = self.get('promocodes') || [];
                const new_promocodes = pre_promocodes.concat([{ code: promocode }]);

                return self
                    .save({ promocodes: new_promocodes }, { preventDefault: true })
                    .then(function() {
                        const added_promocode = _.find(self.get('promocodes'), function(promo) {
                            return (<any>promo).code === promocode;
                        });

                        // We kept the pre existing event
                        self.trigger('promocodeUpdated', 'applied');
                        self.cancelableTrigger('after:LiveOrder.addPromotion', added_promocode);

                        return added_promocode;
                    })
                    .fail(function() {
                        self.set('promocodes', pre_promocodes);
                        self.trigger('apply_promocode_failed');
                    })
                    .always(function() {
                        self.trigger('apply_promocode_finished');
                    });
            });
        },

        removePromotion: function removePromotion(promocode_internal_id) {
            const self = this;

            return this.cancelableTrigger('before:LiveOrder.removePromotion', {
                internalid: promocode_internal_id
            }).then(function() {
                let promocodes = self.get('promocodes') || [];

                promocodes = _.reject(promocodes, function(promocode) {
                    return (<any>promocode).internalid === promocode_internal_id;
                });

                return self
                    .save({ promocodes: promocodes })
                    .always(function() {
                        self.trigger('remove_promocode_finished');
                    })
                    .pipe(function() {
                        // We kept the pre existing event
                        self.trigger('promocodeUpdated', 'removed');
                        self.cancelableTrigger('after:LiveOrder.removePromotion', {
                            internalid: promocode_internal_id
                        });
                    });
            });
        },

        addPayment: function addPayment(payment_method, save) {
            const self = this;

            return this.cancelableTrigger('before:LiveOrder.addPayment', payment_method).pipe(
                function() {
                    try {
                        TransactionModel.prototype.addPayment.apply(self, [payment_method]);

                        let promise = jQuery.Deferred().resolve();
                        if (save) {
                            promise = self.save();
                        }

                        return promise.then(function() {
                            self.cancelableTrigger('after:LiveOrder.addPayment', payment_method);
                        });
                    } catch (error) {
                        return jQuery.Deferred().reject(error);
                    }
                }
            );
        },

        setAddress: function setAddress(address_type, address_id, options, save) {
            const self = this;
            const address = {
                id: address_id,
                type: address_type
            };

            return this.cancelableTrigger('before:LiveOrder.setAddress', address).pipe(function() {
                try {
                    TransactionModel.prototype.setAddress.apply(self, [
                        address_type,
                        address_id,
                        options
                    ]);

                    let promise = jQuery.Deferred().resolve();
                    if (save) {
                        promise = self.save();
                    }

                    return promise.then(function() {
                        self.cancelableTrigger('after:LiveOrder.setAddress', address);
                    });
                } catch (error) {
                    return jQuery.Deferred().reject(error);
                }
            });
        }
    },
    ClassProperties
);

export = LiveOrderModel;
