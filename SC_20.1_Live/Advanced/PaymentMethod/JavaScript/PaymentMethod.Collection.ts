/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PaymentMethod.Collection"/>

import Model = require('../../../Commons/PaymentInstrument/JavaScript/PaymentInstrument.CreditCard.Model');

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

// @class PaymentMethod.Collection Credit cards collection @extends Backbone.Collection
const PaymentMethodCollection: any = Backbone.Collection.extend({
    model: Model,

    url: 'services/PaymentMethod.Service.ss',

    comparator: function(model) {
        return model.get('isdefault') !== 'T'; // ? 0 : 1;
    },

    // @method getCollectionForRendering Get the payment methods collection including new payment method button for rendering
    getCollectionForRendering: function() {
        let cloned_collection;

        if (this && !!this.length) {
            cloned_collection = this.clone();

            const new_payment_method = this.first().clone();
            new_payment_method.set('internalid', '-1');

            cloned_collection.models.push(new_payment_method);
        }

        return cloned_collection;
    }
});

export = PaymentMethodCollection;
