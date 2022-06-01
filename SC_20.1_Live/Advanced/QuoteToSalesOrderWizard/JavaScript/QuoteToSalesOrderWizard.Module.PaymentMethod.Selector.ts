/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="QuoteToSalesOrderWizard.Module.PaymentMethod.Selector"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import OrderWizardModulePaymentMethodSelector = require('../../OrderWizard.Module.PaymentMethod/JavaScript/OrderWizard.Module.PaymentMethod.Selector');

// @class PaymentWizard.Module.PaymentMethod.Creditcard @extend OrderWizard.Module.PaymentMethod.Creditcard
export = OrderWizardModulePaymentMethodSelector.extend({
    className: 'QuoteToSalesOrderWizard.Module.PaymentMethod.Selector',

    render: function() {
        if (this.wizard.hidePayment()) {
            this.$el.empty();
        } else {
            OrderWizardModulePaymentMethodSelector.prototype.render.apply(this, arguments);
        }

        if (this.selectedModule && !!~this.selectedModule.type.indexOf('external_checkout')) {
            this.trigger('change_label_continue', Utils.translate('Continue to External Payment'));
        } else {
            this.trigger('change_label_continue', Utils.translate('Submit'));
        }
    }
});
