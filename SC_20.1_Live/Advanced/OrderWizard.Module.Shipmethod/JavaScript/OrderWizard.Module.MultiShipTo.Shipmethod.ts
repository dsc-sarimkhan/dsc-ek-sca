/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.MultiShipTo.Shipmethod"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended.d.ts" />

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as order_wizard_msr_shipmethod_module_tpl from 'order_wizard_msr_shipmethod_module.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import WizardModule = require('../../Wizard/JavaScript/Wizard.Module');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import OrderWizardModuleMultiShipToShipmethodPackageView = require('./OrderWizard.Module.MultiShipTo.Shipmethod.Package.View');
import TransactionShipmethodCollection = require('../../../Commons/Transaction/JavaScript/Transaction.Shipmethod.Collection');

// @class OrderWizard.Module.MultiShipTo.Shipmethod @extends Wizard.Module
export = WizardModule.extend({
    // @property {Function} template
    template: order_wizard_msr_shipmethod_module_tpl,

    // @property
    events: {
        'click [data-action="items-expander"]': 'changeExpandedState',
        'change [data-type="address-selector"]': 'selectDeliveryMethodComboHandler'
    },

    // @property {Array} errors
    errors: ['ERR_MST_NOT_SET_SHIPPING_METHODS'],

    // @property {Object} shipmethoIsRequireErrorMessage
    shipmethoIsRequireErrorMessage: {
        errorMessage: Utils.translate('Please select a delivery method for each package'),
        errorCode: 'ERR_MST_NOT_SET_SHIPPING_METHODS'
    },

    // @method initialize
    initialize: function(options) {
        WizardModule.prototype.initialize.apply(this, arguments);

        this.packages_items_collapsed = {};
        this.is_read_only = _.isBoolean(options.is_read_only) ? options.is_read_only : true;
        this.submit_promise = null;

        this.profile = this.wizard.options.profile;

        const self = this;

        this.model.get('lines').on('change', function() {
            if (self.isValid() && self.state === 'past') {
                self.error = null;
            }
        });
        this.eventHandlersOn();

        BackboneCompositeView.add(this);
    },

    // @method present
    present: function() {
        this.eventHandlersOn();
    },

    // @method future
    // Detect when is not require attach to events
    future: function() {
        this.eventHandlersOff();
    },

    // @method past
    // Detect when is not require attach to events
    past: function() {
        this.eventHandlersOff();
    },

    // @method eventHandlersOn
    // Attach to events that keep the current state updated
    eventHandlersOn: function() {
        this.eventHandlersOff();

        this.profile.get('addresses').on('change', this.shippingAddressChange, this);

        this.model.on('change:multishipmethods', this.render, this);
    },

    // @method eventHandlersOff
    // Detach from any event
    eventHandlersOff: function() {
        this.model.off('change:multishipmethods', null, this);

        this.profile.get('addresses').off('change', null, this);
    },

    // @method shippingAddressChange
    // Handle on shipping address change
    shippingAddressChange: function(updated_address) {
        const addrress_model = this.wizard.model.get('addresses').get(updated_address.id);

        // If the address is not in the order we omit it
        if (addrress_model) {
            const change_zip = addrress_model.get('zip') !== updated_address.get('zip');
            const change_country = addrress_model.get('country') !== updated_address.get('country');
            const change_state = addrress_model.get('state') !== updated_address.get('state');

            if (change_zip || change_country || change_state) {
                this.reloadShppingMethodForAddress(updated_address.id);
            } else {
                this.render();
            }
        }
    },

    // @method reloadShppingMethodForAddress
    // Reload the group of available shipping method for a package (loading the entire model - of course)
    reloadShppingMethodForAddress: function(address_id) {
        // This only remove the current selected shipping method and save the model, doing this the template when rendering
        // will offer select a new shipping method if any, or display an error if there is none.
        const affected_lines = this.wizard.model.get('lines').where({ shipaddress: address_id });

        if (affected_lines.length) {
            _.each(affected_lines, function(line: any) {
                line.unset('shipmethod');
            });

            this.wizard.model.save();
        }
    },
    // @method getDefaultCollapseItem
    getDefaultCollapseItem: function() {
        return _.isBoolean(this.options.collapse_items)
            ? this.options.collapse_items
            : this.wizard.application.getConfig('sca.collapseElements', false);
    },

    // @method changeExpandedState
    // Update the state of the items accordion, remembering if it is expanded or collapsed
    changeExpandedState: function(e) {
        const selected_address_id = jQuery(e.target)
            .closest('[data-type="package"]')
            .data('address-id');

        this.packages_items_collapsed[selected_address_id] = !_.isUndefined(
            this.packages_items_collapsed[selected_address_id]
        )
            ? !this.packages_items_collapsed[selected_address_id]
            : !this.getDefaultCollapseItem();
    },

    // @method isActive
    // Determines if the current module is valid to be shown, all items have set a ship address id
    isActive: function() {
        const shipping_methods = this.wizard.model.get('multishipmethods');
        let result =
            this.wizard.model.get('ismultishipto') &&
            this.wizard.model.getIfThereAreDeliverableItems() &&
            _.keys(shipping_methods).length;

        if (result) {
            const all_item_has_shipping_address_selected = this.wizard.model
                .get('lines')
                .all(function(line) {
                    return !line.get('item').isshippable || line.get('shipaddress');
                });
            result = all_item_has_shipping_address_selected;

            if (this.is_read_only) {
                const all_item_has_shipping_method_selected = this.wizard.model
                    .get('lines')
                    .all(function(line) {
                        return !line.get('item').isshippable || line.get('shipmethod');
                    });

                result = result && all_item_has_shipping_method_selected;
            }
        }
        return result;
    },

    // @method selectDeliveryMethodComboHandler
    // Handle the delivery method selection when this action is caused by a combo box
    selectDeliveryMethodComboHandler: function(e) {
        const $selected_combo = jQuery(e.target);
        const selected_delivery_mehtod_id = $selected_combo.val();
        const selected_address_id = $selected_combo.data('address-id');

        this.selectDeliveryMethod(selected_delivery_mehtod_id, selected_address_id, true);
    },

    // @method selectDeliveryMethod
    // Unset the specified package (address id) and for that address id, mark the specified delivery method
    selectDeliveryMethod: function(
        selected_delivery_method_id,
        selected_address_id,
        save_changes: boolean
    ) {
        if (this.canSaveChanges()) {
            const items_per_address = this.wizard.model.get('lines').groupBy(function(line) {
                return line.get('shipaddress');
            });
            const delivery_methods = this.wizard.model.get('multishipmethods')[selected_address_id];

            _.each(items_per_address[selected_address_id], function(item: any) {
                item.unset('shipmethod');
            });

            _.each(delivery_methods.where({ check: true }), function(delivery_method: any) {
                delivery_method.unset('check');
            });

            delivery_methods.get(selected_delivery_method_id).set('check', true);

            if (save_changes) {
                this.step.disableNavButtons();
                jQuery('[data-type="shipments-list"] input[type="radio"]').attr(
                    'disabled',
                    'disabled'
                );
                this.saveChanges(true)
                    .then(function() {
                        jQuery('[data-type="shipments-list"] input[type="radio"]').removeAttr(
                            'disabled'
                        );
                    })
                    .then(_.bind(this.step.enableNavButtons, this.step));
            }
        }
    },

    // @method submit
    // Set for each line the selected shipmethod of the continaer package
    submit: function() {
        // If the view is being displayed in review mode (after place order)
        if (this.is_read_only || this.state !== 'present' || !this.isActive()) {
            return jQuery.Deferred().resolve();
        }

        // The real action of submitting a shipping method for a package is made when you select an options, clicking continue (which call this method) just validate
        // the current state.
        return this.isValid();
    },

    // @method canSaveChanges
    // Determine if not previous save operation is in progress
    canSaveChanges: function(): boolean {
        return !this.submit_promise || this.submit_promise.state() !== 'pending';
    },

    // @method saveChanges
    // Actually submit the selected shipping method to the server
    // @param {Boolean} submit_server
    // @return {jQuery.Deferred}
    saveChanges: function(submit_server) {
        this.clearError();
        if (this.canSaveChanges()) {
            const lines = this.wizard.model.get('lines');
            const shipping_methods = this.wizard.model.get('multishipmethods');

            lines.each(function(line) {
                const ship_address = line.get('shipaddress');
                if (ship_address) {
                    const selected_ship_method = shipping_methods[ship_address].findWhere({
                        check: true
                    });
                    if (selected_ship_method) {
                        line.set('shipmethod', selected_ship_method.id);
                    }
                }
            }, this);

            if (submit_server) {
                this.submit_promise = this.wizard.model.save();
                return this.submit_promise;
            }

            return jQuery.Deferred().resolve();
        }
    },
    // @method isValid
    // Check that all packages have a shipping method selected
    // @return {jQuery.Deferred}
    isValid: function() {
        const lines = this.wizard.model.getSetLines();
        let has_error = false;

        has_error = !!_.find(lines, function(line: any) {
            return !line.get('shipmethod');
        });

        if (!has_error) {
            this.error = null;
        }

        return has_error
            ? jQuery.Deferred().reject(this.shipmethoIsRequireErrorMessage)
            : jQuery.Deferred().resolve();
    },

    // @method getPackages
    // Returns the lists of packages (items grouped by address) created
    getPackages: function() {
        if (this.isActive() && this.state === 'present') {
            const result = [];
            const self = this;
            const items_per_address = this.wizard.model.get('lines').groupBy(function(line) {
                return line.get('shipaddress');
            });
            const addresses = this.profile.get('addresses'); // Get the addresses from profile because when updating just the user's address are updated
            let selected_delivery_methods = [];
            const shipping_methods = this.wizard.model.get('multishipmethods');

            _.each(_.keys(items_per_address), function(address_id) {
                if (address_id === 'null' || !shipping_methods[address_id]) {
                    return;
                }
                if (!self.is_read_only) {
                    const item_set = _.find(items_per_address[address_id], function(item: any) {
                        return !!item.get('shipmethod');
                    });

                    // If in this package there is any item already set (this occur when in a next step press back) use that as selected delivery method
                    if (item_set) {
                        shipping_methods[address_id]
                            .get(item_set.get('shipmethod'))
                            .set('check', true);
                    }

                    selected_delivery_methods = shipping_methods[address_id];
                } else {
                    // Get THE selected ship method for the entire package
                    const ship_method_group_id = (<any>_.first(items_per_address[address_id])).get(
                        'shipmethod'
                    );
                    const ship_method = shipping_methods[address_id].get(ship_method_group_id);

                    if (ship_method) {
                        ship_method.set('check', true);
                        selected_delivery_methods = new TransactionShipmethodCollection([
                            ship_method
                        ]);
                    }
                }

                result.push({
                    lines: items_per_address[address_id],
                    address:
                        addresses.get(address_id) ||
                        self.wizard.model.get('addresses').get(address_id),
                    collapse_elements: self.packages_items_collapsed[address_id],
                    summary: {},
                    deliveryMethods: selected_delivery_methods
                });
            });
            return result;
        }

        return [];
    },

    childViews: {
        'Packages.Collection': function() {
            return new BackboneCollectionView({
                collection: this.getPackages(),
                viewsPerRow: 1,
                childView: OrderWizardModuleMultiShipToShipmethodPackageView,
                childViewOptions: {
                    hide_items: this.options.hide_items,
                    hide_accordion: this.options.hide_accordion,
                    show_edit_address_url: this.options.show_edit_address_url,
                    edit_url: this.options.edit_shipment_address_url,
                    show_combo: this.options.show_combo,
                    edit_shipment_url: this.options.edit_shipment_url,
                    is_read_only: this.is_read_only,
                    hide_item_link: this.options.hide_item_link,
                    general_collapse_elements: this.getDefaultCollapseItem()
                }
            });
        }
    },

    // @method getContext @returns OrderWizard.Module.MultiShipTo.Shipmethod.Context
    getContext: function() {
        // @class OrderWizard.Module.MultiShipTo.Shipmethod.Context
        return {
            // @property {Boolean} showPackages
            showPackages: !!this.getPackages().length
        };
    }
});
