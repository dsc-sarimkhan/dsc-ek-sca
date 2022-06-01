/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PaymentWizard.CreditTransaction.Collection"/>

import Model = require('./PaymentWizard.CreditTransaction.Model');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

// @class PaymentWizard.CreditTransaction.Collection @extend Backbone.Collection
const PaymentWizardCreditTransactionCollection: any = Backbone.Collection.extend({
    model: Model
});

export = PaymentWizardCreditTransactionCollection;
