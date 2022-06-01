/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PaymentWizard.CreditTransaction.Model"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

function validateAmountRemaining(value, name, form) {
    if (isNaN(parseFloat(value))) {
        return Utils.translate('The amount to apply is not a valid number');
    }

    if (value <= 0) {
        return Utils.translate('The amount to apply has to be positive');
    }

    if (value > form.remaining) {
        return Utils.translate('The amount to apply cannot exceed the remaining amount');
    }

    if (form.orderTotal < 0) {
        return Utils.translate('The amount to apply cannot exceed the remaining payment total');
    }
}

// @class PaymentWizard.CreditTransaction.Model @extend Backbone.Model
const PaymentWizardCreditTransactionModel: any = Backbone.Model.extend({
    validation: {
        amount: {
            fn: validateAmountRemaining
        }
    },

    initialize: function() {
        if (!this.get('type')) {
            this.set('type', 'Deposit');
        }
    }
});

export = PaymentWizardCreditTransactionModel;
