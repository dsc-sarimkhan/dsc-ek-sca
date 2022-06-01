/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PaymentWizard.Module.PaymentMethod.Selector"/>

import * as _ from 'underscore';
import '../../../Commons/Utilities/JavaScript/Utils';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import OrderWizardModulePaymentMethodSelector = require('../../OrderWizard.Module.PaymentMethod/JavaScript/OrderWizard.Module.PaymentMethod.Selector');

// @class PaymentWizard.Module.PaymentMethod.Creditcard @extend OrderWizard.Module.PaymentMethod.Creditcard
const PaymentWizardModulePaymentMethodSelector: any = OrderWizardModulePaymentMethodSelector.extend(
    {
        className: 'PaymentWizard.Module.PaymentMethod.Selector',

        render: function() {
            if (this.wizard.hidePayment()) {
                this.$el.empty();
            } else {
                OrderWizardModulePaymentMethodSelector.prototype.render.apply(this, arguments);
            }

            if (this.selectedModule && !!~this.selectedModule.type.indexOf('external_checkout')) {
                this.trigger(
                    'change_label_continue',
                    Utils.translate('Continue to External Payment')
                );
            } else {
                this.trigger('change_label_continue', Utils.translate('Submit'));
            }
        },

        initialize: function() {
            OrderWizardModulePaymentMethodSelector.prototype.initialize.apply(this, arguments);
            this.wizard.model.on('change:payment', jQuery.proxy(this, 'changeTotal'));
        },

        changeTotal: function() {
            const was = this.model.previous('payment');
            const was_confirmation = this.model.previous('confirmation');
            const is_confirmation = this.model.get('confirmation');
            const is = this.model.get('payment');

            // Changed from or to 0
            if (
                ((was === 0 && is !== 0) || (was !== 0 && is === 0)) &&
                !was_confirmation &&
                !is_confirmation
            ) {
                this.render();
            }
        },

        // @method submit If there's a payment, continue the payment method selection. Otherwise, resets the paymentmethods collection
        // @return {jQuery.Deferred}
        submit: function() {
            if (this.model.get('payment') !== 0) {
                return OrderWizardModulePaymentMethodSelector.prototype.submit.apply(
                    this,
                    arguments
                );
            }
            this.model.get('paymentmethods').reset([]);
            return jQuery.Deferred().resolve();
        }
    }
);

export = PaymentWizardModulePaymentMethodSelector;
