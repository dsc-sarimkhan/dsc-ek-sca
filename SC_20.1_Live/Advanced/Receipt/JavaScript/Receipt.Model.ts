/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Receipt.Model"/>

import TransactionModel = require('../../../Commons/Transaction/JavaScript/Transaction.Model');

// @class Receipt.Model Model for showing information about past receipts
const ReceiptModel: any = TransactionModel.extend({
    urlRoot: 'services/Receipt.Service.ss',
    // @property {Boolean} cacheSupport enable or disable the support for cache (Backbone.CachedModel)
    cacheSupport: true
});

export = ReceiptModel;
