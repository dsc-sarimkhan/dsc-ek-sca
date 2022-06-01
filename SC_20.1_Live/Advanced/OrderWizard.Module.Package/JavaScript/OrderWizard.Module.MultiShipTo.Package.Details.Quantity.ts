/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.MultiShipTo.Package.Details.Quantity"/>

import * as order_wizard_msr_package_details_quantity_tpl from 'order_wizard_msr_package_details_quantity.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class OrderWizard.Module.MultiShipTo.Package.Details.Quantity @extend Backbone.View
export = BackboneView.extend({
    template: order_wizard_msr_package_details_quantity_tpl,

    // @method getContext @return {OrderWizard.Module.MultiShipTo.Package.Details.Quantity.Context}
    getContext: function() {
        // @class OrderWizard.Module.MultiShipTo.Package.Details.Quantity.Context
        return {
            // @property {Number} lineQuantity
            lineQuantity: this.model.get('quantity'),
            // @property {String} lineTotalFormatted
            lineTotalFormatted: this.model.get('total_formatted'),
            // @property {String} lineAmountFormatted
            lineAmountFormatted: this.model.get('amount_formatted'),
            // @property {Boolean} isAmountGreaterThanTotal
            isAmountGreaterThanTotal: this.model.get('amount') > this.model.get('total')
        };
    }
});
