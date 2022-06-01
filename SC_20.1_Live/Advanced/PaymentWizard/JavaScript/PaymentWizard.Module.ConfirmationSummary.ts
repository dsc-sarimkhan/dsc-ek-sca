/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PaymentWizard.Module.ConfirmationSummary"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as payment_wizard_confirmation_summary_module_tpl from 'payment_wizard_confirmation_summary_module.tpl';

import WizardModule = require('../../Wizard/JavaScript/Wizard.Module');

// @class PaymentWizard.Module.ConfirmationSummary @extend Wizard.Module
const PaymentWizardModuleConfirmationSummary: any = WizardModule.extend({
    template: payment_wizard_confirmation_summary_module_tpl,

    className: 'PaymentWizard.Module.ConfirmationSummary',

    // @method getContext @return {PaymentWizard.Module.ConfirmationSummary.Context}
    getContext: function() {
        const is_confirmation_created = !!this.model.get('confirmation');
        const model = is_confirmation_created ? this.model.get('confirmation') : {};
        const selectedInvoicesLength = _.filter(model.invoices, function(obj: any) {
            return obj.apply === true;
        }).length;

        // @class PaymentWizard.Module.ConfirmationSummary.Context
        return {
            // @property {Number} selectedInvoicesLength
            selectedInvoicesLength: is_confirmation_created ? selectedInvoicesLength : 0,
            // @property {String} invoiceTotalFormatted
            invoiceTotalFormatted: model.invoices_total_formatted,
            // @property {String} paymentFormatted
            paymentFormatted: model.payment_formatted,
            // @property {String} depositTotalFormatted
            depositTotalFormatted: model.deposits_total_formatted,
            // @property {Boolean} hasDeposit
            hasDeposit: !!model.deposits_total,
            // @property {Boolean} hasCredit
            hasCredit: !!model.creditTotal,
            // @property {String} creditTotalFormatted
            creditTotalFormatted: model.credits_total_formatted,
            // @property {Boolean} showTotalLabel
            showTotalLabel: !!this.options.total_label,
            // @property {String} totalLabel
            totalLabel: this.options.total_label
                ? this.options.total_label
                : Utils.translate('Estimated payment')
        };
    }
});

export = PaymentWizardModuleConfirmationSummary;
