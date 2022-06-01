/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Deposit.Model"/>

import TransactionModel = require('../../../Commons/Transaction/JavaScript/Transaction.Model');
import InvoiceCollection = require('../../Invoice/JavaScript/Invoice.Collection');

// @class Deposit.Model @extend Transaction.Model
const DepositModel: any = TransactionModel.extend({
    urlRoot: 'services/Deposit.Service.ss',

    // @property {Boolean} cacheSupport enable or disable the support for cache (Backbone.CachedModel)
    cacheSupport: true,

    initialize: function initialize(attributes) {
        TransactionModel.prototype.initialize.apply(this, arguments);

        this.on('change:invoices', function(model, invoices) {
            model.set('invoices', new InvoiceCollection(invoices), { silent: true });
        });

        this.trigger('change:invoices', this, (attributes && attributes.invoices) || []);
    }
});

export = DepositModel;
