/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.CartItems.PickupInStore.Package.View"/>

import '../../SCA/JavaScript/SC.Configuration';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as order_wizard_cartitems_module_pickup_in_store_package_tpl from 'order_wizard_cartitems_module_pickup_in_store_package.tpl';

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import Location = require('../../Location.SCA/JavaScript/Location');
import LocationVenueDetailsView = require('../../Location.SCA/JavaScript/Location.VenueDetails.View');
import TransactionLineViewsCellNavigableView = require('../../../Commons/Transaction.Line.Views/JavaScript/Transaction.Line.Views.Cell.Navigable.View');
import LiveOrderModel = require('../../../Commons/LiveOrder/JavaScript/LiveOrder.Model');

// @class OrderWizard.Module.CartItems.PickupInStore.Package @extends Backbone.View
export = BackboneView.extend({
    // @property {Function} template
    template: order_wizard_cartitems_module_pickup_in_store_package_tpl,

    initialize: function(options) {
        this.model = options.model;
        this.application = options.application;
        this.lines = options.model.get('lines');
        this.location = this.lines[0].get('location');

        const self = this;

        if (!this.location.get('name')) {
            Location.fetchLocations(this.location.get('internalid')).done(function() {
                self.location = new Backbone.Model(Location.get(self.location.get('internalid')));

                self.render();
            });
        }

        BackboneCompositeView.add(this);
    },

    // @property {Object} childViews
    childViews: {
        'Items.Collection': function() {
            return new BackboneCollectionView({
                collection: this.lines,
                childView: TransactionLineViewsCellNavigableView,
                viewsPerRow: 1,
                childViewOptions: {
                    navigable: false,

                    detail1Title: Utils.translate('Qty:'),
                    detail1: 'quantity',

                    detail2Title: Utils.translate('Unit price:'),
                    detail2: 'rate_formatted',

                    detail3Title: Utils.translate('Amount:'),
                    detail3: 'total_formatted'
                }
            });
        },

        'PickupInStore.StoreLocationInfo': function() {
            return new LocationVenueDetailsView({
                model: this.location,
                application: this.application,
                showAddress: true
            });
        }
    },

    // @method getContext @returns {OrderWizard.Module.CartItems.Context}
    getContext: function() {
        const { lines } = this;
        const item_count = LiveOrderModel.countItems(lines);
        // @class OrderWizard.Module.CartItems.Context
        return {
            // @property {LiveOrder.Model} model
            model: this.model,
            // @property {Boolean} itemCountGreaterThan1
            itemCountGreaterThan1: item_count > 1,
            // @property {Number} itemCount
            itemCount: item_count,
            // @property {Boolean} showOpenedAccordion
            showOpenedAccordion: !!this.options.show_opened_accordion,
            // @property {Boolean} isAccordionPrimary
            isAccordionPrimary: !!this.options.is_accordion_primary,
            // @property {Boolean} showEditCartButton
            showEditCartButton: !!this.options.show_edit_cart_button,
            // @property {Boolean} showHeaders
            showHeaders: !!this.options.show_headers,
            // @property {Boolean} showMobile
            showMobile: !!this.options.show_mobile,
            // @property {StoreLocation.Model} location
            location: this.location,
            // @property {Boolean} showLocation
            showLocation: !!this.location.get('name') && !this.options.hide_location
        };
    }
});
