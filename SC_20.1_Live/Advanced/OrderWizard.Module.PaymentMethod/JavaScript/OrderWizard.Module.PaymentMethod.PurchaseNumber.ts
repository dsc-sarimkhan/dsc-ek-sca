/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.PaymentMethod.PurchaseNumber"/>

import * as order_wizard_paymentmethod_purchasenumber_module_tpl from 'order_wizard_paymentmethod_purchasenumber_module.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import WizardModule = require('../../Wizard/JavaScript/Wizard.Module');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');

const OrderWizardModulePaymentMethodPurchaseNumber: any = WizardModule.extend({
    // @property {Function} template
    template: order_wizard_paymentmethod_purchasenumber_module_tpl,

    // @property {String} className
    className: 'OrderWizard.Module.PaymentMethod.PurchaseNumber',

    isActive: function(): boolean {
        return Configuration.get('siteSettings.checkout.showpofieldonpayment', 'T') === 'T';
    },

    submit: function() {
        const purchase_order_number = this.$('[name=purchase-order-number]').val() || '';
        this.wizard.model.set('purchasenumber', purchase_order_number);
        return jQuery.Deferred().resolve();
    },

    // @method getContext
    // @returns {OrderWizard.Module.PaymentMethod.Creditcard.Context}
    getContext: function() {
        return {
            // @property {String} purchaseNumber
            purchaseNumber: this.wizard.model.get('purchasenumber')
        };
    }
});

export = OrderWizardModulePaymentMethodPurchaseNumber;
