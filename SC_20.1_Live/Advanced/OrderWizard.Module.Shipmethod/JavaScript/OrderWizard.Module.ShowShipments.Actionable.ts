/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.ShowShipments.Actionable"/>

import * as order_wizard_showshipments_actionable_module_tpl from 'order_wizard_showshipments_actionable_module.tpl';

import OrderWizardModuleShowShipments = require('./OrderWizard.Module.ShowShipments');
import AddressDetailsView = require('../../../Commons/Address/JavaScript/Address.Details.View');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import TransactionLineViewsCellNavigableView = require('../../../Commons/Transaction.Line.Views/JavaScript/Transaction.Line.Views.Cell.Navigable.View');

// @class OrderWizard.Module.ShowShipments.Actionable @extends OrderWizard.Module.ShowShipments
export = OrderWizardModuleShowShipments.extend({
    // @property {Function} template
    template: order_wizard_showshipments_actionable_module_tpl,

    // @property {Object} childViews
    childViews: {
        'Shipping.Address': function() {
            return new AddressDetailsView({
                hideActions: true,
                hideDefaults: true,
                manage: 'shipaddress',
                model: this.profile.get('addresses').get(this.model.get('shipaddress')),
                hideSelector: true
            });
        },
        'Items.Collection': function() {
            return new BackboneCollectionView({
                collection: this.model.get('lines'),
                childView: TransactionLineViewsCellNavigableView,
                viewsPerRow: 1,
                childViewOptions: {
                    navigable: !this.options.hide_item_link
                }
            });
        }
    }
});
