/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PaymentWizard.Module.Confirmation"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as payment_wizard_confirmation_module_tpl from 'payment_wizard_confirmation_module.tpl';

import WizardModule = require('../../Wizard/JavaScript/Wizard.Module');

// @class PaymentWizard.Module.Confirmation @extend Wizard.Module
const PaymentWizardModuleConfirmation: any = WizardModule.extend({
    template: payment_wizard_confirmation_module_tpl,

    className: 'PaymentWizard.Module.Confirmation',

    future: function() {
        const { model } = this.wizard;

        if (model.get('confirmation')) {
            model.unset('confirmation', { silent: true });
        }
    },

    // @method getContext @return {PaymentWizard.Module.Confirmation.Context}
    getContext: function() {
        const confirmation = this.wizard.model.get('confirmation');
        const is_confirmation_created = !!(
            confirmation &&
            confirmation.internalid &&
            confirmation.internalid !== '0'
        );

        // @class PaymentWizard.Module.Confirmation.Context
        return {
            // @property {String} tranId
            tranId: confirmation ? confirmation.tranid : '',
            // @property {Boolean} isConfirmationCreated
            isConfirmationCreated: is_confirmation_created,
            // @property {Boolean} showLinkConfirmation
            showLinkConfirmation: is_confirmation_created,
            // @property {String} confirmationId
            confirmationId: confirmation ? confirmation.internalid : '',
            // @property {Boolean} isInvoiceLengthGreaterThan0, Keeping to be backward compatible
            isInvoiceLengthGreaterThan0: !!this.wizard.model.get('invoices').length,
            // @property {String} dwonloadPDFURL
            dwonloadPDFURL: is_confirmation_created
                ? Utils.getDownloadPdfUrl({
                      asset: 'customer-payment-details',
                      id: confirmation.internalid
                  })
                : ''
        };
    }
});

export = PaymentWizardModuleConfirmation;
