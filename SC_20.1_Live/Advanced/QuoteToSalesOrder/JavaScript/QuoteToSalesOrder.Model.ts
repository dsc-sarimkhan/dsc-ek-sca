/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="QuoteToSalesOrder.Model"/>
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import TransactionModel = require('../../../Commons/Transaction/JavaScript/Transaction.Model');
import OrderHistoryModel = require('../../OrderHistory/JavaScript/OrderHistory.Model');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import Tracker = require('../../../Commons/Tracker/JavaScript/Tracker');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

// @module QuoteToSalesOrder

// @class QuoteToSalesOrder.Model @extend Transaction.Model
export = TransactionModel.extend({
    initialize: function(attributes) {
        // call the initialize of the parent object, equivalent to super()
        TransactionModel.prototype.initialize.apply(this, arguments);

        this.on('change:confirmation', function(model, confirmation) {
            model.set('confirmation', new OrderHistoryModel(confirmation), { silent: true });
        });
        this.trigger('change:confirmation', this, (attributes && attributes.confirmation) || {});
    },
    // @method urlRoot Property implemented as a function to add in all server calls the quote id parameter
    // @return {String}
    urlRoot: function(): string {
        let url =
            Utils.getAbsoluteUrl('services/QuoteToSalesOrder.Service.ss?quoteid=') +
            this.get('quoteid') +
            '&salesorderid=' +
            this.get('salesorderid');
        if (Utils.parseUrlOptions((<any>Backbone.history).location.search).externalPayment) {
            url = Utils.addParamsToUrl(url, { skipvalidation: 'true' });
        }

        return url;
    },

    /// ///////////////////////////////////////////////////
    //			COPIED METHODS							//
    //	The following method have been copied from 		//
    //	the LiveOrder.Model as the idea is make	 		//
    //	parity with the standard checkout process 		//
    //	in the future when the LiveOrder.Model 			//
    //	start inherit from Transaction.Model we will	//
    //	be able to unify this two models 				//
    /// ///////////////////////////////////////////////////

    // @method getNonShippableLines Returns the order's line that are NON Shippable
    // @returns {Array<Transaction.Line.Model>}
    getNonShippableLines: function(): any[] {
        return this.get('lines').filter(function(line) {
            return !line.get('item').get('_isfulfillable');
        });
    },

    // @method getIfThereAreDeliverableItems Determines if at least one item is shippable
    // @return {Boolean}
    getIfThereAreDeliverableItems: function getIfThereAreDeliverableItems(): boolean {
        return (
            this.get('lines').length -
                this.getNonShippableLines().length -
                this.getPickupInStoreLines().length >
            0
        );
    },
    // @method getShippableLines
    // @returns {Array<Transaction.Line.Model>} the order's line that are shippable without taking into account if their have or not set a shipaddress
    getShippableLines: function getShippableLines(): any[] {
        return this.get('lines').filter(function(line) {
            return (
                line.get('item').get('_isfulfillable') &&
                line.get('fulfillmentChoice') !== 'pickup' &&
                line.get('quantity')
            );
        });
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
    // @method shippingAddressIsRequired Checks if the shipping address is require and if all items in the order are nonshippable
    // @return {Boolean}
    shippingAddressIsRequired: function(): boolean {
        return (
            this.getIfThereAreDeliverableItems() &&
            Configuration.get('siteSettings.requireshippinginformation', 'F') === 'T'
        );
    },

    // @method save Override default save method to just return a resolved promise when the cart have already been saved.
    // @return {jQuery.Deferred}
    save: function() {
        if (this.get('confirmation') && this.get('confirmation').get('internalid')) {
            return jQuery.Deferred().resolve();
        }

        const payment_method_external = this.get('paymentmethods').findWhere({ isexternal: 'T' });
        let original_type;

        if (payment_method_external) {
            original_type = payment_method_external.get('type');
            payment_method_external.set('type', 'external', { silent: true });
        }

        return TransactionModel.prototype.save.apply(this, arguments).fail(function() {
            if (original_type) {
                payment_method_external.set('type', original_type, { silent: true });
            }
        });
    },

    // @method submit Method invoked when the user a new sales order want to be created from a quote
    // @return {jQuery.Deferred}
    submit: function() {
        const self = this;

        return this._submit
            .apply(this, arguments)
            .done(function() {
                // Converting the Transaction.Model into Track.Transaction.Model until we unified it with the LiveOrder.Model
                const confirmation = self.get('confirmation');
                const summary = self.get('summary');
                const transaction = {
                    confirmationNumber: confirmation.get('confirmationnumber'),
                    subTotal: summary.subtotal,
                    total: summary.total,
                    taxTotal: summary.taxtotal,
                    shippingCost: summary.shippingcost,
                    handlingCost: summary.handlingcost,
                    products: new Backbone.Collection()
                };
                const transactionModel = new Backbone.Model(transaction);

                self.get('lines').each(function(line) {
                    const item = line.get('item');

                    transactionModel.get('products').add(
                        new Backbone.Model({
                            sku: item.get('_sku', true),
                            name: item.get('displayname'),
                            category: item.get('category'),
                            rate: line.get('rate'),
                            quantity: line.get('quantity'),
                            options: line
                                .get('options')
                                .map(function(option) {
                                    return option.get('value').label;
                                })
                                .sort()
                                .join(', ')
                        })
                    );
                });

                Tracker.getInstance().trackTransaction(transactionModel, {
                    category: 'quote-order',
                    action: 'button',
                    label: '',
                    value: 1
                });
            })
            .fail(function(jqXhr) {
                jqXhr.preventDefault = true;
            });
    }
});
