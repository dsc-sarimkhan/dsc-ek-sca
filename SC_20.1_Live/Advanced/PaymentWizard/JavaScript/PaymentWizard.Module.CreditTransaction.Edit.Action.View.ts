/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PaymentWizard.Module.CreditTransaction.Edit.Action.View"/>

import * as payment_wizard_credit_transaction_edit_action_tpl from 'payment_wizard_credit_transaction_edit_action.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class PaymentWizard.Module.CreditTransaction.Edit.Action.View @extend BackboneView
const PaymentWizardModuleCreditTransactionEditActionView: any = BackboneView.extend({
    template: payment_wizard_credit_transaction_edit_action_tpl,

    // @method getContext @return {PaymentWizard.Module.CreditTransaction.Edit.Action.View.Context}
    getContext: function() {
        // @class PaymentWizard.Module.CreditTransaction.Edit.Action.View.Context
        return {
            // @property {Boolean} showEditAction
            showEditAction: !!this.model.get('check')
        };
    }
});

export = PaymentWizardModuleCreditTransactionEditActionView;
