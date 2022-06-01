/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.MultiShipTo.Package.Creation"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended.d.ts" />

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as order_wizard_msr_package_creation_tpl from 'order_wizard_msr_package_creation.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import TransactionLineViewsCellSelectableView = require('../../../Commons/Transaction.Line.Views/JavaScript/Transaction.Line.Views.Cell.Selectable.View');
import WizardModule = require('../../Wizard/JavaScript//Wizard.Module');
import OrderWizardModuleMultiShipToSetAddressesPackageEditQuantity = require('./OrderWizard.Module.MultiShipTo.Package.Creation.EditQuantity');
import AddressDetailsView = require('../../../Commons/Address/JavaScript/Address.Details.View');

// @class OrderWizard.Module.MultiShipTo.Package.Creation @extend Wizard.Module
export = WizardModule.extend({
    template: order_wizard_msr_package_creation_tpl,

    allItemShouldBelongToAPackage: {
        errorMessage: Utils.translate(
            'Some of your items are not assigned to a shipping address. Please, go back to shipping step.'
        ),
        errorCode: 'ERR_MST_ITEM_WITHOUT_PACKAGE'
    },

    errors: ['ERR_MST_ITEM_WITHOUT_PACKAGE'],

    events: {
        'click [data-action="select-unselected-item"]': 'selectLine',
        'click [data-action="sub-quantity"]': 'subQuantity',
        'click [data-action="add-quantity"]': 'addQuantity',
        'change [data-action="split-quantity"]': 'updateLineQuantity',
        'change [data-action="set-shipments-address-selector"]': 'setSelectedAddressId',
        'click [data-action="select-unselect-all"]': 'selectUnselectAll',
        'click [data-action="create-shipments"]': 'applyCurrentAddress'
    },

    initialize: function(options) {
        this.options = options;
        WizardModule.prototype.initialize.apply(this, arguments);

        const self = this;
        this.selected_address_id = null;
        this.createShipmentLabel = '';
        this.createShipmentEnabled = false;

        this.wizard.model.on('multishipto-line-updated', function() {
            self.selected_address_id = self.getFirstAddressIdWithoutShipments();
            self.render();
        });

        self.wizard.options.profile.get('addresses').once('reset', function() {
            self.selected_address_id = self.getFirstAddressIdWithoutShipments();
        });

        BackboneCompositeView.add(this);
    },

    updateLineQuantity: function(event) {
        const target = jQuery(event.currentTarget);
        const target_control_group = target.closest('[data-validation="control-group"]');
        const message_placeholder = target_control_group.find(
            '[data-validation="error-placeholder"]'
        );
        const create_shippment_button = this.$('[data-action="create-shipments"]');
        const line_id = target.closest('[data-type="row"]').data('lineId');
        const selected_line = this.wizard.model.get('lines').get(line_id);
        const min_quantity = selected_line.get('minimumquantity') || 1;
        const quantity = selected_line.get('quantity');
        const new_quantity = parseInt(<any>target.val(), 10);

        // invalid values return to default quantity
        if (isNaN(new_quantity) || new_quantity > quantity) {
            target.val(quantity);
            return;
        }

        if (min_quantity > new_quantity) {
            target.val(min_quantity);
            return;
        }

        if (quantity - new_quantity >= min_quantity || new_quantity === quantity) {
            target_control_group.removeAttr('data-validation-error');
            create_shippment_button.removeAttr('disabled');
            message_placeholder.empty().hide();
            selected_line.set('splitquantity', new_quantity);
        } else {
            target_control_group.attr('data-validation-error', '');
            create_shippment_button.attr('disabled', '');
            selected_line.unset('splitquantity');

            const message = Utils.translate(
                'The remaining quantity of items ($(0)) should be more than the minimum quantity required',
                quantity - new_quantity
            );
            message_placeholder.text(message).show();
        }
    },

    // @method addQuantity plus/minus Quantity
    addQuantity: function(e) {
        e.stopPropagation();
        const $line = jQuery(e.target).closest('[data-type="row"]');
        const quantity_edit = $line.find('[data-action="split-quantity"]');
        const new_quantity = parseFloat(<string>quantity_edit.val()) + 1;

        quantity_edit.val(new_quantity);
        quantity_edit.trigger('change');
    },

    subQuantity: function(e) {
        e.stopPropagation();
        const $line = jQuery(e.target).closest('[data-type="row"]');
        const quantity_edit = $line.find('[data-action="split-quantity"]');
        const new_quantity = parseFloat(<string>quantity_edit.val()) - 1;

        quantity_edit.val(new_quantity);
        quantity_edit.trigger('change');
    },

    // Returns the first address id without a shipment associated to it
    getFirstAddressIdWithoutShipments: function() {
        const set_lines: any = this.wizard.model.getSetLines();
        const addresses = this.getValidAddresses();
        const default_shipping_address = _.find(addresses, function(address: any) {
            return address.get('defaultshipping') === 'T';
        });
        let is_default_shipping_address_valid: boolean;
        const selected_address = _.find(addresses, function(address: any) {
            return !_.find(set_lines, function(line: any) {
                return line.get('shipaddress') === address.id;
            });
        });

        if (default_shipping_address) {
            is_default_shipping_address_valid = !_.find(set_lines, function(line: any) {
                return line.get('shipaddress') === default_shipping_address.id;
            });

            if (is_default_shipping_address_valid) {
                return default_shipping_address.id;
            }
        }

        return selected_address
            ? selected_address.id
            : addresses && addresses.length
            ? (<any>_.first(addresses)).id
            : null;
    },

    // Manage the selection or unselection of all items
    selectUnselectAll: function() {
        const unset_lines = this.wizard.model.getUnsetLines();
        const check_lines = _.filter(unset_lines, function(line: any) {
            return line.get('check');
        });

        check_lines.length === unset_lines.length ? this.unselectAllItems() : this.selectAllItems();

        this.render();
    },

    // Returns the count of items selected
    getSelectedItemsLength: function() {
        return _.filter(this.wizard.model.getUnsetLines(), function(line: any) {
            return line.get('check');
        }).length;
    },

    // Select all items
    selectAllItems: function() {
        _.each(this.wizard.model.getUnsetLines(), function(line: any) {
            line.set('check', true);
        });
    },

    // Unselect all items
    unselectAllItems: function() {
        _.each(this.wizard.model.getUnsetLines(), function(line: any) {
            line.set('check', false);
            line.unset('splitquantity');
        });
    },

    isActive: function() {
        return (
            this.wizard.model.get('ismultishipto') && this.wizard.model.shippingAddressIsRequired()
        );
    },

    // Returns the list of address available to be part of Multi Ship To
    getValidAddresses: function() {
        return this.wizard.options.profile.get('addresses').where({ isvalid: 'T' });
    },

    // Override Render in order to update Continue and back buttons
    render: function() {
        if (this.isActive()) {
            this.updateContinueButtonState();
            return WizardModule.prototype.render.apply(this, arguments);
        }
        this.$el.empty();
    },

    // Returns the current address id. Used when the page is re-render to avoid losing the selected address in the combo-box
    getSelectedAddressId: function() {
        if (
            !this.selected_address_id ||
            !this.wizard.options.profile
                .get('addresses')
                .where({ internalid: this.selected_address_id }).length
        ) {
            this.selected_address_id = this.getFirstAddressIdWithoutShipments();
        }
        return this.selected_address_id;
    },

    // Set the selected address to retrieved it later
    setSelectedAddressId: function(e) {
        this.selected_address_id = jQuery(e.target).val();
        this.render();
    },

    // Select and un-select an item
    selectLine: function selectLine(e) {
        // ignore clicks on anchors, buttons, etc
        if (Utils.isTargetActionable(e)) {
            return;
        }

        const marked_line_id = jQuery(e.currentTarget).data('lineId');
        const selected_line = this.wizard.model.get('lines').get(marked_line_id);

        selected_line.set('check', !selected_line.get('check'));

        if (!selected_line.get('check')) {
            selected_line.unset('splitquantity');
        }
        this.render();
    },

    // Determines if the passed in address id has already created at one shipment
    addressHasShipments: function(address_id) {
        return !!_.find(this.wizard.model.getShippableLines(), function(item: any) {
            return item.get('shipaddress') === address_id;
        });
    },

    // Update Continue button, enable/disable and change its label
    updateContinueButtonState: function() {
        const unapplied_items_length = this.wizard.model.getUnsetLines().length;
        const selected_items_length = this.wizard.model.get('lines').filter(function(line) {
            return !!line.get('check');
        }).length;
        const selected_address_id = jQuery('[data-action="set-shipments-address-selector"]').val();
        let continue_enabled;

        continue_enabled = _.all(this.wizard.model.getShippableLines(), function(item: any) {
            return !!item.get('shipaddress');
        });

        this.createShipmentEnabled = !(unapplied_items_length > 0 && selected_items_length <= 0);

        if (selected_items_length > 0 && this.addressHasShipments(selected_address_id)) {
            this.createShipmentLabel = Utils.translate('Add to Shipment');
        } else {
            this.createShipmentLabel = Utils.translate('Create Shipment');
        }

        this.trigger('change_enable_continue', continue_enabled, {
            onlyContinue: true,
            notDisableTouchs: true
        });
    },

    isValid: function() {
        return this.wizard.model.getUnsetLines().length && this.isActive()
            ? jQuery.Deferred().reject(this.allItemShouldBelongToAPackage)
            : jQuery.Deferred().resolve();
    },

    restoreModelBeforeApplyAddress: function() {
        const self = this;
        _.each(this.linesBeforeApplyAddress, function(value: any, id) {
            const line = self.wizard.model.get('lines').findWhere({ internalid: id });
            line.set('shipaddress', value.shipaddress);
            line.set('check', value.check);
        });
    },

    // Apply for all selected lines the current address
    applyCurrentAddress: function() {
        this.clearGeneralMessages();
        const selected_address_id: any = jQuery(
            '[data-action="set-shipments-address-selector"]'
        ).val();
        const self = this;
        const selected_items_length = this.wizard.model.get('lines').filter(function(line) {
            return !!line.get('check');
        }).length;
        const selected_address = this.wizard.options.profile
            .get('addresses')
            .get(selected_address_id);
        const item_for_address = this.wizard.model.get('lines').groupBy(function(line) {
            return line.get('shipaddress');
        })[selected_address_id];
        let result;
        const notify_success_message = function() {
            const message =
                selected_items_length > 1
                    ? Utils.translate(
                          '$(0) items was added to Shipment: $(1)',
                          selected_items_length,
                          selected_address.get('fullname')
                      )
                    : Utils.translate(
                          '$(0) item was added to Shipment: $(1)',
                          selected_items_length,
                          selected_address.get('fullname')
                      );

            self.showGeneralMessage(message, false);
        };

        if (selected_address_id && selected_address) {
            if (!selected_address.get('check')) {
                selected_address.set('check', true);
                this.wizard.model.get('addresses').add(selected_address);
            }

            this.linesBeforeApplyAddress = {};

            _.each(this.wizard.model.get('lines').where({ check: true }), function(line: any) {
                self.linesBeforeApplyAddress[line.id] = {
                    shipaddress: line.get('shipaddress'),
                    check: line.get('check')
                };
                line.set('shipaddress', selected_address_id);
                line.set('check', false);
            });

            result = this.wizard.model
                .save()
                .fail(function() {
                    self.restoreModelBeforeApplyAddress();
                })
                .then(function() {
                    self.selected_address_id = self.getFirstAddressIdWithoutShipments();
                })
                .then(function() {
                    self.wizard.model.trigger('multishipto-address-applied');
                })
                .then(_.bind(this.render, this));

            // There are already shipments created
            if (item_for_address && item_for_address.length) {
                result.then(notify_success_message);
            } else {
                result.then(function() {
                    self.clearGeneralMessages();
                });
            }

            return result;
        }
        return jQuery.Deferred().resolve();
    },

    childViews: {
        'ShippableItems.Collection': function() {
            return new BackboneCollectionView({
                collection: this.wizard.model.getUnsetLines(),
                childView: TransactionLineViewsCellSelectableView,
                viewsPerRow: 1,
                childViewOptions: {
                    navigable: false,

                    detail1Title: Utils.translate('Qty:'),
                    detail1: OrderWizardModuleMultiShipToSetAddressesPackageEditQuantity,

                    detail2Title: Utils.translate('Unit price:'),
                    detail2: 'rate_formatted',

                    detail3Title: Utils.translate('Amount:'),
                    detail3: 'amount_formatted'
                }
            });
        },
        'Address.Details': function() {
            return new AddressDetailsView({
                model: this.wizard.options.profile
                    .get('addresses')
                    .get(this.getSelectedAddressId()),
                hideActions: true,
                hideDefaults: true,
                manage: 'shipaddress',
                hideSelector: true
            });
        }
    },

    // @method getContext @return {OrderWizard.Module.MultiShipTo.Package.Creation.Context}
    getContext: function() {
        const addresses = this.getValidAddresses();
        const current_selected_address_id = this.getSelectedAddressId();
        const addresses_map = _.map(addresses, function(address: any) {
            // @class AddressObject
            return {
                // @property {String} addressId
                addressId: address.get('internalid'),
                // @property {Boolean} isSelected
                isSelected: address.get('internalid') === current_selected_address_id,
                // @property {String} addressText
                addressText: address.get('fullname') + ' - ' + address.get('addr1')
            };
        });
        const unset_lines = this.wizard.model.getUnsetLines();
        const all_items_length = unset_lines.length;
        const selected_items_length = this.getSelectedItemsLength();
        const are_all_items_selected = selected_items_length === all_items_length;

        // @class OrderWizard.Module.MultiShipTo.Package.Creation.Context
        return {
            // @property {Boolean} isAnyUnsetLine
            isAnyUnsetLine: !!unset_lines.length,
            // @property {Array<AddressObject>} addresses
            addresses: addresses_map,
            // @property {Boolean} areAllItemSelected
            areAllItemSelected: are_all_items_selected,
            // @property {Number} allItemsLength
            allItemsLength: all_items_length,
            // @property {Boolean} isAnySelectedItem
            isAnySelectedItem: !!selected_items_length,
            // @property {Boolean} isSelectedItemLengthGreaterThan1
            isSelectedItemsLengthGreaterThan1: selected_items_length > 1,
            // @property {Number} selectedItemsLength
            selectedItemsLength: selected_items_length,
            // @property {Boolean} isCreateShipmentEnabled
            isCreateShipmentEnabled: this.createShipmentEnabled,
            // @property {String} createShipmentLabel
            createShipmentLabel: this.createShipmentLabel,
            // @property {String} editAddressesUrl
            editAddressesUrl: this.options.edit_addresses_url || '',
            // @property {Boolean} hasMultipleUnsetLines
            hasMultipleUnsetLines: unset_lines.length > 1
        };
    }
});
