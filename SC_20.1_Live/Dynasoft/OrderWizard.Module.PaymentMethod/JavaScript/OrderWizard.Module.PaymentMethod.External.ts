/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.PaymentMethod.External"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as order_wizard_paymentmethod_external_module_tpl from 'order_wizard_paymentmethod_external_module.tpl';

import OrderWizardModulePaymentMethod = require('./OrderWizard.Module.PaymentMethod');
import TransactionPaymentmethodModel = require('../../../Commons/Transaction/JavaScript/Transaction.Paymentmethod.Model');
import Configuration = require('../../../Advanced/SCA/JavaScript/SC.Configuration');

// @class OrderWizard.Module.PaymentMethod.External @extends OrderWizard.Module.PaymentMethod
const OrderWizardModulePaymentMethodExternal: any = OrderWizardModulePaymentMethod.extend({
    template: order_wizard_paymentmethod_external_module_tpl,

    render: function render() {
        const options = this.options.model && this.options.model.get('options');

        if (options) {
            _.extend(this.options, options);
        }

        this.setPaymentMethod();

        this._render();
    },

    setPaymentMethod: function() {
        const n = Configuration.get('siteSettings.id');
        const status_accept_value = Configuration.get(
            'siteSettings.externalCheckout.' +
                this.options.record_type.toUpperCase() +
                '.statusAcceptValue',
            'ACCEPT'
        );
        const status_reject_value = Configuration.get(
            'siteSettings.externalCheckout.' +
                this.options.record_type.toUpperCase() +
                '.statusRejectValue',
            'REJECT'
        );
        const status_parameter_name = Configuration.get(
            'siteSettings.externalCheckout.' +
                this.options.record_type.toUpperCase() +
                '.statusParameterName',
            'status'
        );
        const url = Utils.getAbsoluteUrl('external_payment.ssp');
        const current_touchpoint = Configuration.get('currentTouchpoint');
        const thankyouurl_parameters = {
            n: n,
            externalPaymentDone: 'T',
            touchpoint: current_touchpoint,
            recordType: this.options.record_type || 'salesorder'
        };
        const errorurl_parameters = {
            n: n,
            externalPaymentDone: 'T',
            touchpoint: current_touchpoint,
            recordType: this.options.record_type || 'salesorder'
        };
        const returnurl_parameters = {
            n: n,
            externalPaymentDone: 'T',
            touchpoint: current_touchpoint,
            recordType: this.options.record_type || 'salesorder'
        };

        thankyouurl_parameters[status_parameter_name] = status_accept_value;
        errorurl_parameters[status_parameter_name] = status_reject_value;

        if (this.options.prevent_default) {
            const prevent_default_parameter_name = Configuration.get(
                'siteSettings.externalCheckout.' +
                    this.options.record_type.toUpperCase() +
                    '.preventDefaultParameterName',
                'preventDefault'
            );
            const prevent_default_value = Configuration.get(
                'siteSettings.externalCheckout.' +
                    this.options.record_type.toUpperCase() +
                    '.preventDefaultValue',
                'T'
            );

            thankyouurl_parameters[prevent_default_parameter_name] = prevent_default_value;
            errorurl_parameters[prevent_default_parameter_name] = prevent_default_value;
            returnurl_parameters[prevent_default_parameter_name] = prevent_default_value;
        }
        this.paymentMethod = new TransactionPaymentmethodModel({
            type: 'external_checkout_' + this.options.paymentmethod.key,
            isexternal: 'T',
            internalid: this.options.paymentmethod.internalid,
            merchantid: this.options.paymentmethod.merchantid,
            key: this.options.paymentmethod.key,
            thankyouurl: Utils.addParamsToUrl(url, thankyouurl_parameters), // Commerce API
            errorurl: Utils.addParamsToUrl(url, errorurl_parameters), // Commerce API
            returnurl: Utils.addParamsToUrl(url, returnurl_parameters) // SuiteScript
        });
    },

    submit: function submit() {
        this.setPaymentMethod();
        OrderWizardModulePaymentMethod.prototype.submit.apply(this);
    },

    getContext: function getContext() {
        return {
            // @property {String} imageUrl
            imageUrl: this.options.paymentmethod.imagesrc[0],
            // @property {String} name
            name: this.options.paymentmethod.name,
            // @property {String} description
            description:
                this.options.description ||
                Utils.translate(
                    'You will be redirected to your external payment site after reviewing your order on next step. Once your order is placed, you will return to our site to see the confirmation of your purchase.'
                ),
            // @property {String} type
            type: this.paymentMethod.get('type'),
            
            isSelected: this.paymentMethod.get('type') === this.options.selectedExternalId
        };
    }
});

export = OrderWizardModulePaymentMethodExternal;
