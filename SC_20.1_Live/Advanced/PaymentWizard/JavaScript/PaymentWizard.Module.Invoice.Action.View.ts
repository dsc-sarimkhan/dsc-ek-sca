/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PaymentWizard.Module.Invoice.Action.View"/>

import * as payment_wizard_invoice_action_tpl from 'payment_wizard_invoice_action.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class PaymentWizard.Module.Invoice.Action.View @extend BackboneView
const PaymentWizardModuleInvoiceActionView: any = BackboneView.extend({
    template: payment_wizard_invoice_action_tpl,

    // @method getContext @return {PaymentWizard.Module.Invoice.Action.View.Context}
    getContext: function() {
        // @class PaymentWizard.Module.Invoice.Action.View.Context
        return {
            // @property {Boolean} isPayfull
            isPayfull: !!this.model.get('isPayFull'),
            // @property {Boolean} showAction
            showAction: !!this.model.get('check')
        };
    }
});

export = PaymentWizardModuleInvoiceActionView;
