/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Transaction.Line.Option.Collection"/>

import TransactionLineOptionModel = require('./Transaction.Line.Option.Model');
import ProductLineOptionCollection = require('../../ProductLine/JavaScript/ProductLine.Option.Collection');

const TransactionLineOptionCollection: any = ProductLineOptionCollection.extend({
    // @property {Transaction.Line.Model} model
    model: TransactionLineOptionModel
});

export = TransactionLineOptionCollection;
