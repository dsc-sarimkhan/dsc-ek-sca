/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.CartItems.PickupInStore"/>

import '../../../Commons/Transaction.Line.Views/JavaScript/Transaction.Line.Views.Cell.Navigable.View';
import * as _ from 'underscore';
import '../../../Commons/Utilities/JavaScript/Utils';
import * as order_wizard_cartitems_module_pickup_in_store_tpl from 'order_wizard_cartitems_module_pickup_in_store.tpl';

import WizardModule = require('../../Wizard/JavaScript/Wizard.Module');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import OrderWizardModuleCartItemsPickupInStorePackageView = require('./OrderWizard.Module.CartItems.PickupInStore.Package.View');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');

// @class OrderWizard.Module.CartItems.PickupInStore @extends Wizard.Module
export = WizardModule.extend({
    // @property {Function} template
    template: order_wizard_cartitems_module_pickup_in_store_tpl,

    initialize: function() {
        const self = this;

        WizardModule.prototype.initialize.apply(this, arguments);
        this.wizard.model.on('ismultishiptoUpdated', function() {
            self.render();
        });

        this.wizard.model.on('promocodeUpdated', function() {
            self.render();
        });

        this.wizard.model.on('change:lines', function() {
            self.lines = self.wizard.model.getPickupInStoreLines();
            self.render();
        });

        this.lines = this.model.getPickupInStoreLines();

        BackboneCompositeView.add(this);

        this.options = this.options || {};

        this.options.exclude_on_skip_step = true;
    },

    isActive: function isActive() {
        return Configuration.get('siteSettings.isPickupInStoreEnabled') && this.lines.length;
    },

    // @property {Object} childViews
    childViews: {
        'Packages.Collection': function() {
            const lines_for_pickup = this.model.getPickupInStoreLines();
            let lines_by_location: any = _.groupBy(lines_for_pickup, function(line: any) {
                return line.get('location');
            });
            lines_by_location = _.map(lines_by_location, function(lines, location_id) {
                return {
                    lines: lines,
                    location: location_id
                };
            });

            return new BackboneCollectionView({
                collection: lines_by_location,
                childView: OrderWizardModuleCartItemsPickupInStorePackageView,
                viewsPerRow: 1,
                childViewOptions: {
                    hide_location: this.options.hide_location,
                    show_opened_accordion: this.options.show_opened_accordion,
                    show_edit_cart_button: this.options.show_edit_cart_button,
                    show_headers: this.options.show_headers,
                    show_mobile: this.options.show_mobile,
                    application: this.wizard.application
                }
            });
        }
    },

    // @method render
    render: function() {
        this.application = this.wizard.application;
        this.profile = this.wizard.options.profile;
        this.options.application = this.wizard.application;

        if (this.isActive()) {
            this._render();
        }
    }
});
