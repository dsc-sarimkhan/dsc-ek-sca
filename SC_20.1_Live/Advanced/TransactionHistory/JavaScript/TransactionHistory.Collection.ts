/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="TransactionHistory.Collection"/>
// @module TransactionHistory

import Model = require('./TransactionHistory.Model');
import TransactionCollection = require('../../../Commons/Transaction/JavaScript/Transaction.Collection');
import Utils = require('../../../Commons/Utilities/JavaScript/Utils');

const TransactionHistoryCollection: any = TransactionCollection.extend({
    model: Model,

    // @property {Boolean} cacheSupport enable or disable the
    // support for cache (Backbone.CachedModel)
    cacheSupport: false,

    url: Utils.getAbsoluteUrl('SC/TransactionHistory/TransactionHistory.ss', true)
});

export = TransactionHistoryCollection;
