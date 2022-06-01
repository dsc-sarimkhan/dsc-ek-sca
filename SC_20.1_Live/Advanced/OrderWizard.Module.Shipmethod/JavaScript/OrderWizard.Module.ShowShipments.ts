/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.ShowShipments"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended.d.ts" />

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as order_wizard_showshipments_module_tpl from 'order_wizard_showshipments_module.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import WizardModule = require('../../Wizard/JavaScript/Wizard.Module');
import AddressDetailsView = require('../../../Commons/Address/JavaScript/Address.Details.View');
import OrderWizardModuleCartItemsShip = require('../../OrderWizard.Module.CartItems/JavaScript/OrderWizard.Module.CartItems.Ship');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');

// @class OrderWizard.Module.ShowShipments @extends Wizard.Module
export = WizardModule.extend({
    // @property {Function} template
    template: order_wizard_showshipments_module_tpl,

    // @property {Array} errors
    errors: ['ERR_NOT_SET_SHIPPING_METHODS', 'ERR_NOT_SET_SHIPPING_ADDRESS'],

    shipMethodIsRequire: {
        errorMessage: Utils.translate('Please select a delivery method'),
        errorCode: 'ERR_NOT_SET_SHIPPING_METHODS'
    },

    shipAddressIsRequire: {
        errorMessage: Utils.translate('Please select a shipping address'),
        errorCode: 'ERR_NOT_SET_SHIPPING_ADDRESS'
    },

    // @property {Object} events
    events: {
        'change [data-action="change-delivery-options"]': 'changeDeliveryOptions'
    },

    initialize: function() {
        WizardModule.prototype.initialize.apply(this, arguments);

        this.application = this.wizard.application;
        this.options.application = this.wizard.application;

        this.addressSource = this.wizard.options.profile.get('addresses');

        BackboneCompositeView.add(this);

        this.wizard.model.on('ismultishiptoUpdated', this.render, this);
        this.wizard.model.on('promocodeUpdated', this.render, this);
        this.wizard.model.on('change', this.render, this);
    },

    destroy: function destroy() {
        this.address && this.address.off('change', this.render, this);
        return this._destroy();
    },

    // @method isActive
    // @return {Boolean}
    isActive: function(): boolean {
        return !this.model.get('ismultishipto') && this.model.getIfThereAreDeliverableItems();
    },

    isValid: function() {
        if (this.model.shippingAddressIsRequired()) {
            if (!this.model.get('shipmethod')) {
                return jQuery.Deferred().reject(this.shipMethodIsRequire);
            }
            if (!this.model.get('shipaddress')) {
                return jQuery.Deferred().reject(this.shipAddressIsRequire);
            }
        }

        return jQuery.Deferred().resolve();
    },

    // @method changeDeliveryOptions
    changeDeliveryOptions: function(e) {
        const value = this.$(e.target).val();
        const self = this;

        this.model.set('shipmethod', value);
        this.step.disableNavButtons();
        this.model.save().always(function() {
            self.render();
            self.step.enableNavButtons();
        });
    },

    // @property {Object} childViews
    childViews: {
        'Shipping.Address': function() {
            return new AddressDetailsView({
                hideActions: !!this.options.hide_edit_address_button,
                hideDefaults: true,
                hideRemoveButton: true,
                manage: 'shipaddress',
                model: this.addressSource.get(this.model.get('shipaddress')),
                hideSelector: true
            });
        },
        'Items.Collection': function() {
            return new OrderWizardModuleCartItemsShip({
                wizard: this.wizard,
                exclude_on_skip_step: true,
                hide_address: true,
                show_opened_accordion: Utils.isDesktopDevice(),
                is_accordion_primary: true,
                show_edit_cart_button: !this.options.hide_edit_cart_button,
                show_headers: false,
                show_mobile: true
            });
        }
    },

    // @method getContext
    // @returns {OrderWizard.Module.ShowShipments.Context}
    getContext: function() {
        const self = this;
        const selected_shipmethod = this.model
            .get('shipmethods')
            .findWhere({ internalid: this.model.get('shipmethod') });
        const shipping_methods = this.model.get('shipmethods').map(function(shipmethod) {
            return {
                name: shipmethod.get('name'),
                rate_formatted: shipmethod.get('rate_formatted'),
                internalid: shipmethod.get('internalid'),
                isActive: shipmethod.get('internalid') === self.model.get('shipmethod')
            };
        });
        const address_source = this.addressSource.get(this.model.get('shipaddress'));

        // @class OrderWizard.Module.ShowShipments.Context
        return {
            // @property {LiveOrder.Model} model
            model: this.model,
            // @property {Boolean} showShippingInformation Indicate if the shipmethod select should be shown or not. Used when in SST all items are non shippable
            showShippingInformation: !!this.model.shippingAddressIsRequired(),
            // @property {Boolean} showShippingAddress
            showShippingAddress: !!address_source,
            // @property {String} editUrl
            editUrl: this.options.edit_url,
            // @property {Boolean} showEditButton
            showEditButton: !!this.options.edit_url,
            // @property {Boolean}
            showSelectedShipmethod: !!selected_shipmethod,
            // @property {Object} selectedShipmethod
            selectedShipmethod: selected_shipmethod,
            // @property {Array} shippingMethods
            shippingMethods: shipping_methods,
            // @property {Boolean} showShippingMetod
            showShippingMetod: !this.options.hideShippingMethod,
            // @property {String} shippingAddress
            shippingAddress: !!address_source && address_source.get('fullname')
        };
    }
});
