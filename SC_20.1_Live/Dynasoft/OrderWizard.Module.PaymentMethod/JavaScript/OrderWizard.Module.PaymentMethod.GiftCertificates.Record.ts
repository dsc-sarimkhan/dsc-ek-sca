/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.PaymentMethod.GiftCertificates.Record"/>

import * as order_wizard_paymentmethod_giftcertificates_module_record_tpl from 'order_wizard_paymentmethod_giftcertificates_module_record.tpl';

import GlobalViewsFormatPaymentMethodView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.FormatPaymentMethod.View');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');

// @class OrderWizard.Module.PaymentMethod.GiftCertificates.Record @extends Backbone.View
const OrderWizardModulePaymentMethodGiftCertificatesRecord: any = BackboneView.extend({
    template: order_wizard_paymentmethod_giftcertificates_module_record_tpl,

    initialize: function() {
        BackboneCompositeView.add(this);
    },

    // @property {Object} childViews
    childViews: {
        GiftCertificates: function() {
            return new GlobalViewsFormatPaymentMethodView({
                model: this.model
            });
        }
    },

    // @method getContext @return OrderWizard.Module.PaymentMethod.GiftCertificates.Record.Context
    getContext: function() {
        // @class OrderWizard.Module.PaymentMethod.GiftCertificates.Record.Context
        return {
            // @property {Quote.Model} collection
            giftcertificate: this.model.get('giftcertificate')
        };
    }
});

export = OrderWizardModulePaymentMethodGiftCertificatesRecord;
