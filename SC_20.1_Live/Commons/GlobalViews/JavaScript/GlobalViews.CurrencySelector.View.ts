/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="GlobalViews.CurrencySelector.View"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended" />

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';

import * as global_views_currency_selector_tpl from 'global_views_currency_selector.tpl';

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');
import Configuration = require('../../../Advanced/SCA/JavaScript/SC.Configuration');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import Session = require('../../../Commons/Session/JavaScript/Session');

// @class GlobalViews.CurrencySelector.View @extends Backbone.View
const GlobalViewsCurrencySelectorView = BackboneView.extend({
    template: global_views_currency_selector_tpl,

    events: {
        'change select[data-toggle="currency-selector"]': 'setCurrency',
        'click select[data-toggle="currency-selector"]': 'currencySelectorClick'
    },

    // @method initialize
    initialize: function() {
        const self = this;

        ProfileModel.getPromise().done(function() {
            self.isCustomer = ProfileModel.getInstance().get('customer');
            self.render();
        });
    },

    // @method currencySelectorClick @param {HTMLEvent} e
    currencySelectorClick: function(e) {
        e.stopPropagation();
    },

    // @method setCurrency @param {HTMLEvent} e
    setCurrency: function(e) {
        const currency_code = this.$(e.target).val();
        const selected_currency = _.find(SC.ENVIRONMENT.availableCurrencies, function(
            currency: any
        ) {
            return currency.code === currency_code;
        });

        window.location.href = Utils.addParamsToUrl(
            Session.get('touchpoints.' + Configuration.get('currentTouchpoint')),
            { cur: selected_currency.code }
        );
    },

    // @method getContext
    // @return {GlobalViews.CurrencySelector.View.Context}
    getContext: function() {
        const sessionCurrency = SC.getSessionInfo('currency');
        const currentCurrency = sessionCurrency || SC.ENVIRONMENT.currentCurrency;
        const available_currencies = _.map(SC.ENVIRONMENT.availableCurrencies, function(
            currency: any
        ) {
            // @class GlobalViews.CurrencySelector.View.Context.Currency
            return {
                // @property {String} code
                code: currency.code,
                // @property {String} internalId
                internalId: currency.internalid,
                // @property {String} isDefault
                isDefault: currency.isdefault,
                // @property {String} symbol
                symbol: currency.symbol,
                // @property {Boolean} symbolPlacement
                symbolPlacement: currency.symbolplacement,
                // @property {String} displayName
                displayName: currency.title || currency.name,
                // @property {Boolean} isSelected
                isSelected: currentCurrency.code === currency.code
            };
        });

        // @class GlobalViews.CurrencySelector.View.Context
        return {
            // @property {Boolean} showCurrencySelector
            showCurrencySelector: !!(
                SC.ENVIRONMENT.availableCurrencies && SC.ENVIRONMENT.availableCurrencies.length > 1
            ),
            // @property {Array<GlobalViews.CurrencySelector.View.Context.Currency>} availableCurrencies
            availableCurrencies: available_currencies || [],
            // @property {String} currentCurrencyCode
            currentCurrencyCode: SC.ENVIRONMENT.currentCurrency.code,
            // @property {String} currentCurrencySymbol
            currentCurrencySymbol: sessionCurrency.symbol,
            // @property {Boolean} isDisabled
            isDisabled: this.isCustomer
        };
    }
});

export = GlobalViewsCurrencySelectorView;
