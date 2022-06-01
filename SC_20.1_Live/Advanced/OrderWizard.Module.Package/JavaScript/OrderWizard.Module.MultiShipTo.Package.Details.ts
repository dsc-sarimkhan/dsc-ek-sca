/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.MultiShipTo.Package.Details"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import * as order_wizard_msr_package_details_tpl from 'order_wizard_msr_package_details.tpl';

import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import TransactionLineViewsCellActionableView = require('../../../Commons/Transaction.Line.Views/JavaScript/Transaction.Line.Views.Cell.Actionable.View');
import WizardModule = require('../../Wizard/JavaScript//Wizard.Module');
import AddressDetailsView = require('../../../Commons/Address/JavaScript/Address.Details.View');
import OrderWizardModuleMultiShipToPackageDetailsQuantity = require('./OrderWizard.Module.MultiShipTo.Package.Details.Quantity');
import OrderWizardModuleMultiShipToPackageDetailsActions = require('./OrderWizard.Module.MultiShipTo.Package.Details.Actions');
import LiveOrderModel = require('../../../Commons/LiveOrder/JavaScript/LiveOrder.Model');

// @class OrderWizard.Module.MultiShipTo.Package.Details @extend Wizard.Module
export = WizardModule.extend({
    template: order_wizard_msr_package_details_tpl,

    initialize: function() {
        BackboneCompositeView.add(this);
    },

    childViews: {
        'Address.Details': function() {
            return new AddressDetailsView({
                model: this.model.get('address'),
                hideActions: true,
                hideDefaults: true,
                manage: 'shipaddress',
                hideSelector: true
            });
        },
        'Items.Collection': function() {
            return new BackboneCollectionView({
                childView: TransactionLineViewsCellActionableView,
                viewsPerRow: 1,
                collection: this.model.get('lines'),
                childViewOptions: {
                    navigable: false,
                    // ,	useLinePrice: true
                    application: this.options.application,
                    SummaryView: OrderWizardModuleMultiShipToPackageDetailsQuantity,
                    ActionsView: OrderWizardModuleMultiShipToPackageDetailsActions
                }
            });
        }
    },

    // @method getContext @return {OrderWizard.Module.MultiShipTo.Package.Details.Context}
    getContext: function() {
        const item_count = LiveOrderModel.countItems(this.model.get('lines'));

        // @class OrderWizard.Module.MultiShipTo.Package.Details.Context
        return {
            // @property {String} packageTitle
            packageTitle: this.model.get('packageTitle'),
            // @property {Boolean} totalItemsGreaterThan1
            itemCountGreaterThan1: item_count > 1,
            // @property {Number} totalItems
            itemCount: item_count,
            // @property {Boolean} isPackageExpanded
            isPackageExpanded: !!this.model.get('isPackageExpanded'),
            // @property {String} addressId
            addressId: this.model.get('address').id,
            // @property {String} addressName
            addressName: this.model.get('address').get('fullname'),
            // @property {String} address
            address: this.model.get('address').get('addr1')
        };
    }
});
