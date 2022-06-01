/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Invoice.Date.View"/>

import * as invoice_date_tpl from 'invoice_date.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class Invoice.Date.View @extends Backbone.View
const InvoiceDateView: any = BackboneView.extend({
    // @property {Function} template
    template: invoice_date_tpl,

    // @method getContext @returns {Invoice.Date.View.Context}
    getContext: function() {
        const payment = this.model.get('payment');
        // @class Invoice.Date.View.Context
        return {
            // @property {String} dueDate
            dueDate: this.model.get('dueDate') || '',
            // @property {Boolean} showOverdueFlag
            showOverdueFlag: !!this.model.get('isOverdue'),
            // @property {Boolean} showPartiallyPaid
            showPartiallyPaid: !!this.model.get('isPartiallyPaid'),
            // @property {Boolean} showUnapprovedPayment
            showUnapprovedPayment: payment && payment.status === 'unapprovedPayment'
        };
    }
});

export = InvoiceDateView;
