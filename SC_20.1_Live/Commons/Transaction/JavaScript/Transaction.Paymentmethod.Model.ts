/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Transaction.Paymentmethod.Model"/>

import Backbone = require('../../Utilities/JavaScript/backbone.custom');

const TransactionPaymentmethodModel: any = Backbone.Model.extend({
    // @method getFormattedPaymentmethod Returns the current model's type
    // @return {String}
    getFormattedPaymentmethod: function() {
        return this.get('type');
    }
});

export = TransactionPaymentmethodModel;
