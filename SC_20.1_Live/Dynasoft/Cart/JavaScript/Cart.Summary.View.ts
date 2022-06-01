/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Cart.Summary.View"/>

import * as _ from 'underscore';
import * as cart_summary_tpl from 'cart_summary.tpl';
import * as cart_summary_gift_certificate_cell_tpl from 'cart_summary_gift_certificate_cell.tpl';

import CartPromocodeFormView = require('../../Cart/JavaScript/Cart.PromocodeForm.View');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import GlobalViewsFormatPaymentMethodView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.FormatPaymentMethod.View');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import CartPromocodeListView = require('./Cart.Promocode.List.View');
import Session = require('../../../Commons/Session/JavaScript/Session');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import Configuration = require('../../../Commons/Utilities/JavaScript/SC.Configuration');
import GlobalViewsMessageView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Message.View');
import { isPaymentMethodAvailable } from '../../DSCUtilities/JavaScript/DSCUtilities';
// @class Cart.Summary.View @extends Backbone.View
export = BackboneView.extend({
    // @property {Function} template
    template: cart_summary_tpl,

    // @method initialize
    initialize: function initialize(options) {
        this.upsell=false;
        this.model = options.model;
        BackboneCompositeView.add(this);

        this.promocodeFormComponent = new CartPromocodeFormView({
            model: this.model,
            application: this.options.application
        });
        if(window.location.href.indexOf('upsell')!=-1)
        {
            this.upsell=true;
        }
    },

    // @property {Object} childViews
    childViews: {
        'Cart.PromocodeFrom': function() {
            return this.promocodeFormComponent;
        },

        CartPromocodeListView: function() {
            return new CartPromocodeListView({
                model: this.model,
                isReadOnly: false
            });
        },

        GiftCertificates: function() {
            const gift_certificates =
                this.model.get('paymentmethods').where({ type: 'giftcertificate' }) || [];

            return new BackboneCollectionView({
                collection: gift_certificates,
                cellTemplate: cart_summary_gift_certificate_cell_tpl,
                viewsPerRow: 1,
                childView: GlobalViewsFormatPaymentMethodView,
                rowTemplate: null
            });
        }
    },

    // @method getUrlLogin
    // @return {String}
    getUrlLogin: function getUrlLogin() {
        let login = Session.get('touchpoints.login');
        const currentTouchpoint =
            this.model.application && this.model.application.Configuration.currentTouchpoint
                ? this.model.application.Configuration.currentTouchpoint
                : 'home';

        login += '&origin=' + currentTouchpoint;

        if (this.$el.closest('.modal-product-detail').length > 0) {
            // we are in the quick view
            const hashtag = this.$el
                .closest('.modal-product-detail')
                .find('[data-name="view-full-details"]')
                .data('hashtag');
            login += '&origin_hash=' + encodeURIComponent(hashtag.replace('#/', ''));
        } else {
            login += '&origin_hash=' + encodeURIComponent(Backbone.history.fragment);
        }

        return login;
    },

    // @method getContext
    // @return {Cart.Summary.View.Context}
    getContext: function getContext() {
        let continueURL =
            Configuration.get('siteSettings.sitetype') === 'ADVANCED'
                ? Configuration.defaultSearchUrl
                : '';
        let is_wsdk = false;
        const summary = this.model.get('summary');
        const items_count = _.reduce(
            this.model.get('lines').pluck('quantity'),
            function(memo, quantity: any) {
                return memo + (parseFloat(quantity) || 1);
            },
            0
        );
        const shipping_address =
            this.model.get('addresses').get(this.model.get('shipaddress')) || new Backbone.Model();
        const default_country =
            shipping_address.get('country') || Configuration.get('siteSettings.defaultshipcountry');
        const shipping_zip_code = shipping_address.get('zip');
        const promocodes = this.model.get('promocodes') || [];
        const promocodes_applied = _.filter(promocodes, function(promo: any) {
            return (
                (promo.isautoapplied == true && promo.isvalid == true) ||
                promo.isautoapplied == false
            );
        });
        const gift_certificates =
            this.model.get('paymentmethods').where({ type: 'giftcertificate' }) || [];
        const is_single_country = _.size(Configuration.get('siteSettings.countries', [])) === 1;
        let is_zipcode_require;
        let selected_country;
        let countries_list;
        let is_estimated_shipping_valid;
        let show_estimation_form = true;
        const countries = _.clone(Configuration.get('siteSettings.countries'));

        // Determine if the Zip Code is required and just leave selected the current address
        if (countries && default_country && countries[default_country]) {
            selected_country = _.findWhere(countries, { selected: true });
            if (selected_country) {
                selected_country.selected = false;
            }

            countries[default_country].selected = true;
            is_zipcode_require = countries[default_country].isziprequired !== 'F';
            selected_country = countries[default_country];
            countries_list = _.toArray(countries);
        } else {
            selected_country = _.findWhere(countries, { selected: true });
            countries_list = _.toArray(countries);

            if (!selected_country) {
                selected_country = _.first(countries_list);
            }
            is_zipcode_require = selected_country.isziprequired !== 'F';
        }

        // Determine if the current address is valid (complete)
        if (_.isString(shipping_address.id) && shipping_address.id !== '-------null') {
            is_estimated_shipping_valid = is_zipcode_require
                ? !!shipping_zip_code
                : !!shipping_address.get('country');
        } else {
            is_estimated_shipping_valid = false;
        }

        // Check if WSDK is configured
        if (
            Configuration.get('siteSettings.iswsdk', false) &&
            Configuration.get('siteSettings.wsdkcancelcarturl')
        ) {
            continueURL = Configuration.get('siteSettings.wsdkcancelcarturl');
            is_wsdk = true;
        }

        // Calculate if the estimation form should be rendered or not
        if (
            Configuration.get('siteSettings.showshippingestimator') === 'F' ||
            (is_estimated_shipping_valid && is_zipcode_require)
        ) {
            show_estimation_form = false;
        }

        var self = this;
        let pivot = null;
        _.each(this.model.get('lines').models, function(model: {id:string}){
            if(self.model.get("lines").get(model.id) != undefined)
            {
            if(pivot == null){
                pivot = self.model.get("lines").get(model.id).get('fulfillmentChoice')
            };
            self.selectedFulfillmentChoice = self.model.get("lines").get(model.id).get('fulfillmentChoice');
            if(pivot != self.model.get("lines").get(model.id).get('fulfillmentChoice')){
                self.selectedFulfillmentChoice = false;
            }
            }
        });

        // @class Cart.Summary.View.Context
        return {
            // @property {LiveOrder.Model} model
            model: this.model,
            // @property {Boolean} isWSDK
            isWSDK: is_wsdk,
            // @property {String} continueURL
            continueURL: continueURL,
            // @property {Boolean} showActions
            showActions: true,
            // @property {Boolean} showLabelsAsEstimated
            showLabelsAsEstimated: true,
            // @property {Object} summary
            summary: summary,
            // @property {Number} itemCount
            itemCount: items_count,
            // @property {Boolean} isSingleItem
            isSingleItem: items_count === 1,
            // @property {Boolean} isZipCodeRequire
            isZipCodeRequire: is_zipcode_require,
            // @property {Boolean} showEstimate Shows or not the estimation form
            showEstimate: show_estimation_form,
            // @property {Boolean} showHandlingCost
            showHandlingCost: !!summary.handlingcost,
            // @property {Boolean} showGiftCertificates
            showGiftCertificates: !!summary.giftcertapplied,
            // @property {Boolean} showPromocodeForm
            showPromocodeForm:
                Configuration.get('promocodes.allowMultiples', true) || !promocodes_applied.length,
            // @property {Array} giftCertificates
            giftCertificates: gift_certificates,
            // @property {Boolean} showDiscountTotal
            showDiscountTotal: !!summary.discounttotal,
            // @property {String} defaultCountry
            defaultCountry: default_country,
            // @property {Boolean} isDefaultCountryUS
            isDefaultCountryUS: default_country === 'US',
            // @property {Array} countries
            countries: countries_list,
            // @property {Boolean} singleCountry
            singleCountry: is_single_country,
            // @property {String} singleCountryCode
            singleCountryCode: is_single_country ? countries_list[0].code : '',
            // @property {String} shipToText
            shipToText: shipping_zip_code || selected_country.name,
            // @property {String} singleCountryName
            singleCountryName: is_single_country ? countries_list[0].name : '',
            // @property {String} shippingZipCode
            shippingZipCode: shipping_zip_code || '',
            // @property {Boolean} showPaypalButton
            showPaypalButton:
                Configuration.get('siteSettings.checkout.paypalexpress.available', 'F') === 'T',
            // @property {String} paypalButtonImageUrl
            paypalButtonImageUrl: Configuration.get(
                'paypalButtonImageUrl',
                'https://www.paypalobjects.com/webstatic/en_US/i/buttons/checkout-logo-large.png'
            ),
            // @property {Boolean} showProceedButton
            showProceedButton: Configuration.get('siteSettings.sitetype') === 'STANDARD',
            // @property {String} urlLogin
            urlLogin: this.getUrlLogin(),
            // @property {Boolean} isPriceEnabled
            isPriceEnabled: !ProfileModel.getInstance().hidePrices(),
            // @property {Boolean} showPickupInStoreLabel
            showPickupInStoreLabel: this.model.getPickupInStoreLines().length > 0,
            // @property {Boolean} areAllItemsPickupable
            areAllItemsPickupable:
                this.model.getPickupInStoreLines().length === this.model.get('lines').length,
            // @property {String} summaryLabel
            taxLabel: Configuration.get('summaryTaxLabel')
                ? Configuration.get('summaryTaxLabel')
                : 'Tax',
            // @property {Boolean} hasShippingAddrress
            hasShippingAddrress: is_estimated_shipping_valid,
            selectedFulfillmentChoice:this.selectedFulfillmentChoice,
            upsell:this.upsell,
            origin:window.location.origin,
            // @property {Boolean} showAfterpayText
            showAfterpayText: isPaymentMethodAvailable("afterpay")
        };
        // @class Cart.Summary.View
    }
});
