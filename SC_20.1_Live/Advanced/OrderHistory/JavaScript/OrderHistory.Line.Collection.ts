/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderHistory.Line.Collection"/>

import TransactionLineCollection = require('../../../Commons/Transaction/JavaScript/Transaction.Line.Collection');
import OrderHistoryLineModel = require('./OrderHistory.Line.Model');

const OrderHistoryLineCollection: any = TransactionLineCollection.extend({
    model: OrderHistoryLineModel
});

export = OrderHistoryLineCollection;
