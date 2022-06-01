/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderHistory.Payments.View"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as order_history_payments from 'order_history_payments.tpl';

import GlobalViewsFormatPaymentMethodView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.FormatPaymentMethod.View');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class OrderHistory.Payments.View @extend Backbone.View
const OrderHistoryPaymentsView: any = BackboneView.extend({
    // @property {Function} template
    template: order_history_payments,

    initialize: function(options) {
        this.application = options.application;
        this.index = options.index;
        this.is_basic = options.is_basic;
        this.recordtype = options.recordtype;
    },

    childViews: {
        FormatPaymentMethod: function() {
            if (this.model.get('paymentmethod')) {
                return new GlobalViewsFormatPaymentMethodView({
                    model: new Backbone.Model(this.model.get('paymentmethod'))
                });
            }
        }
    },

    // @method formatData @return TransactionModel
    formatData: function() {
        const is_invoice = this.recordtype === 'CustInvc' || this.recordtype === 'invoice';
        let hide_link: any = '';
        let link = '';
        const recordtype = this.model.get('recordtype');

        switch (recordtype) {
            case 'cashsale':
                hide_link = this.is_basic && is_invoice;
                link = is_invoice
                    ? this.is_basic
                        ? undefined
                        : 'invoices/' + this.model.get('internalid')
                    : (link = this.is_basic
                          ? undefined
                          : '/receiptshistory/view/' + this.model.get('internalid'));
                this.model.set('dataType', is_invoice && !this.is_basic ? 'invoice' : 'receipt');
                this.model.set(
                    'paymentLabel',
                    is_invoice ? Utils.translate('Invoice') : Utils.translate('Receipt')
                );
                break;
            case 'customerpayment':
                hide_link = this.is_basic;
                link = this.is_basic
                    ? undefined
                    : '/transactionhistory/' + recordtype + '/' + this.model.get('internalid');
                this.model.set('paymentLabel', Utils.translate('Payment'));
                break;
        }

        this.model.get('appliedtoforeignamount_formatted')
            ? false
            : this.model.set(
                  'appliedtoforeignamount_formatted',
                  this.model.get('amount_formatted')
              );
        this.model.set('showLink', !hide_link);
        this.model.set('link', link);

        return this.model;
    },

    // @method getContext @return OrderHistory.Payments.View
    getContext: function() {
        // @class OrderHistory.Payments.View.Context
        return {
            model: this.formatData(),

            isPair: this.index === 0 || this.index % 2 === 0,

            firstChild: this.index === 0
        };
    }
});

export = OrderHistoryPaymentsView;
