/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="TransactionHistory.Model"/>
// @module TransactionHistory

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import TransactionModel = require('../../../Commons/Transaction/JavaScript/Transaction.Model');

const TransactionHistoryModel: any = TransactionModel.extend({
    urlRoot: Utils.getAbsoluteUrl('SC/TransactionHistory/TransactionHistory.ss', true),
    // @property {Boolean} cacheSupport enable or disable the support for cache (Backbone.CachedModel)
    cacheSupport: true,
    // @method getTypeLabel @return {String}
    getTypeLabel: function() {
        let type;

        const recordtype = this.get('recordtype');
        if (recordtype === 'creditmemo') {
            type = Utils.translate('Credit Memo');
        } else if (recordtype === 'customerpayment') {
            type = Utils.translate('Payment');
        } else if (recordtype === 'customerdeposit') {
            type = Utils.translate('Deposit');
        } else if (recordtype === 'depositapplication') {
            type = Utils.translate('Deposit Application');
        } else if (recordtype === 'invoice') {
            type = Utils.translate('Invoice');
        } else if (recordtype === 'cashsale') {
            type = Utils.translate('Cash Receipt');
        }

        return type;
    },

    // @method getTypeUrl @return {String}
    getTypeUrl: function() {
        const type = this.get('recordtype');
        let record_root_url = 'transactionhistory/' + type;

        if (type === 'invoice') {
            record_root_url = 'transactionhistory/invoices';
        } else if (type === 'returnauthorization') {
            record_root_url = 'returns';
        }

        return record_root_url + '/' + this.get('internalid');
    }
});

export = TransactionHistoryModel;
