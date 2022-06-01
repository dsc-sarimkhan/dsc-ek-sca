/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PaymentWizard.Module.CreditTransaction"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as payment_wizard_credit_transaction_module_tpl from 'payment_wizard_credit_transaction_module.tpl';

import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import WizardModule = require('../../Wizard/JavaScript/Wizard.Module');
import EditAmountView = require('./PaymentWizard.EditAmount.View');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import RecordViewsSelectableActionableView = require('../../RecordViews/JavaScript/RecordViews.Selectable.View');
import PaymentWizardModuleCreditTransactionEditActionView = require('./PaymentWizard.Module.CreditTransaction.Edit.Action.View');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import LivePaymentModel = require('../../LivePayment/JavaScript/LivePayment.Model');

// @class PaymentWizard.Module.CreditTransaction @extend Wizard.Module
const PaymentWizardModuleCreditTransaction: any = WizardModule.extend({
    template: payment_wizard_credit_transaction_module_tpl,

    className: 'PaymentWizard.Module.CreditTransaction',

    events: {
        'click [data-action="transaction"]': 'toggleTransactionHandler',
        'click [data-action="edit"]': 'editTransaction'
    },

    initialize: function(options) {
        this.transaction_type = options.transaction_type;
        this.wizard = options.wizard;
        this.livePaymentModel = LivePaymentModel.getInstance();
        this.application = this.wizard.application;
        this.addEventListeners();

        BackboneCompositeView.add(this);
    },

    isActive: function() {
        const has_elements = !!this.wizard.model.get(
            this.transaction_type === 'credit' ? 'credits' : 'deposits'
        ).length;

        if (this.transaction_type === 'deposit') {
            return has_elements && SC.ENVIRONMENT.permissions.transactions.tranDepAppl >= 2;
        }

        return has_elements;
    },

    render: function() {
        this.collection = this.wizard.model.get(
            this.transaction_type === 'credit' ? 'credits' : 'deposits'
        );
        this._render();
    },

    addEventListeners: function() {
        const self = this;

        this.wizard.model.on('change:credits_total', function() {
            self.render();
        });
        this.wizard.model.on('change:deposits_total', function() {
            self.render();
        });
    },

    toggleTransactionHandler: function(e) {
        const $target = jQuery(e.currentTarget);

        if ($target.hasClass('disabled')) {
            return;
        }
        this.toggleTransaction($target.closest('[data-action="transaction"]').data('id'));
    },

    toggleTransaction: function(transaction_id) {
        const transaction = this.collection.get(transaction_id);

        if (transaction) {
            this[transaction.get('apply') ? 'unselectTransaction' : 'selectTransaction'](
                transaction
            );
            this.render();
        }
    },

    selectTransaction: function(transaction) {
        if (transaction) {
            transaction.set('checked', true);
        }

        if (this.transaction_type === 'credit') {
            return this.livePaymentModel.selectCredit(transaction.id);
        }
        return this.livePaymentModel.selectDeposit(transaction.id);
    },

    unselectTransaction: function(transaction) {
        if (transaction) {
            transaction.set('checked', false);
        }

        if (this.transaction_type === 'credit') {
            return this.livePaymentModel.unselectCredit(transaction.id);
        }
        return this.livePaymentModel.unselectDeposit(transaction.id);
    },

    editTransaction: function(e) {
        const transaction_id = jQuery(e.target)
            .parents('[data-action="transaction"]')
            .data('id');
        const transaction = this.collection.get(transaction_id);

        e.preventDefault();
        e.stopPropagation();

        this.application.getLayout().showInModal(
            new EditAmountView({
                application: this.application,
                parentView: this,
                model: transaction,
                type: this.transaction_type,
                selectedInvoicesLength: this.wizard.model.getSelectedInvoices().length,
                invoicesTotal: this.wizard.model.get('invoices_total')
            }),
            { application: this.application }
        );
    },

    childViews: {
        'Transaction.Collection': function() {
            const positive_total = this.wizard.model.calculeTotal(true) > 0;

            const transactions_to_show = this.collection.map(function(transaction) {
                const is_checked = transaction.get('apply');

                return new Backbone.Model({
                    internalid: transaction.id,
                    check: is_checked,
                    active: is_checked || positive_total,
                    navigable: false,

                    url: '',
                    title: (transaction.get('type') || '') + '#' + transaction.get('refnum'),

                    actionType: 'transaction',

                    columns: [
                        {
                            label: Utils.translate('Original Amount:'),
                            type: 'currency',
                            name: 'original-amount',
                            value:
                                transaction.get('remaining_formatted') !==
                                transaction.get('total_formatted')
                                    ? transaction.get('total_formatted')
                                    : ' '
                        },
                        {
                            label: Utils.translate('Remaining Amount:'),
                            type: 'currency',
                            name: 'remaining-amount',
                            value: transaction.get('remaining_formatted')
                        },
                        {
                            label: Utils.translate('Amount'),
                            type: 'currency',
                            name: 'amount',
                            value: transaction.get('amount_formatted')
                        }
                    ]
                });
            });

            return new BackboneCollectionView({
                childView: RecordViewsSelectableActionableView,
                viewsPerRow: 1,
                collection: transactions_to_show,
                childViewOptions: {
                    actionView: PaymentWizardModuleCreditTransactionEditActionView
                }
            });
        }
    },

    // @method getContext @return {PaymentWizard.Module.CreditTransaction.Context}
    getContext: function() {
        // @class PaymentWizard.Module.CreditTransaction.Context
        return {
            // @property {String} accordionId
            accordionId: 'accordion-' + this.cid,
            // @property {Boolean} isTransactionTypeCredit
            isTransactionTypeCredit: this.transaction_type === 'credit',
            // @property {Number} collectionLength
            collectionLength: this.collection.length,
            // @property {Boolean} areElementsCollapsed
            areElementsCollapsed: !!Configuration.get('sca.collapseElements'),
            // @property {String} totalFormatted
            totalFormatted: this.wizard.model.get(
                this.transaction_type === 'credit'
                    ? 'credits_total_formatted'
                    : 'deposits_total_formatted'
            )
        };
    }
});

export = PaymentWizardModuleCreditTransaction;
