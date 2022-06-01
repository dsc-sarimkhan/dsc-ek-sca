/// <amd-module name="ProductDetails.PaymentMethods.View"/>

import * as product_details_payment_methods_tpl from 'product_details_payment_methods.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import Utils = require('../../DSCUtilities/JavaScript/DSCUtilities');
import _ = require('underscore');

// @class ProductDetails.PaymentMethods.View @extends Backbone.View
const ProductDetailsPaymentMethods: any = BackboneView.extend({
    template: product_details_payment_methods_tpl,

    // @method getContext
    getContext: function getContext() {
        var price_container_object = this.model.getPrice();
        var paymentMethods = Utils.getPaymentMethods();

        var showPaypal = _.find(paymentMethods, function(method: any){
            return method.name.toLowerCase().indexOf('paypal') !== -1;
        });

        var showAfterpay = _.find(paymentMethods, function(method: any){
            return method.name.toLowerCase().indexOf('afterpay') !== -1;
        });

        var showZip = _.find(paymentMethods, function(method: any){
            return method.name.toLowerCase().indexOf('zip') !== -1;
        });

        return {
            displayPaymentPanel: (showPaypal !== undefined) || (showZip !== undefined) || (showAfterpay !== undefined),

            showPaypal: (showPaypal !== undefined),

            showAfterpay: (showAfterpay !== undefined),

            showZip: (showZip !== undefined),

            showPaypalOrDiv: (showPaypal !== undefined) && ((showAfterpay !== undefined) || (showZip !== undefined)),

            showAfterpayOrDiv: (showAfterpay !== undefined) && (showZip !== undefined),

            price: price_container_object.price ? price_container_object.price : 0,
        };
    }
});

export = ProductDetailsPaymentMethods;
