/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Transaction.Paymentmethod.Collection"/>

import TransactionPaymentmethodModel = require('./Transaction.Paymentmethod.Model');
import Backbone = require('../../Utilities/JavaScript/backbone.custom');

const TransactionPaymentmethodCollection: any = Backbone.Collection.extend({
    // @property {Transaction.Paymentmethod.Model} model
    model: TransactionPaymentmethodModel
});

export = TransactionPaymentmethodCollection;
