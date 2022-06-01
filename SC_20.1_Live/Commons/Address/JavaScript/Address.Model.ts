/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Address.Model"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';

import Backbone = require('../../Utilities/JavaScript/backbone.custom');

// @method isCompanyRequired
// Check if company field is mandatory.
function isCompanyRequired() {
    return (
        SC &&
        SC.ENVIRONMENT &&
        SC.ENVIRONMENT.siteSettings &&
        SC.ENVIRONMENT.siteSettings.registration &&
        SC.ENVIRONMENT.siteSettings.registration.companyfieldmandatory === 'T'
    );
}

// @method isPhoneRequired
// Check if phone field is mandatory.
function isPhoneRequired() {
    return (
        SC &&
        SC.CONFIGURATION &&
        SC.CONFIGURATION.addresses &&
        SC.CONFIGURATION.addresses.isPhoneMandatory
    );
}

// @class Address.Model @extend Backbone.Model
const AddressModel: any = Backbone.Model.extend({
    // @property {String} urlRoot
    urlRoot: 'services/Address.Service.ss',

    // @property validation
    // Backbone.Validation attribute used for validating the form before submit.
    validation: {
        fullname: { required: true, msg: Utils.translate('Full Name is required') },
        addr1: { required: true, msg: Utils.translate('Address is required') },
        company: { required: isCompanyRequired(), msg: Utils.translate('Company is required') },
        country: { required: true, msg: Utils.translate('Country is required') },
        state: { fn: Utils.validateState },
        city: { required: true, msg: Utils.translate('City is required') },
        zip: { fn: Utils.validateZipCode },
        phone: { fn: Utils.validatePhone, required: isPhoneRequired() }
    },

    // @method getInvalidAttributes
    // Returns an array of localized attributes that are invalid for the current address.
    getInvalidAttributes: function() {
        // As this model is not always used inside a model's view, we need to check that the validation is attached
        const attributes_to_validate = _.keys(this.validation);
        let attribute_name;
        const invalid_attributes = [];

        this.get('isvalid') !== 'T' &&
            this.isValid(true) &&
            _.extend(this, Backbone.Validation.mixin);

        _.each(
            attributes_to_validate,
            function(attribute) {
                if (!this.isValid(attribute)) {
                    attribute_name = null;
                    switch (attribute) {
                        case 'fullname':
                            attribute_name = Utils.translate('Full Name');
                            break;
                        case 'addr1':
                            attribute_name = Utils.translate('Address');
                            break;
                        case 'city':
                            attribute_name = Utils.translate('City');
                            break;
                        case 'zip':
                            attribute_name = Utils.translate('Zip Code');
                            break;
                        case 'country':
                            attribute_name = Utils.translate('Country');
                            break;
                        case 'phone':
                            attribute_name = Utils.translate('Phone Number');
                            break;
                        case 'state':
                            attribute_name = Utils.translate('State');
                            break;
                    }

                    if (attribute_name) {
                        invalid_attributes.push(attribute_name);
                    }
                }
            },
            this
        );

        return invalid_attributes;
    }
});

export = AddressModel;
