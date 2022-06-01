/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Balance.View"/>
// @module Balance.View

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as balance_tpl from 'balance.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import LivePaymentModel = require('../../LivePayment/JavaScript/LivePayment.Model');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

const BalanceView: any = BackboneView.extend({
    template: balance_tpl,
    attributes: {
        id: 'AccountBalance',
        class: 'AccountBalance'
    },
    initialize: function(options) {
        this.application = options.application;
        this.model = ProfileModel.getInstance();
        this.livePaymentModel = LivePaymentModel.getInstance();

        this.title = Utils.translate('Account Balance');
    },
    updateLivePayment: function() {
        if (this.model && this.model.get('currency')) {
            const promise = jQuery.Deferred();

            this.livePaymentModel
                .fetch({
                    data: { cur: this.model.get('currency').internalid }
                })
                .always(function() {
                    promise.resolve();
                });

            return promise;
        }
        // If there is not currency, do not fetch the livepayment. Instead, return an empty solved promise
        return jQuery.Deferred().resolve();
    },
    getSelectedMenu: function() {
        return 'balance';
    },
    getBreadcrumbPages: function() {
        return {
            text: this.title,
            href: '/balance'
        };
    },
    // @method getContext @return {Balance.View.Context}
    getContext: function() {
        const live_payment = this.livePaymentModel;
        const percentage = Math.min(
            (this.model.get('balance') * 100) / this.model.get('creditlimit'),
            100
        );

        // @class Balance.View.Context
        return {
            // @property {Profile.Model} model
            model: this.model,
            // @property {Boolean} showCompany
            showCompany: !!this.model.get('companyname'),
            // @property {String} company
            company: this.model.get('companyname'),
            // @property {Number} percentage
            percentage: percentage,
            // @property {Boolean} isPercentageGreaterThan8
            isPercentageGreaterThan8: percentage > 8,
            // @property {Boolean} isPercentageLowertThan92
            isPercentageLowertThan92: percentage < 92,
            // @property {String} balanceFormatted
            balanceFormatted: this.model.get('balance_formatted'),
            // @property {String} balanceAvailableFormatted
            balanceAvailableFormatted: this.model.get('balance_available_formatted'),
            // @property {String} creditLimitFormatted
            creditLimitFormatted: this.model.get('creditlimit_formatted'),
            // @property {String} depositsRemainingFormatted
            depositsRemainingFormatted: live_payment.get('depositsremaining_formatted') || 'N/A',
            // @property {String} creditMemosRemainingFormatted
            creditMemosRemainingFormatted:
                live_payment.get('creditmemosremaining_formatted') || 'N/A',
            // @property {String} paymentTermsName
            paymentTermsName:
                (this.model.get('paymentterms') && this.model.get('paymentterms').name) || 'N/A',
            // @property {String} shopperCurrencyCode
            shopperCurrencyCode: Configuration.get('siteSettings.shopperCurrency.code'),
            // @property {Boolean} livePaymentHaveInvoices
            livePaymentHaveInvoices: !!live_payment.get('invoices').length,
            // @property {Boolean} showBackToAccount
            showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD'
        };
    }
});

export = BalanceView;
