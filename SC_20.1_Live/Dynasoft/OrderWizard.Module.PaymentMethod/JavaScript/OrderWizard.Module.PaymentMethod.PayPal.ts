/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.PaymentMethod.PayPal"/>

import * as _ from 'underscore';
import * as order_wizard_paymentmethod_paypal_module_tpl from 'order_wizard_paymentmethod_paypal_module.tpl';

import OrderWizardModulePaymentMethod = require('./OrderWizard.Module.PaymentMethod');
import Session = require('../../../Commons/Session/JavaScript/Session');
import TransactionPaymentmethodModel = require('../../../Commons/Transaction/JavaScript/Transaction.Paymentmethod.Model');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

const OrderWizardModulePaymentMethodPayPal: any = OrderWizardModulePaymentMethod.extend({
    template: order_wizard_paymentmethod_paypal_module_tpl,

    isActive: function(): boolean {
        const paypal: any = _.findWhere(
            this.wizard.application.getConfig('siteSettings.paymentmethods', []),
            { ispaypal: 'T' }
        );
        return !!(paypal && paypal.internalid);
    },

    past: function() {
        if (
            this.isActive() &&
            !this.wizard.isPaypalComplete() &&
            !this.wizard.hidePayment() &&
            this.wizard.model.get('confirmation').isNew()
        ) {
            let checkout_url = Session.get('touchpoints.checkout');
            const joint = ~checkout_url.indexOf('?') ? '&' : '?';
            const previous_step_url = this.wizard.getPreviousStepUrl();

            checkout_url += joint + 'paypal=T&next_step=' + previous_step_url;

            Backbone.history.navigate(previous_step_url, { trigger: false, replace: true });

            document.location.href = checkout_url;

            throw new Error('This is not an error. This is just to abort javascript');
        }
    },

    render: function() {
        if (this.isActive()) {
            this.paymentMethod = new TransactionPaymentmethodModel({ type: 'paypal' });

            this._render();

            if (this.wizard.isPaypalComplete()) {
                this.paymentMethod.set('primary', null);
                this.paymentMethod.set('complete', true);
                const is_ready = this.options && this.options.backFromPaypalBehavior !== 'stay';
                this.trigger('ready', is_ready);
            }
        }
    },

    getContext: function() {
        return {
            // @property {Boolean} isPaypalComplete
            isPaypalComplete: !!this.model.get('isPaypalComplete'),
            // @property {String} paypalImageUrl
            paypalImageUrl: this.wizard.application.getConfig('checkoutApp.paypalLogo')
        };
    }
});

export = OrderWizardModulePaymentMethodPayPal;
