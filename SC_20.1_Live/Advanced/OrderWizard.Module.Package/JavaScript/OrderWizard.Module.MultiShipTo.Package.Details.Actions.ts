/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.MultiShipTo.Package.Details.Actions"/>

import * as order_wizard_msr_package_details_actions_tpl from 'order_wizard_msr_package_details_actions.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class OrderWizard.Module.MultiShipTo.Package.Details.Quantity @extend Backbone.View
export = BackboneView.extend({
    template: order_wizard_msr_package_details_actions_tpl,

    // @method getContext @return {OrderWizard.Module.MultiShipTo.Package.Details.Actions.Context}
    getContext: function() {
        // @class OrderWizard.Module.MultiShipTo.Package.Details.Actions.Context
        return {
            // @property {String} lineId
            lineId: this.model.id
        };
    }
});
