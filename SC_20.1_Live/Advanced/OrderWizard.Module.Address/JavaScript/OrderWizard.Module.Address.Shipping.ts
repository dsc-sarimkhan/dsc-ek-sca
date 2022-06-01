/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.Address.Shipping"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended.d.ts" />

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import OrderWizardModuleAddress = require('./OrderWizard.Module.Address');

// @class OrderWizard.Module.Address.Shipping @extend OrderWizard.Module.Address
const OrderWizardModuleAddressShipping: any = OrderWizardModuleAddress.extend({
    manage: 'shipaddress',
    sameAsManage: 'billaddress',

    className: 'OrderWizard.Module.Address.Shipping',

    errors: [
        'ERR_CHK_INCOMPLETE_ADDRESS',
        'ERR_CHK_SELECT_SHIPPING_ADDRESS',
        'ERR_CHK_INVALID_SHIPPING_ADDRESS',
        'ERR_WS_INVALID_SHIPPING_ADDRESS'
    ],
    sameAsMessage: Utils.translate('Same as billing address'),

    selectAddressErrorMessage: {
        errorCode: 'ERR_CHK_SELECT_SHIPPING_ADDRESS',
        errorMessage: Utils.translate('Please select a shipping address')
    },

    invalidAddressErrorMessage: {
        errorCode: 'ERR_CHK_INVALID_SHIPPING_ADDRESS',
        errorMessage: Utils.translate('The selected shipping address is invalid')
    },

    selectMessage: Utils.translate('Ship to this Address'),

    isActive: function(): boolean {
        return (
            !this.wizard.model.get('ismultishipto') && this.wizard.model.shippingAddressIsRequired()
        );
    },

    eventHandlersOn: function() {
        OrderWizardModuleAddress.prototype.eventHandlersOn.apply(this, arguments);

        this.model.on('change:tempshipaddress', jQuery.proxy(this, 'estimateShipping'), this);
        this.wizard.model.on('ismultishiptoUpdated', this.render, this);
    },

    eventHandlersOff: function() {
        OrderWizardModuleAddress.prototype.eventHandlersOff.apply(this, arguments);

        this.model.off('change:tempshipaddress', null, this);
        this.model.off('change:ismultishipto', null, this);
    },

    changeAddress: function() {
        OrderWizardModuleAddress.prototype.changeAddress.apply(this, arguments);

        if (this.address) {
            this.model.trigger('change:' + this.manage);
        }
    },

    estimateShipping: function(model, address) {
        const countries = this.wizard.application.getConfig('siteSettings.countries');
        const country_value = address && address.country;
        const state_value = address && address.state;
        const zip_value = address && address.zip;
        const country_ready = country_value && country_value !== model.previous('country');
        const state_ready =
            (country_value && !countries[country_value].states) ||
            (state_value && state_value !== model.previous('state'));
        const zip_ready =
            (country_value && countries[country_value].isziprequired === 'F') ||
            (zip_value && zip_value !== model.previous('zip'));

        if (country_ready && zip_ready && state_ready) {
            const addresses = this.model.get('addresses');
            const address_id =
                country_value + '-' + (state_value || '-') + '--' + (zip_value || '-') + '----null';
            const current_address = addresses.get(address_id);

            if (!current_address) {
                addresses.add({
                    internalid: address_id,
                    country: country_value,
                    state: state_value,
                    zip: zip_value
                });
            } else {
                current_address.set({
                    country: country_value,
                    state: state_value,
                    zip: zip_value
                });
            }

            if (this.addressId !== address_id) {
                model.set({
                    shipaddress: address_id,
                    isEstimating: true
                });
            }
        } else {
            model.set({ isEstimating: false });
        }
    }
});

export = OrderWizardModuleAddressShipping;
