/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PaymentInstrument.CreditCard.Model"/>
/// <reference path="../../Utilities/JavaScript/GlobalDeclarations.d.ts" />

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as jQuery from '../../Core/JavaScript/jQuery';

import PaymentMethodModel = require('../../../Advanced/PaymentMethod/JavaScript/PaymentMethod.Model');

// @method validate that the expiration date is bigger than today
function validateExpirationDate(value, name, data) {
    if (
        data &&
        (!data.internalid || (data.internalid && !SC.ENVIRONMENT.paymentInstrumentEnabled))
    ) {
        const current = new Date();
        const selected_date = new Date(data.expyear, data.expmonth - 1).getTime();
        if (
            !value ||
            _.isNaN(selected_date) ||
            new Date(current.getFullYear(), current.getMonth()).getTime() > selected_date
        ) {
            return Utils.translate('Please select a date in the future');
        }
    }
}

// @class PaymentInstrument.CreditCard.Model responsible
// of implement the REST model of a credit card and of validating
// the credit card properties @extends Backbone.Model
const PaymentInstrumentCreditCardModel: any = PaymentMethodModel.extend({
    // @property validation. Backbone.Validation attribute used for validating the form before submit.
    validation: {
        ccname: {
            fn: function(ccname) {
                if (!ccname || !String(ccname).trim()) {
                    return Utils.translate('Name is required');
                }
                if (ccname.length > 26) {
                    return Utils.translate('Name too long');
                }
            }
        },
        ccnumber: {
            fn: function(cc_number, attr, form) {
                // credit card number validation
                // It validates that the number pass the Luhn test and also that it has the right starting digits that identify the card issuer
                if (!cc_number) {
                    return Utils.translate('Card Number is required');
                }

                if (_.isUndefined(form.internalid)) {
                    cc_number = cc_number.replace(/\s/g, '');

                    // check Luhn Algorithm
                    const card_number_is_valid =
                        _(cc_number.split('').reverse()).reduce(function(a, n, index) {
                            return (
                                a +
                                _((+n * [1, 2][index % 2]).toString().split('')).reduce(function(
                                    b,
                                    o
                                ) {
                                    return b + +o;
                                },
                                0)
                            );
                        }, 0) %
                            10 ===
                        0;

                    if (!card_number_is_valid) {
                        // we throw an error if the number fails the regex or the Luhn algorithm
                        return Utils.translate('Credit Card Number is invalid');
                    }
                }
            }
        },
        paymentmethod: {
            fn: function(paymentmethod, attr, form) {
                if (_.isUndefined(form.internalid) && paymentmethod === '0') {
                    return Utils.translate('Please Select a Credit Card Type');
                }
            }
        },
        expyear: { fn: validateExpirationDate },
        expmonth: { fn: validateExpirationDate },
        ccsecuritycode: {
            fn: function(cc_security_code) {
                if (
                    SC.ENVIRONMENT.siteSettings.checkout.requireccsecuritycode === 'T' &&
                    (this.hasSecurityCode || this.get('hasSecurityCode'))
                ) {
                    const errorMessage = Utils.validateSecurityCode(cc_security_code);
                    if (errorMessage) {
                        return errorMessage;
                    }
                }
            }
        }
    }
});

export = PaymentInstrumentCreditCardModel;
