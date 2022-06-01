/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Invoice.Model"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import TransactionCollection = require('../../../Commons/Transaction/JavaScript/Transaction.Collection');
import TransactionModel = require('../../../Commons/Transaction/JavaScript/Transaction.Model');

function validatePayment(value): string {
    value = parseFloat((value + '').replace(',', '.'));

    if (isNaN(value)) {
        return Utils.translate('The amount to pay is not a valid number');
    }
    if (value <= 0) {
        return Utils.translate('The amount to apply has to be positive');
    }
    /* jshint validthis:true */
    if (value > this.get('due')) {
        return Utils.translate('The amount to pay cannot exceed the remaining');
    }
}

// @class Invoice.Model @extends Backbone.Model
const InvoiceModel: any = TransactionModel.extend({
    // @property {String} urlRoot
    urlRoot: 'services/Invoice.Service.ss',

    // @property {Object} validation
    validation: {
        amount: { fn: validatePayment }
    },

    // @property {Boolean} cacheSupport enable or disable the support for cache (Backbone.CachedModel)
    cacheSupport: true,

    // @method initialize
    initialize: function(attributes): void {
        // call the initialize of the parent object, equivalent to super()
        TransactionModel.prototype.initialize.apply(this, arguments);

        this.on('change:adjustments', function(model, adjustments) {
            model.set('adjustments', new TransactionCollection(adjustments), { silent: true });
        });
        this.trigger('change:adjustments', this, (attributes && attributes.adjustments) || []);
    },

    // @method isPayFull
    isPayFull: function(): boolean {
        if (this.get('discountapplies')) {
            return this.get('amount') === this.get('duewithdiscount');
        }
        return this.get('amount') === this.get('due');
    }
});

export = InvoiceModel;
