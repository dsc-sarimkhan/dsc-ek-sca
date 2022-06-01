/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Wizard.View"/>

import '../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView';
import '../../../Commons/Tracker/JavaScript/Tracker';

import * as wizard_tpl from 'wizard.tpl';

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import WizardStepNavigationView = require('./Wizard.StepNavigation.View');

import model = require('../../../Dynasoft/LiveOrder/JavaScript/LiveOrder.Model');
import GlobalViewsMessageView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Message.View');
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';
import * as _ from 'underscore';
import Utils = require('../../../Commons/Utilities/JavaScript/Utils');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import * as DSCUtils from '../../DSCUtilities/JavaScript/DSCUtilities';
import TransactionPaymentmethodModel = require('../../../Commons/Transaction/JavaScript/Transaction.Paymentmethod.Model');

// @class Wizard.View  Frame component, Renders the steps @extends Backbone.View
const WizardView: any = BackboneView.extend({
    template: wizard_tpl,

    enhancedEcommercePage: true,

    attributes: {
        id: 'wizard',
        'data-root-component-id': 'Wizard.View'
    },

    events: {
        'click [data-action="previous-step"]': 'previousStep',
        'click [data-action="submit-step"]': 'submit',
        'click [data-action="zippay-continue"]': 'continueWithZippay',
        'click [data-action="afterpay-continue"]': 'continueWithAfterPay'
    },

    childViews: {
        'Wizard.StepNavigation': function () {
            return new WizardStepNavigationView({
                wizard: this.wizard
            });
        }
    },

    initialize: function (options: {
        currentStep: string
    }) {
        const url = Backbone.history.fragment.split('?')[0];

        // this.model = model.getInstance();
        this.profileModel = ProfileModel.getInstance();

        this.on('afterCompositeViewRender', this.checkAfterPayResponse, this);
        this.on('afterCompositeViewRender', this.checkZipPayResponse, this);

        this.currentStep = options.currentStep || this.wizard.steps[url];
    },

    render: function () {
        this.title = this.currentStep.getName();

        // Renders itself
        this._render();

        // Then Renders the current Step
        this.currentStep.attributes = this.currentStep.attributes || {};
        this.currentStep.attributes['data-root-component-id'] = this.attributes[
            'data-root-component-id'
        ];
        this.currentStep.render();

        // Then adds the step in the #wizard-content element of self
        this.$('#wizard-content')
            .empty()
            .append(this.currentStep.$el);

        // DSC: set custom payment method name
        if (window.location.hash.indexOf('review') !== -1) {
            if (this.model.get('customPayMethod') === 'zippay' && (this.model.get('ccardsecurity') === undefined || this.model.get('ccardsecurity') === '')) {
                setTimeout(() => {
                    $("div[data-view='PaymentMethods.Collection']").html('<p>ZipPay</p>');
                    $('button[data-action="submit-step"]').html('Place Order');
                    $('div.order-wizard-promocodeform').hide();
                }, 500); //rendering payment type after child component loaded
            }
            if (this.model.get('customPayMethod') === 'afterpay' && (this.model.get('ccardsecurity') === undefined || this.model.get('ccardsecurity') === '')) {
                setTimeout(() => {
                    $("div[data-view='PaymentMethods.Collection']").html('<p>Afterpay</p>');
                    $('button[data-action="submit-step"]').html('Place Order');
                    $('div.order-wizard-promocodeform').hide();
                }, 500); //rendering payment type after child component loaded
            }
        }
        if (window.location.hash.indexOf('shipping') !== -1) {
            window.localStorage.removeItem('billaddress'); //remove billing address from local storage if user navigate back to shipping
        }
    },

    // @method showError handle error messages on each step so we disable the global ErrorManagment
    showError: function (message) {
        this.wizard.manageError(message);
    },

    // @method previousStep
    previousStep: function (e) {
        this.wizard.getCurrentStep().previousStep(e);
    },

    // @method getHeaderView
    getHeaderView: function () {
        return this.wizard.getCurrentStep() && this.wizard.getCurrentStep().headerView;
    },

    // @method getHeaderViewOptions
    getHeaderViewOptions: function () {
        return (
            this.wizard.getCurrentStep() &&
            this.wizard.getCurrentStep().headerViewOptions &&
            this.wizard.getCurrentStep().headerViewOptions()
        );
    },

    // @method getFooterView
    getFooterView: function () {
        return this.wizard.getCurrentStep() && this.wizard.getCurrentStep().footerView;
    },

    // @method getFooterViewOptions
    getFooterViewOptions: function () {
        return (
            this.wizard.getCurrentStep() &&
            this.wizard.getCurrentStep().footerViewOptions &&
            this.wizard.getCurrentStep().footerViewOptions()
        );
    },

    getPageDescription: function () {
        return 'checkout - ' + (Backbone.history.fragment || '').split('?')[0]; // remove parameters - we don't want a variable value for site-page
    },

    renderGlobalMessage: function (message, type, closable) {
        $('div.global-views-message').remove();
        const global_view_message = new GlobalViewsMessageView({
            message: message,
            type: type,
            closable: closable
        });
        // Renders the error message and into the placeholder
        this.$el.children().first().prepend(global_view_message.render().$el.html());
    },

    // @method submit
    submit: function (e) {
        //for placing order from review page
        let currentStep = this.wizard.getCurrentStep();
        
        if (currentStep.step_url === "review" && 
                (this.model.get('customPayMethod') === 'afterpay') ||
                (this.model.get('customPayMethod') === 'zippay')) {
            $('[data-action="submit-step"]').prop('disabled', true); //disabled place order button
            $("div.order-wizard-submitbutton-container").append("<span id='order-status-span' style='color:red;'>Please wait, order is being processed!</span>");
            this.model.fetch({async:false});
            if(this.model.get('customPayMethod') === 'afterpay'){
                if(parseFloat(window.localStorage.getItem("afterPayOrderAmount")) !== Math.round(this.model.get('summary').total *100) /100 ){
                    this.renderGlobalMessage("Afterpay checkout token amount and sales order amount is different, please create new token from previous step.", "error", true);
                    return false;
                }
                if (this.model.get('custbody_dsc_afterpay_token') === "") {
                    console.log("Afterpay Error: stopping order processing!!!");
                    $("#order-status-span").remove();
                    return false;
                }
                var options = _.extend(this.model.get('options'), {
                    'custbody_dsc_afterpay_token': this.model.get('custbody_dsc_afterpay_token')
                });
            }
            
            if(this.model.get('customPayMethod') === 'zippay'){
                if(parseFloat(window.localStorage.getItem("zipPayOrderAmount")) !== Math.round(this.model.get('summary').total *100) /100){
                    this.renderGlobalMessage("ZipPay checkout token amount and sales order amount is different, please create new token from previous step.", "error", true);
                    return false;
                }
                if (this.model.get('custbody_ek_zipcheckaccid') === "") {
                    console.log("Zip Error: stopping order processing!!!", this.model);
                    $("#order-status-span").remove();
                    return false;
                }
                var options = _.extend(this.model.get('options'), {
                    'custbody_ek_zipcheckaccid': this.model.get('custbody_ek_zipcheckaccid')
                });

            }
            this.model.set('options', options);
            this.addCustomPaymentMethod();
        } //
        //set shipping cost for smart freight
        if (currentStep.step_url === "review"){
            if(this.model.get('billaddress').indexOf('null') !== -1){
                this.model.set('billaddress', window.localStorage.getItem('billaddress'));
            }
            options = _.extend(this.model.get('options'), {
                'custbody_dsc_custom_shipping_cost': this.model.get('summary').shippingcost.toFixed(2),
                'custbody_dsc_custom_shipping_method': this.model.get('shipmethod')
            });
            this.model.set('options', options);
        }
        //END
        this.wizard.getCurrentStep().submit(e);
    },

    addCustomPaymentMethod: function(){
        let customPaymentMethod = this.model.get("customPaymentMethod");
        const paymentMethod = new TransactionPaymentmethodModel({
            type: 'external_checkout_' + customPaymentMethod.key,
            isexternal: 'T',
            internalid: customPaymentMethod.internalid,
            merchantid: customPaymentMethod.merchantid,
            key: customPaymentMethod.key
        });
        this.model.addPayment(paymentMethod, true);
    },

    getZipPayCharge: function(){
        this.model.fetch({async:false});
        var data = {
            "authority": {
                "type": "checkout_id",
                "value": this.model.get('custbody_ek_zipcheckaccid')
            },
            "amount": this.model.get('summary').total,
            "currency": "AUD"
        }
        var self = this;

        jQuery.ajax({
            url: Utils.getAbsoluteUrl('services/ZipPay.Service.ss?chargeData=' + btoa(JSON.stringify(data))), //to encode data in base64
            type: 'GET',
            async: false,
            success: function (response) {
                if (response) {
                    var response_body = JSON.parse(response.body);
                    if (response_body) {
                        $('div.global-views-message').remove(); //remove previous message 
                        // console.log("response_body", response_body)
                        if(response_body.error && response_body.error.code !== undefined){
                            self.renderGlobalMessage("Error: "+response_body.error.message, 'error', true);
                            return false;
                        }else{
                            if(response_body.state === "captured"){
                                var options = _.extend(self.model.get('options'), {
                                    'custbody_ek_zipcheckaccid': self.model.get('custbody_ek_zipcheckaccid'),
                                    'custbody_dsc_zippay_charge_id': response_body.id,
                                    'custbody_dsc_zippay_charge_data': JSON.stringify(response_body)
                                });
                                self.model.set('options', options);
                            }
                            return true;
                        }
                    }
                }
            }
        });
    },

    getZipPayData: function () {
        var self = this;
        var data = {};
        var items = [];

        var addresses = this.profileModel.get('addresses').models;
        var ship_address = _.find(addresses, function (address: any) {
            return address.id == self.model.get('shipaddress');
        });
        var bill_address = _.find(addresses, function (address: any) {
            return address.id == self.model.get('billaddress');
        });
        var address = ship_address || this.model.get('addresses').models[0]; //shipping address
        var billingAddress = bill_address || this.model.get('addresses').models[0];

        var shipping_address = {
            "pickup": true,
            "address": {}
        } //default pickup
        var fulfillment_choice = '';
        var redirect_url = SC.ENVIRONMENT.baseUrl.replace('{{file}}', 'checkout.ssp?is=checkout#review?force=true')
        _.each(this.model.get('lines').models, function (model: any) {
            items.push({
                "name": model.get('item').get('displayname'),
                "amount": parseFloat(model.get('rate')),
                "quantity": model.get('quantity'),
                "type": "sku",
                "reference": model.get('item').get('itemid')
            })
            fulfillment_choice = model.get('fulfillmentChoice');
        });

        if (fulfillment_choice != 'pickup') {
            shipping_address = {
                ​
                "pickup": false,
                "address": {
                    ​​​​​​​​
                    "line1": address.get('addr1'),
                    "city": address.get('city'),
                    "state": address.get('state'),
                    "postal_code": address.get('zip'),
                    "country": address.get('country')
                }​​​​​​​​
            }
        }

        var billing_address = {
            "line1": billingAddress.get('addr1'),
            "city": billingAddress.get('city'),
            "state": billingAddress.get('state'),
            "postal_code": billingAddress.get('zip'),
            "country": billingAddress.get('country')
        }
        data = {
            "shopper": {
                "first_name": this.profileModel.get('firstname'),
                "last_name": this.profileModel.get('lastname'),
                "email": this.profileModel.get('email'),
                "billing_address": billing_address
            }​​​​​​​​,
            "order": {
                "amount": this.model.get('summary').total,
                "currency": "AUD",
                "shipping": shipping_address,
                "items": items
            }​​​​​​​​,
            "config": {
                "redirect_uri": redirect_url //"http://www.redirectsuccess.com/zipmoney/approved"
            }​​​​​​​​,
            "metadata": {} //required field
        }

        window.localStorage.setItem("zipPayOrderAmount", parseFloat(this.model.get('summary').total).toFixed(2)); //setting amount for checking before order placement

        return data;
    },

    checkZipPayResponse: function () {
        if((this.model.get('billaddress') === undefined || (this.model.get('billaddress') && this.model.get('billaddress').indexOf('null') !== -1))
            && window.localStorage.getItem('billaddress')){
            this.model.set('billaddress', window.localStorage.getItem('billaddress'));
        }
        if (DSCUtils.getURLParam('result') && DSCUtils.getURLParam('result') === 'cancelled') {
            location.replace(SC.ENVIRONMENT.baseUrl.replace('{{file}}', 'checkout.ssp?is=checkout#billing?force=true?result=cancelled'))
            this.renderGlobalMessage("ZipPay Order Payment Status is: CANCELLED. Please try different *Payment method*", "error", true);
        } else if (DSCUtils.getURLParam('result') && DSCUtils.getURLParam('result') === 'approved') {
            this.renderGlobalMessage("Payment is confirmed with zippay. Please proceed to complete the order.", "success", true);
            this.model.set('custbody_ek_zipcheckaccid', DSCUtils.getURLParam('checkoutId'));
            return true;
        }
    },

    continueWithZippay: function () {
        if(!this.model.get("billaddress")){
            this.renderGlobalMessage("Please select a billing address!", "error", true);
            window.scrollTo(0, 0);
            return false;
        }else{
            window.localStorage.setItem('billaddress', this.model.get("billaddress"));
        }
        var data = this.getZipPayData();
        if (data) {
            jQuery.ajax({
                url: Utils.getAbsoluteUrl('services/ZipPay.Service.ss?data=' + btoa(JSON.stringify(data))), //to encode data in base64
                type: 'GET',
                async: false,
                success: function (response) {
                    if (response) {
                        var response_body = JSON.parse(response.body);
                        if (response_body) {
                            if (response_body.uri) {
                                location.replace(response_body.uri);
                            }
                        }
                    }
                }
            });
        }
    },

    getAfterPayPayment: function () {
        this.model.fetch({async:false});
        var data = {
            "token": this.model.get("custbody_dsc_afterpay_token"),
            "amount":{"amount":this.model.get('summary').total, "currency" : "AUD"}
        }
        var self = this;

        jQuery.ajax({
            url: Utils.getAbsoluteUrl('services/AfterPay.Service.ss?paymentData=' + btoa(JSON.stringify(data))), //to encode data in base64
            type: 'GET',
            async: false,
            success: function (response) {
                if (response) {
                    var response_body = JSON.parse(response.body);
                    if(response_body.errorCode && response_body.errorCode !== undefined){
                        var errorMsg = "Error: ("+response_body.httpStatusCode+")-"+response_body.message;
                        if(response_body.errorCode === 'invalid_amount'){
                            errorMsg += ". <a style='color:#fff' href='javascript:void(0)' data-action='afterpay-continue'> Please click here to re-process! </a>";
                        }
                        self.renderGlobalMessage(errorMsg, 'error', true);
                        return false;
                    }else{
                        if(response_body.status === "APPROVED"){
                            var options = _.extend(self.model.get('options'), {
                                'custbody_dsc_afterpay_token': self.model.get('custbody_dsc_afterpay_token'),
                                'custbody_dsc_afterpay_payment_id': response_body.id,
                                'custbody_dsc_afterpay_payment_data': JSON.stringify(response_body)
                            });
                            self.model.set('options', options);
                        }
                        if(response_body.status === 'DECLINED'){
                            self.renderGlobalMessage("Afterpay DECLINED payment, please contact with Afterpay or go back and choose other payment method.", "error", "true");
                        }
                        return true;
                    }
                }
            }
        });
    },

    continueWithAfterPay: function () {
        if (!this.model.get("billaddress")) {
            this.renderGlobalMessage("Please select a billing address!", "error", true);
            window.scrollTo(0, 0);
            return false;
        } else {
            window.localStorage.setItem('billaddress', this.model.get("billaddress"));
        }
        var data = this.getAfterPayData();
        if (data) {
            var self = this;
            var amount = this.model.get('summary').total;
            jQuery.ajax({
                url: Utils.getAbsoluteUrl('services/AfterPay.Service.ss?config=true'), //to encode data in base64
                type: 'GET',
                async: false,
                success: function (response) {
                    if (response) {
                        var response_body = JSON.parse(response.body);
                        if (response_body.maximumAmount.amount >= amount) {
                            if (data) {
                                jQuery.ajax({
                                    url: Utils.getAbsoluteUrl('services/AfterPay.Service.ss?data=' + btoa(JSON.stringify(data))), //to encode data in base64
                                    type: 'GET',
                                    async: false,
                                    success: function (response) {
                                        if (response) {
                                            var response_body = JSON.parse(response.body);
                                            if (response_body.errorCode && response_body.errorCode != "") {
                                                self.renderGlobalMessage(response_body.message, "error", true);
                                            }
                                            if (response_body) {
                                                if (response_body.redirectCheckoutUrl) {
                                                    location.replace(response_body.redirectCheckoutUrl);
                                                }
                                            }
                                        }
                                    }
                                });
                            }
                        } else {
                            self.renderGlobalMessage("Unsupported Payment, for Order on Afterpay maximum amount must be " + response_body.maximumAmount.amount + " " + response_body.maximumAmount.currency, "error", true);
                        }
                    }
                }
            });
        }
    },

    getAfterPayData: function () {
        var self = this;
        var data = {};
        var items = [];

        var addresses = this.profileModel.get('addresses').models;
        var ship_address = _.find(addresses, function (address: any) {
            return address.id == self.model.get('shipaddress');
        });
        var bill_address = _.find(addresses, function (address: any) {
            return address.id == self.model.get('billaddress');
        });
        var address = ship_address || this.model.get('addresses').models[0]; //shipping address
        var billingAddress = bill_address || this.model.get('addresses').models[0];

        var shipping_address = null;
        var fulfillment_choice = '';
        var redirect_url = SC.ENVIRONMENT.baseUrl.replace('{{file}}', 'checkout.ssp?is=checkout#review?force=true')
        var cancel_url = SC.ENVIRONMENT.baseUrl.replace('{{file}}', 'checkout.ssp?is=checkout#billing?force=true')
        _.each(this.model.get('lines').models, function (model: any) {
            let rateWithTax = model.get('rate') + (model.get('rate') * 0.1);
            items.push({
                "name": model.get('item').get('displayname'),
                "quantity": model.get('quantity'),
                "price": {
                    "amount": parseFloat(rateWithTax).toFixed(2),
                    "currency": "AUD"
                },
                "sku": model.get('item').get('itemid')
            })
            fulfillment_choice = model.get('fulfillmentChoice');

        });

        if (fulfillment_choice != 'pickup') {
            shipping_address = {
                "name": address.get('fullname'),
                "line1": address.get('addr1'),
                "area1": address.get('city'),
                "region": address.get('state'),
                "postcode": address.get('zip'),
                "countryCode": address.get('country')
            }
        }

        var billing_address = {
            "name": billingAddress.get('fullname'),
            "line1": billingAddress.get('addr1'),
            "area1": billingAddress.get('city'),
            "region": billingAddress.get('state'),
            "postcode": billingAddress.get('zip'),
            "countryCode": billingAddress.get('country')
        }

        data = {
            "amount": {
                "amount": parseFloat(this.model.get('summary').total).toFixed(2),
                "currency": "AUD"
            },
            "consumer": {
                "givenNames": this.profileModel.get('firstname'),
                "surname": this.profileModel.get('lastname'),
                "email": this.profileModel.get('email')
            },
            "billing": billing_address,
            "shipping": shipping_address,
            "items": items,
            "merchant": {
                "redirectConfirmUrl": redirect_url,
                "redirectCancelUrl": cancel_url //window.location.origin + '/cart?afterPayStatus=CancelOrder'
            }
        }

        window.localStorage.setItem("afterPayOrderAmount", parseFloat(this.model.get('summary').total).toFixed(2)); //setting amount for checking before order placement
        
        return data;
    },

    checkAfterPayResponse: function () {
        if ((this.model.get('billaddress') === undefined || (this.model.get('billaddress') && this.model.get('billaddress').indexOf('null') !== -1)) &&
            window.localStorage.getItem('billaddress')) {
            this.model.set('billaddress', window.localStorage.getItem('billaddress'));
        }
        if (DSCUtils.getURLParam('status') && DSCUtils.getURLParam('status').toLowerCase() === 'cancelled') {
            this.renderGlobalMessage("Afterpay Order Payment Status is: CANCELLED. Please try different *Payment method*", "error", true);
        } else if (DSCUtils.getURLParam('status') && DSCUtils.getURLParam('status').toLowerCase() === 'success') {
            this.renderGlobalMessage("Token has created for Afterpay successfully. Please review order and place it.", "success", true);
            this.model.set('custbody_dsc_afterpay_token', DSCUtils.getURLParam('orderToken'));
            return true;
        }
    },

    // @method getContext @return {Wizard.View.Context}
    getContext: function () {
        // @class Wizard.View.Context
        return {
            // @property {Boolean} showBreadcrumb
            showBreadcrumb: !this.wizard.getCurrentStep().hideBreadcrumb
        };
        // @class Wizard.View
    }
});

export = WizardView;