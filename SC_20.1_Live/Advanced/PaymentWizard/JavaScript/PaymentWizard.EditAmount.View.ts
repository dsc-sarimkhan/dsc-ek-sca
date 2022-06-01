/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PaymentWizard.EditAmount.View"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import * as payment_wizard_edit_amount_layout_tpl from 'payment_wizard_edit_amount_layout.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import BackboneFormView = require('../../../Commons/Backbone.FormView/JavaScript/Backbone.FormView');
import Handlebars = require('../../../Commons/Utilities/JavaScript/Handlebars');

// @class OrderWizard.EditDeposit.View @extend BackboneView
const PaymentWizardEditAmountView: any = BackboneView.extend({
    template: payment_wizard_edit_amount_layout_tpl,

    events: {
        'submit [data-action="edit-amount-form"]': 'modifyAmount',
        'change [data-action="edit-amount"]': 'changedAmount'
    },

    bindings: {
        '[name="amount"]': 'amount'
    },

    initialize: function(options) {
        this.parentView = options.parentView;
        this.model = options.model;
        this.type = options.type;
        this.selectedInvoicesLength = options.selectedInvoicesLength;
        this.invoicesTotal = options.invoicesTotal;

        if (options.model) {
            this.currency = options.model.currency;
        }

        this.getInvoiceSymbolCurrency();

        if (this.type === 'invoice') {
            this.original_amount_attribute = 'total';
            this.amount_due_attribute = 'due';
            this.input_label = Utils.translate('Amount to Pay');
            this.original_amount_label = Utils.translate('Original Amount');
            this.amount_due_label = Utils.translate('Amount Due');
            this.page_header = Utils.translate('Invoice #$(0)', this.model.get('tranid'));
            this.title = Utils.translate(
                'Amount to pay for invoice #$(0)',
                this.model.get('tranid')
            );
        } else if (this.type === 'deposit') {
            this.input_label = Utils.translate('Amount to apply');
            this.original_amount_label = Utils.translate('Remaining amount');
            this.original_amount_attribute = 'remaining';
            this.page_header = Utils.translate('Deposit #$(0)', this.model.get('refnum'));
            this.title = Utils.translate(
                'Amount to apply for deposit #$(0)',
                this.model.get('refnum')
            );
        } else if (this.type === 'credit') {
            this.input_label = Utils.translate('Amount to apply');
            this.original_amount_attribute = 'remaining';
            this.original_amount_label = Utils.translate('Remaining amount');
            this.page_header = Utils.translate(
                '$(0) #$(1)',
                this.model.get('type'),
                this.model.get('refnum')
            );
            this.title = Utils.translate(
                'Amount to apply for credit #$(0)',
                this.model.get('refnum')
            );
        }

        this.page_header = new Handlebars.SafeString(
            '<b>' + this.page_header.toUpperCase() + '</b>'
        );
        this.clonedModel = BackboneFormView.add(this);
    },

    getInvoiceSymbolCurrency: function() {
        const currency = Utils.getCurrencyByName(this.currency);
        if (currency) {
            this.currencySymbol = currency.symbol;
        }
    },

    _getOriginalDiscountAmount: function _getOriginalDiscountAmount() {
        !this.model.get('original_discamt') &&
            this.model.set('original_discamt', this.model.get('discamt'));

        return this.model.get('original_discamt');
    },

    _getOriginalTransactionAmount: function _getOriginalTransactionAmount() {
        !this.model.get('original_amount') &&
            this.model.set('original_amount', this.model.get('amount'));

        return this.model.get('original_amount');
    },

    changedAmount: function changedAmount(e) {
        const amount_to_pay_str = (<any>jQuery(e.target).val() || '').replace(',', '.');
        const amount_to_pay = parseFloat(amount_to_pay_str);

        if (this.model.get('discountapplies') && !isNaN(amount_to_pay)) {
            const original_discount_ammount = this._getOriginalDiscountAmount();
            const original_amount = this._getOriginalTransactionAmount();
            const new_discount_amount =
                (amount_to_pay * original_discount_ammount) / original_amount;
            const new_discount_amount_formatted = Utils.formatCurrency(
                new_discount_amount,
                this.currencySymbol
            );

            this.model.set('discamt', new_discount_amount);
            this.model.set('discamt_formatted', new_discount_amount_formatted);

            this.$('[data-type="applied-discount-ammount"]').text(new_discount_amount_formatted);
            this.$('[data-type="specified-payment-ammount"]').text(
                Utils.formatCurrency(amount_to_pay, this.currencySymbol)
            );
        }
    },

    modifyAmount: function(e) {
        const { model } = this;
        const original_amount = model.get('amount');
        let new_amount = parseFloat(this.$('[data-action="edit-amount"]').val());
        const wizard_model = this.parentView.wizard.model;
        const original_total = model.get('orderTotal') || wizard_model.calculeTotal(true);

        e.preventDefault();

        if (model.get('discountapplies') && new_amount === model.get('due')) {
            new_amount = model.get('duewithdiscount');
        }

        model.set('amount', new_amount).set('orderTotal', wizard_model.calculeTotal(true));

        this.clonedModel.validate();

        if (this.clonedModel.isValid()) {
            model.set('amount_formatted', Utils.formatCurrency(new_amount, this.currencySymbol));

            if (this.type === 'invoice') {
                wizard_model.distributeCredits();
            } else {
                wizard_model.calculeTotal();
            }

            this.$containerModal &&
                this.$containerModal
                    .removeClass('fade')
                    .modal('hide')
                    .data('bs.modal', null);
            this.destroy();
        } else {
            model.set({
                amount: original_amount,
                orderTotal: original_total
            });
        }
    },

    // @method getContext @return {OrderWizard.EditDeposit.View.Context}
    getContext: function() {
        // @class OrderWizard.EditDeposit.View.Context
        return {
            // @property {String} originalAmountLabel
            originalAmountLabel: this.original_amount_label,
            // @property {String} originalAmountFormatted
            originalAmountFormatted: this.model.get(this.original_amount_attribute + '_formatted'),
            // @property {Boolean} showAmountDue
            showAmountDue: !!this.amount_due_label,
            // @property {String} amountDueLabel
            amountDueLabel: this.amount_due_label,
            // @property {String} amountDueFormatted
            amountDueFormatted: this.model.get(this.amount_due_attribute + '_formatted'),
            // @property {Boolean} showSelectedInvoicesLength
            showSelectedInvoicesLength: !!this.selectedInvoicesLength,
            // @property {Number} selectedInvoicesLength
            selectedInvoicesLength: this.selectedInvoicesLength,
            // @property {String} invoiceTotalFormatted
            invoiceTotalFormatted: Utils.formatCurrency(this.invoicesTotal, this.currencySymbol),
            // @property {String} inputLabel
            inputLabel: this.input_label,
            // @property {Number} inputValue
            inputValue:
                this.model.get('discountapplies') && this.model.isPayFull()
                    ? this.model.get('due')
                    : this.model.get('amount'),
            // @property {String} currencySymbol
            currencySymbol: this.currencySymbol,
            // @property {Boolean} showDiscountApplied
            showDiscountApplied: !!this.model.get('discountapplies'),
            // @property {String} discountFormatted
            discountFormatted: this.model.get('discount_formatted'),
            // @property {String} discountAmountFormatted
            discountAmountFormatted: this.model.get('discamt_formatted'),
            // @property {String} dueWithDiscountFormatted
            dueWithDiscountFormatted: this.model.get('duewithdiscount_formatted')
        };
    }
});

export = PaymentWizardEditAmountView;
