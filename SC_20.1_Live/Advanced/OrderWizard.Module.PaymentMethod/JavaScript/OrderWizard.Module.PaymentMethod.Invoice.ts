/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.PaymentMethod.Invoice"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as order_wizard_paymentmethod_invoice_module_tpl from 'order_wizard_paymentmethod_invoice_module.tpl';

import OrderWizardModulePaymentMethod = require('./OrderWizard.Module.PaymentMethod');
import TransactionPaymentmethodModel = require('../../../Commons/Transaction/JavaScript/Transaction.Paymentmethod.Model');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

const OrderWizardModulePaymentMethodInvoice: any = OrderWizardModulePaymentMethod.extend({
    template: order_wizard_paymentmethod_invoice_module_tpl,

    events: {
        'click [data-toggle="show-terms"]': 'showTerms'
    },

    errors: ['ERR_WS_INVALID_PAYMENT', 'ERR_CHK_INVOICE_CREDIT_LIMIT'],

    showTerms: function() {
        const self = this;
        const TermsView = BackboneView.extend({
            title: Utils.translate('Terms and Conditions'),
            render: function() {
                this.$el.html(
                    Utils.translate(
                        self.wizard.application.getConfig('checkoutApp.invoiceTermsAndConditions')
                    )
                );
                return this;
            }
        });

        this.wizard.application.getLayout().showInModal(new TermsView());
    },

    isActive: function(): boolean {
        const terms = (this.terms = this.getProfile().get('paymentterms'));
        return terms && terms.internalid;
    },

    getProfile: function() {
        return this.wizard.options.profile;
    },

    render: function() {
        if (this.isActive()) {
            return this._render();
        }
    },

    submit: function() {
        const self = this;

        return this.isValid().done(function() {
            self.paymentMethod = new TransactionPaymentmethodModel({
                type: 'invoice',
                terms: self.wizard.options.profile.get('paymentterms')
            });

            OrderWizardModulePaymentMethod.prototype.submit.apply(self);
        });
    },
    getContext: function() {
        return {
            // @property {String} termsName
            termsName: this.terms.name,
            // @property {Boolean} showTerms
            showTerms:
                this.wizard.application.getConfig(
                    'siteSettings.checkout.requiretermsandconditions'
                ) === 'T',
            // @property {String} balanceAvailable
            balanceAvailable: this.wizard.options.profile.get('balance_available_formatted') || ''
        };
    }
});

export = OrderWizardModulePaymentMethodInvoice;
