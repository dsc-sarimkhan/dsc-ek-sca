/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderHistory.Line.Model"/>

import '../../../Commons/Utilities/JavaScript/Utils';

import TransactionLineModel = require('../../../Commons/Transaction/JavaScript/Transaction.Line.Model');

const OrderHistoryLineModel: any = TransactionLineModel.extend();

export = OrderHistoryLineModel;
