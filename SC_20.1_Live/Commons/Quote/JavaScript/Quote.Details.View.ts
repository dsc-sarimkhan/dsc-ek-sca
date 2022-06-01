/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Quote.Details.View"/>
/// <reference path="../../Utilities/JavaScript/UnderscoreExtended.d.ts" />

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as quote_details_tpl from 'quote_details.tpl';

import Configuration = require('../../Utilities/JavaScript/SC.Configuration');
import TransactionLineViewsCellNavigableView = require('../../Transaction.Line.Views/JavaScript/Transaction.Line.Views.Cell.Navigable.View');
import AddressDetailsView = require('../../Address/JavaScript/Address.Details.View');
import QuoteModel = require('./Quote.Model');
import BackboneCollectionView = require('../../Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');
import AjaxRequestsKiller = require('../../AjaxRequestsKiller/JavaScript/AjaxRequestsKiller');
import UrlHelper = require('../../UrlHelper/JavaScript/UrlHelper');

import QuoteToSalesOrderWizardConfiguration = require('../../Utilities/JavaScript/QuoteToSalesOrderWizard.Configuration');

// @class Quote.Details.View @extends Backbone.View
export = BackboneView.extend({
    // @property {Function} template
    template: quote_details_tpl,

    // @property {String} title
    title: Utils.translate('Quote Details'),

    // @property {class: String} attributes
    attributes: {
        id: 'QuotesDetail',
        class: 'QuoteDetails'
    },

    // @method initialize
    // @param {application: ApplicationSkeleton} options
    // @return {Void}
    initialize: function(options): void {
        this.application = options.application;
        this.model = new QuoteModel({
            internalid: options.routerArguments[0]
        });

        // @property {Quote.Details.View.ErrorMessages} statusTranslationKeys
        this.statusTranslationKeys = {
            INVALIDPERMISSION: Utils.translate('Not allowed'),
            INVALIDENTITYSTATUS: Utils.translate('Sales representative approval'),
            MISSINGSHIPMETHOD: Utils.translate('Shipping information'),
            MISSINGSHIPADDRESS: Utils.translate('Shipping information'),
            GIFTCERTIFICATENOTALLOWED: Utils.translate('Gift Certificate not allowed'),
            MISSINGSALESREP: Utils.translate('Sales Representative assigned')
        };
    },

    beforeShowContent: function beforeShowContent() {
        return this.model.fetch({
            killerId: AjaxRequestsKiller.getKillerId()
        });
    },

    // @method getSelectedMenu
    // @return {String}
    getSelectedMenu: function() {
        return 'quotes';
    },

    // @method getBreadcrumbPages
    // @return {Array<BreadcrumbPage>} Override breadcrumbs titles
    getBreadcrumbPages: function() {
        return [
            {
                text: Utils.translate('Quotes'),
                href: '/quotes'
            },
            {
                text: Utils.translate('Quote #$(0)', this.model.get('tranid') || ''),
                href: '/quotes'
            }
        ];
    },

    // @method showContent Override default showContent in order to obtain in one single execution data from the model
    // @return {jQuery.Promise<Quote.Details.View>}
    showContent: function() {
        const self = this;
        this.billaddress = this.model.get('addresses').get(this.model.get('billaddress'));
        this.shipaddress = this.model.get('addresses').get(this.model.get('shipaddress'));

        const first_step = _.first(
            _.flatten(_.pluck(QuoteToSalesOrderWizardConfiguration.steps || [], 'steps'))
        );
        this.reviewQuoteURL = (first_step && first_step.url) || '';
        this.reviewQuoteURL = UrlHelper.setUrlParameter(
            this.reviewQuoteURL,
            'quoteid',
            this.model.id
        );

        this.model.get('purchasablestatus').validationErrors = _.reject(
            this.model.get('purchasablestatus').validationErrors,
            function(error_code) {
                if (error_code === 'GIFTCERTIFICATENOTALLOWED') {
                    self.showGiftCertificateMessage = true;
                    return true;
                }
                return false;
            }
        );

        return (<any>BackboneView.prototype).showContent.apply(this, arguments);
    },

    // @property {ChildViews} childViews
    childViews: {
        'Items.Collection': function() {
            return new BackboneCollectionView({
                collection: this.model.get('lines'),
                childView: TransactionLineViewsCellNavigableView,
                viewsPerRow: 1,
                childViewOptions: {
                    navigable: !this.options.application.isStandalone,

                    detail1Title: Utils.translate('Qty:'),
                    detail1: 'quantity',

                    detail2Title: Utils.translate('List price:'),
                    detail2: 'rate_formatted',

                    detail3Title: Utils.translate('Amount:'),
                    detail3: 'total_formatted'
                }
            });
        },
        'Billing.Address': function() {
            return new AddressDetailsView({
                model: this.billaddress,
                hideDefaults: true,
                hideActions: true,
                hideSelector: true
            });
        }
    },

    // @method _generateErrorMessages is an internal method used to get error message from the error code
    // @return {Array<String>}
    _generateErrorMessages: function() {
        const self = this;
        const results = _.map(this.model.get('purchasablestatus').validationErrors, function(
            error_key: string
        ) {
            return self.statusTranslationKeys[error_key] || Utils.translate('Unknown error');
        });

        // If there two or more messages equal, this make a unique message
        return _.uniq(results);
    },

    // @method getContext
    // @return {Quote.Details.View.Context}
    getContext: function() {
        const lineItemsLength = _.reduce(
            this.model.get('lines').pluck('quantity'),
            function(accum: number, quantity: number) {
                return accum + quantity;
            },
            0
        );

        // @class Quote.Details.View.Context
        return {
            // @property {String} tranid
            tranid: this.model.get('tranid') || '',
            // @property {Quote.Model} model
            model: this.model,
            // @property {Number} lineItemsLength
            lineItemsLength: lineItemsLength,
            // @property {String} entityStatusName
            entityStatusName:
                (this.model.get('entitystatus') && this.model.get('entitystatus').name) || '',
            // @property {String} pdfUrl
            pdfUrl: Utils.getDownloadPdfUrl({
                asset: 'quote-details',
                id: this.model.get('internalid')
            }),
            // @property {String} reviewQuoteURL
            reviewQuoteURL: this.reviewQuoteURL,
            // @property {Boolean} showPromocode
            showPromocode: !!this.model.get('promocode'),
            // @property {Boolean} showPromocode
            showDiscount: !!this.model.get('discount'),
            // @property {Boolean} showBillingAddress
            showBillingAddress: !!this.billaddress,
            // @property {Boolean} showMessage
            showMessage: !!this.model.get('message'),
            // @property {String} message
            message: this.model.get('message'),
            // @property {Boolean} showMemo
            showMemo: !!this.model.get('memo'),
            // @property {String} memo
            memo: this.model.get('memo'),
            // @property {Boolean} collapseElements
            collapseElements: Configuration.get('sca.collapseElements'),
            // @property {Transaction.Model.Get.Summary} summary
            summary: this.model.get('summary'),
            // @property {String} duedate
            duedate: this.model.get('duedate') || '',
            // @property {Boolean} hasDuedate
            hasDuedate: !!this.model.get('duedate'),
            // @property {Boolean} showSalesRepInformation
            hasSalesrep: !!(this.model.get('salesrep') && this.model.get('salesrep').fullname),
            // @property {Boolean} showSalesRepInformation Name
            salesrepName: this.model.get('salesrep') && this.model.get('salesrep').fullname,
            // @property {Boolean} showSalesRepInformation Phone
            salesrepPhone:
                (this.model.get('salesrep') && this.model.get('salesrep').phone) ||
                Configuration.get('quote.defaultPhone'),
            // @property {Boolean} showSalesRepInformation Email
            salesrepEmail:
                (this.model.get('salesrep') && this.model.get('salesrep').email) ||
                Configuration.get('quote.defaultEmail'),
            // @property {String} disclaimerSummaryº configurable HTML string
            disclaimerSummary: Utils.translate(Configuration.get('quote.disclaimerSummary', '')),
            // @property {String} disclaimer configurable HTML string
            disclaimer: Utils.translate(Configuration.get('quote.disclaimer', '')),
            // @property {Array<String>} purchaseValidationErrors
            purchaseValidationErrors: this._generateErrorMessages(),
            // @property {Boolean} isOpen
            isOpen: this.model.get('isOpen') && !Configuration.get('isBasic'),
            // @property {Boolean} showOpenedAccordion
            showOpenedAccordion: Utils.isTabletDevice() || Utils.isDesktopDevice(),
            // @property {Boolean} hasPermission
            hasPermission: this.model.get('allowToPurchase'),
            // @property {Boolean} showHandlingCost
            showHandlingCost: !!this.model.get('summary').handlingcost,
            // @property {Boolean} showGiftCertificateMessage
            showGiftCertificateMessage: this.showGiftCertificateMessage,
            // @property {Boolean} hasPermissionAndHasErrors
            hasPermissionAndHasErrors:
                this.model.get('allowToPurchase') && this._generateErrorMessages().length,
            // @property {Boolean} showQuoteStatus
            showQuoteStatus: !!(
                this.model.get('entitystatus') && this.model.get('entitystatus').name
            )
        };

        // @class Quote.Details.View
    }
});

// @class Quote.Details.View.ErrorMessages
// In this object each key is the error code and each value is the transalte message
// This object is used as a dictionary for error that came form the backend
