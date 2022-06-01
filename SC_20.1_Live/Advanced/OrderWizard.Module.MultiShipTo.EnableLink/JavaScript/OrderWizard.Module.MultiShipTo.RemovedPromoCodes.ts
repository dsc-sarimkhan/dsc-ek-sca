/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.MultiShipTo.RemovedPromoCodes"/>

import * as order_wizard_msr_removed_promocodes_tpl from 'order_wizard_msr_removed_promocodes.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class OrderWizard.Module.MultiShipTo.RemovedPromoCodes @extend Backbone.View

export = BackboneView.extend({
    // @property {Function} template
    template: order_wizard_msr_removed_promocodes_tpl,

    // @method getContet
    // @return {OrderWizard.Module.MultiShipTo.RemovedPromoCodes.Context}
    getContext: function getContext() {
        // @class OrderWizard.Module.MultiShipTo.RemovedPromoCodes.Context
        return {
            invalidPromocodes: this.options.invalidPromocodes
        };
        // @class OrderWizard.Module.MultiShipTo.RemovedPromoCodes
    }
});
