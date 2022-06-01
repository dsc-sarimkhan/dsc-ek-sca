/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PaymentMethod.Model"/>

import '../../../Commons/Utilities/JavaScript/Utils';

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

// @class PaymentMethod.Model responsible of implement the REST model of a credit card and of validating
// the credit card properties @extends Backbone.Model
const PaymentMethodModel: any = Backbone.Model.extend({
    // @property {String} urlRoot
    urlRoot: 'services/PaymentMethod.Service.ss',

    // @method initialize
    initialize: function(attributes, options) {
        this.options = options;

        this.set('isdefault', this.get('isdefault') || this.get('ccdefault'));

        if (this.get('isdefault') === true) {
            this.set('isdefault', 'T');
        }

        if (!this.get('internalid')) {
            this.set('internalid', this.get('id'));
        }
    }
});

export = PaymentMethodModel;
