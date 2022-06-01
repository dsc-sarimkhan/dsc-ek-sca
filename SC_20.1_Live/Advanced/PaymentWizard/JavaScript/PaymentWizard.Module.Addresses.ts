/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PaymentWizard.Module.Addresses"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import OrderWizardModuleAddressBilling = require('../../OrderWizard.Module.Address/JavaScript/OrderWizard.Module.Address.Billing');

// @class PaymentWizard.Module.Addresses @extend OrderWizard.Module.Address.Billing
const PaymentWizardModuleAddresses: any = OrderWizardModuleAddressBilling.extend({
    itemsPerRow: Utils.isDesktopDevice() ? 3 : 2,

    className: 'PaymentWizard.Module.Addresses',

    initialize: function(options) {
        OrderWizardModuleAddressBilling.prototype.initialize.apply(this, arguments);
        this.wizard.model.on('change:payment', jQuery.proxy(this, 'changeTotal'));
        this.itemsPerRow = _.result(options, 'itemsPerRow') || this.itemsPerRow;
    },

    changeTotal: function() {
        const was = this.model.previous('payment');
        const was_confirmation = this.model.previous('confirmation');
        const is = this.model.get('payment');

        // Changed from or to 0
        if (((was === 0 && is !== 0) || (was !== 0 && is === 0)) && !was_confirmation) {
            this.render();
        }
    },

    getSelectedAddress: function() {
        if (!this.addressId && !this.unset) {
            const default_address = this.addresses.findWhere({
                defaultbilling: 'T'
            });

            this.addressId = default_address && default_address.id;

            if (this.addressId) {
                this.model.set(this.manage, this.addressId);
            }
        }

        return this.addresses.get(this.addressId) || this.getEmptyAddress();
    },

    unsetAddress: function() {
        this.unset = true;
        OrderWizardModuleAddressBilling.prototype.unsetAddress.apply(this, arguments);
    },

    isValid: function() {
        if (this.wizard.hidePayment()) {
            return jQuery.Deferred().resolve();
        }
        return OrderWizardModuleAddressBilling.prototype.isValid.apply(this, arguments);
    },

    isActive: function() {
        if (this.wizard.hidePayment()) {
            return false;
        }

        return OrderWizardModuleAddressBilling.prototype.isActive.apply(this, arguments);
    }
});

export = PaymentWizardModuleAddresses;
