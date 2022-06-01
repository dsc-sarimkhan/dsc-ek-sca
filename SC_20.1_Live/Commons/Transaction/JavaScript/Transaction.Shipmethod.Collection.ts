/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Transaction.Shipmethod.Collection"/>

import TransactionShipmethodModel = require('./Transaction.Shipmethod.Model');
import Backbone = require('../../Utilities/JavaScript/backbone.custom');

const TransactionShipmethodCollection: any = Backbone.Collection.extend({
    // @property {Transaction.Shipmethod.Model} model
    model: TransactionShipmethodModel,

    // @property {String} comparator
    comparator: 'name'
});

export = TransactionShipmethodCollection;
