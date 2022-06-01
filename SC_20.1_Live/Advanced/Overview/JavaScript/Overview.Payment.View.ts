/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Overview.Payment.View"/>
// Overview.Payment.View.js
// -----------------------

import * as overview_payment_tpl from 'overview_payment.tpl';

import PaymentMethodHelper = require('../../PaymentMethod/JavaScript/PaymentMethod.Helper');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// home page view
const OverviewPaymentView: any = BackboneView.extend({
    template: overview_payment_tpl,

    initialize: function() {},

    childViews: {
        'CreditCard.View': function() {
            const view = PaymentMethodHelper.getCreditCardView();
            return new view({
                model: this.model,
                hideSelector: true
            });
        }
    },

    // @method getContext @returns {Overview.Payment.View.Context}
    getContext: function() {
        // @class Overview.Payment.View.Context
        return {
            // @property {Boolean} hasDefaultCreditCard
            hasDefaultCreditCard: !!this.model,
            // @property {String} creditCardInternalid
            creditCardInternalid: this.model && this.model.get('internalid')
        };
    }
});

export = OverviewPaymentView;
