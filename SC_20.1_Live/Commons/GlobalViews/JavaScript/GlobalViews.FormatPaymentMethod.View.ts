/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="GlobalViews.FormatPaymentMethod.View"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';

import * as global_views_format_payment_method_tpl from 'global_views_format_payment_method.tpl';

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');
import BackboneModel = require('../../../Commons/BackboneExtras/JavaScript/Backbone.Model');
import Configuration = require('../../../Advanced/SCA/JavaScript/SC.Configuration');

// @class GlobalViews.FormatPaymentMethod.View @extends Backbone.View
const GlobalViewsFormatPaymentMethodView: any = BackboneView.extend({
    // @property {Function} template
    template: global_views_format_payment_method_tpl,

    // @method initialize
    initialize: function(options) {
        this.showBillingInfo = options.showBillingInfo;
        this.model = options.model || new BackboneModel();
    },

    // @method getContext @return GlobalViews.FormatPaymentMethod.View.Context
    getContext: function() {
        const payment_methods = Configuration.get('siteSettings.paymentmethods');
        const credit_card = this.model.get('creditcard');
        const is_paypal = this.model.get('type') === 'paypal';
        const is_credit_card =
            this.model.get('type') === 'creditcard' && credit_card && credit_card.ccnumber;
        const is_credit_card_token =
            this.model.get('type') === 'creditcardtoken' && credit_card && credit_card.mask;
        const is_invoice = this.model.get('type') === 'invoice';
        const is_gift_certificate = this.model.get('type') === 'giftcertificate';
        let credit_card_payment_method_name =
            credit_card && credit_card.paymentmethod ? credit_card.paymentmethod.name : '';
        const credit_card_payment_method_internalid =
            credit_card && credit_card.paymentmethod ? credit_card.paymentmethod.internalid : '';
        const credit_card_payment_method_key =
            credit_card && credit_card.paymentmethod ? credit_card.paymentmethod.key : '';
        let credit_card_number =
            (credit_card && credit_card.ccnumber && credit_card.ccnumber.replace(/\*/g, '')) || '';
        let gift_certificate_ending = '';
        const payment_method: any = credit_card_payment_method_key
            ? _.findWhere(payment_methods, { key: credit_card_payment_method_key })
            : _.findWhere(payment_methods, {
                  internalid: credit_card_payment_method_internalid
              });
        let icon = payment_method && payment_method.imagesrc && payment_method.imagesrc[0];
        let name = this.model.get('name') || Utils.translate('Not specified');

        if (is_credit_card_token) {
            const { paymentmethod } = credit_card;
            icon = paymentmethod && paymentmethod.imagesrc && paymentmethod.imagesrc[0];
            credit_card_number = credit_card.cardlastfourdigits;
            name = paymentmethod.name;
            credit_card_payment_method_name = paymentmethod.name;
            credit_card.ccexpiredate = credit_card.cardexpirationdate;
        }
        if (is_gift_certificate) {
            const code_length = this.model.get('giftcertificate').code.length;
            gift_certificate_ending = this.model
                .get('giftcertificate')
                .code.substring(code_length - 4, code_length);
        }

        // @class GlobalViews.FormatPaymentMethod.View.Context
        return {
            // @property {Object} model
            model: this.model,
            // @property {Boolean} showStreet
            showStreet: this.model.get('ccstreet') && this.showBillingInfo,
            // @property {Boolean} showZipCode
            showZipCode: this.model.get('cczipcode') && this.showBillingInfo,
            // @property {Boolean} isCreditcard
            isCreditcard: !!is_credit_card || !!is_credit_card_token,
            // @property {Boolean} isCreditcardToken
            isCreditcardToken: !!is_credit_card_token,
            // @property {Boolean} isGiftCertificate
            isGiftCertificate: is_gift_certificate,
            // @property {Boolean} isPaypal
            isPaypal: is_paypal,
            // @property {Boolean} isInvoice
            isInvoice: is_invoice,
            // @property {Boolean} isOther
            isOther:
                !is_invoice &&
                !is_paypal &&
                !is_credit_card &&
                !is_gift_certificate &&
                !is_credit_card_token,
            // @property {String} type
            type: this.model.get('type') || Utils.translate('Not specified'),
            // @property {String} name
            name: name,
            // @property {String} creditCardNumberEnding
            creditCardNumberEnding: credit_card_number,
            // @property {String} showCreditCardImage
            showCreditCardImage: !!icon,
            // @property {String} creditCardImageUrl
            creditCardImageUrl: icon || '',
            // @property {String} creditCardPaymentMethodName
            creditCardPaymentMethodName: credit_card_payment_method_name,
            // @property {Object} creditCard: credit_card
            creditCard: credit_card,
            // @property {String} giftCertificateEnding
            giftCertificateEnding: gift_certificate_ending,
            // @property {String} mask
            mask: credit_card && credit_card.mask,
            // @property {String} showPurchaseNumber
            showPurchaseNumber: !!this.model.get('purchasenumber')
        };
    }
});

export = GlobalViewsFormatPaymentMethodView;
