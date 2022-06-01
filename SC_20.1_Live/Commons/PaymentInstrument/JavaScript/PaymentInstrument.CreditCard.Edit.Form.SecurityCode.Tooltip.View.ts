/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PaymentInstrument.CreditCard.Edit.Form.SecurityCode.Tooltip.View"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as creditcard_edit_form_securitycode_tootltip from 'paymentinstrument_creditcard_edit_form_securitycode_tooltip.tpl';

import Configuration = require('../../../Advanced/SCA/JavaScript/SC.Configuration');
import ProfileModel = require('../../Profile/JavaScript/Profile.Model');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// @class PaymentInstrument.CreditCard.Edit.Form.SecurityCode.Tooltip.View @extends Backbone.View
const PaymentInstrumentCreditCardEditFormSecurityCodeTooltipView: any = BackboneView.extend({
    template: creditcard_edit_form_securitycode_tootltip,

    // @method getAvailableCreditcards
    getAvailableCreditcards: function() {
        // Creditcards
        const creditcards = [];
        const user_creditcards = ProfileModel.getInstance().get('paymentmethods');

        user_creditcards.each(function(user_cc) {
            creditcards.push(user_cc.get('paymentmethod').name);
        });

        if (!creditcards.length) {
            const available_creditcards = _.where(
                Configuration.get('siteSettings.paymentmethods'),
                {
                    creditcard: 'T',
                    ispaypal: 'F'
                }
            );

            _.each(available_creditcards, function(available_creditcard: any) {
                creditcards.push(available_creditcard.name);
            });
        }

        return _.unique(creditcards);
    },

    // @method getContext @return CreditCard.Edit.Form.SecurityCode.Tooltip.View.Context
    getContext: function() {
        const available_credit_cards = this.getAvailableCreditcards();

        // @class CreditCard.Edit.Form.SecurityCode.Tooltip.View.Context
        return {
            // @property {Boolean} isCreditCards
            isCreditCards: available_credit_cards.length > 0,
            // @property {Array<String>} availableCreditcards
            availableCreditcards: available_credit_cards,
            // @property {String} imageCvvAmericanCard
            imageCvvAmericanCardURL: Utils.getAbsoluteUrlOfNonManagedResources(
                Configuration.get('creditCard.imageCvvAmericanCard')
            ),
            // @property {String} imageCvvAllCards
            imageCvvAllCardsURL: Utils.getAbsoluteUrlOfNonManagedResources(
                Configuration.get('creditCard.imageCvvAllCards')
            ),
            // @property {Boolean} isVisaMasterOrDiscoverAvailable
            isVisaMasterOrDiscoverAvailable:
                _.indexOf(available_credit_cards, 'VISA') !== -1 ||
                _.indexOf(available_credit_cards, 'Master Card') !== -1 ||
                _.indexOf(available_credit_cards, 'Discover') !== -1,
            // @property {Boolean} isAmexAvailable
            isAmexAvailable: _.indexOf(available_credit_cards, 'American Express') !== -1
        };
    }
});

export = PaymentInstrumentCreditCardEditFormSecurityCodeTooltipView;
