/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Invoice.Details.View"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as invoice_details_tpl from 'invoice_details.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import LivePaymentModel = require('../../LivePayment/JavaScript/LivePayment.Model');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import AddressDetailsView = require('../../../Commons/Address/JavaScript/Address.Details.View');
import TransactionLineViewsCellNavigableView = require('../../../Commons/Transaction.Line.Views/JavaScript/Transaction.Line.Views.Cell.Navigable.View');
import InvoiceModel = require('./Invoice.Model');
import ReturnLinesCalculator = require('../../ReturnAuthorization/JavaScript/ReturnAuthorization.GetReturnableLines');
import OrderHistoryModel = require('../../OrderHistory/JavaScript/OrderHistory.Model');

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import AjaxRequestsKiller = require('../../../Commons/AjaxRequestsKiller/JavaScript/AjaxRequestsKiller');

// @class Invoice.Details.View @extends Backbone.View
const InvoiceDetailsView: any = BackboneView.extend({
    // @property {Function} template
    template: invoice_details_tpl,

    title: Utils.translate('Invoice Details'),

    // @property {Object} events
    events: {
        'click [data-type="make-a-payment"]': 'makeAPayment'
    },

    attributes: {
        id: 'InvoiceDetail',
        class: 'InvoiceDetail'
    },

    // @method initialize
    initialize: function(options): void {
        const self = this;
        const internalid = options.routerArguments[0];

        this.model = new InvoiceModel({ internalid: internalid });

        const { history } = Backbone;
        if (history.fragment.indexOf('transactionhistory/invoices/') === 0) {
            this.options.referrer = 'transactionhistory';

            this.model.on('change', this.showContent, this);
        } else if (options.routerArguments.length > 1) {
            this.options.referrer = options.routerArguments[1];
        }

        this.application = options.application;
        this.navSource = this.getNavSource(this.options.referrer);
        this.validLines = 0;
        this.livePaymentModel = LivePaymentModel.getInstance();
    },

    beforeShowContent: function beforeShowContent() {
        const self = this;

        const { history } = Backbone;
        if (history.fragment.indexOf('transactionhistory/invoices/') === 0) {
            return this.model.fetch({
                killerId: AjaxRequestsKiller.getKillerId()
            });
        }
        return this.model
            .fetch({
                killerId: AjaxRequestsKiller.getKillerId()
            })
            .then(function() {
                return self.isReturnable();
            });
    },

    // @method getNavSource Define the object that will be used by the breadcrumb
    // @param {String} referrer Option defined to record the navigation origin
    // @return {Invoice.Details.View.navSource}
    getNavSource: function(referrer: string) {
        const navSource: any = {};

        switch (referrer) {
            case 'paid-invoices':
                navSource.href = '/paid-invoices';
                navSource.text = Utils.translate('Invoices');
                navSource.menu = 'invoices';
                break;
            case 'transactionhistory':
                navSource.href = '/transactionhistory';
                navSource.text = Utils.translate('Transaction History');
                navSource.menu = 'transactionhistory';
                break;
            default:
                navSource.href = '/invoices';
                navSource.text = Utils.translate('Invoices');
                navSource.menu = 'invoices';
                break;
        }

        return navSource;
    },

    // @method getSelectedMenu Define the name of the menu option selected when displaying this view
    // @return {String}
    getSelectedMenu: function(): string {
        return (this.navSource && this.navSource.menu) || 'invoices';
    },

    // @method getBreadcrumbPages Define the content of the breadcrumb
    // @return {Array}
    getBreadcrumbPages: function(): { text: string; href: string }[] {
        return [
            {
                text: this.navSource.text,
                href: this.navSource.href
            },
            {
                text: Utils.translate('Invoice #$(0)', this.model.get('tranid')),
                href: '/invoices/view/' + this.model.get('internalid')
            }
        ];
    },

    // @method getItemsNumber
    getItemsNumber: function(): number {
        let items_quantity = 0;
        this.model.get('lines').each(function(models) {
            items_quantity += models.get('quantity');
        });

        return items_quantity;
    },

    // @method makeAPayment Mark the current invoice as selected (check) and start the payment wizard
    makeAPayment: function(): void {
        if (this.model.get('currency')) {
            const currency = this.model.get('currency').internalid;

            this.livePaymentModel.changeCurrency(currency);
        }

        LivePaymentModel.getInstance().selectInvoice(this.model.id);
    },

    // @method isReturnable Calculate based on the fulfillments and returns made, if the invoice accepts returns
    isReturnable: function() {
        const deferred = jQuery.Deferred();
        const self = this;
        const model = new OrderHistoryModel();

        model
            .fetch({
                data: {
                    internalid: this.model.get('createdfrom').internalid,
                    recordtype: this.model.get('createdfrom').recordtype
                },
                killerId: AjaxRequestsKiller.getKillerId()
            })
            .done(function() {
                const returnable_calculator = new ReturnLinesCalculator(model, {
                    notConsiderFulfillments: true
                });
                self.validLines = returnable_calculator.calculateLines().validLines.length;

                deferred.resolve();
            });

        return deferred.promise();
    },

    // @property {Object} childViews
    childViews: {
        'Billing.Address': function() {
            return new AddressDetailsView({
                model: this.model.get('addresses').get(this.model.get('billaddress')),
                hideDefaults: true,
                showSelect: false,
                hideActions: true,
                hideSelector: true
            });
        },

        'Items.Collection': function() {
            return new BackboneCollectionView({
                collection: this.model.get('lines'),
                childView: TransactionLineViewsCellNavigableView,
                viewsPerRow: 1,
                childViewOptions: {
                    navigable: !this.application.isStandalone,

                    detail1Title: Utils.translate('Qty:'),
                    detail1: 'quantity',

                    detail2Title: Utils.translate('Unit price:'),
                    detail2: 'rate_formatted',

                    detail3Title: Utils.translate('Amount:'),
                    detail3: 'total_formatted'
                }
            });
        }
    },

    // @method getContext @returns Invoice.Details.View.Context
    getContext: function() {
        let payments = this.model.get('adjustments').where({ recordtype: 'customerpayment' });
        const credit_memos = this.model.get('adjustments').where({ recordtype: 'creditmemo' });
        const deposit_applications = this.model
            .get('adjustments')
            .where({ recordtype: 'depositapplication' });
        const show_adjustments = this.model.get('adjustments').length;
        const is_open = this.model.get('status').internalid === 'open';
        const paymentmethod =
            this.model.get('paymentmethods') &&
            this.model.get('paymentmethods').findWhere({ primary: true });
        const lines = this.model.get('lines');
        const items_quantity = this.getItemsNumber();
        const self = this;

        payments = _.map(payments, function(payment: any) {
            return {
                tranid: payment.tranid,
                trandate: payment.trandate,
                internalid: payment.internalid,
                amount: payment.amount,
                amount_formatted: Utils.formatCurrency(
                    payment.amount,
                    self.model.get('selected_currency')
                        ? self.model.get('selected_currency').symbol
                        : ''
                )
            };
        });

        // @class Invoice.Details.View.Context
        return {
            // @property {Invoice.Model} model
            model: this.model,
            // @property {String} makeAPaymentPermissions
            makeAPaymentPermissions: 'transactions.tranCustPymt.2, transactions.tranCustInvc.1',
            // @property {Boolean} showInModal
            showInModal: !!this.inModal,
            // @property {String} donwloadPdfUrl
            donwloadPdfUrl: Utils.getDownloadPdfUrl({
                asset: 'invoice-details',
                id: this.model.get('internalid')
            }),
            // @property {String} pageTitle
            pageTitle: Utils.translate(
                'Invoice <span class="strong-text">#$(0)</span>',
                this.model.get('order_number')
            ),
            // @property {Boolean} isOpen
            isOpen: is_open,
            // @property {Boolean} showCreatedFrom
            showCreatedFrom: !!(
                this.model.get('createdfrom') && this.model.get('createdfrom').internalid
            ),
            // @property {Boolean} showDueDate
            showDueDate: !!this.model.get('dueDate'),
            // @property {Boolean} showSaleRep
            showSaleRep: !!this.model.get('salesrep'),
            // @property {Boolean} showSaleRepPhone
            showSaleRepPhone: !!(this.model.get('salesrep') && this.model.get('salesrep').phone),
            // @property {Boolean} showSaleRepName
            showSaleRepEmail: !!(this.model.get('salesrep') && this.model.get('salesrep').email),
            // @property {String} siteName
            siteName: this.application.getConfig('siteSettings.displayname'),
            // @property {Boolean} showMemo
            showMemo: !!this.model.get('memo'),
            // @property {Boolean} showTerms
            showTerms: !!(paymentmethod && paymentmethod.get('paymentterms')),
            // @property {String} termsName
            termsName:
                (paymentmethod &&
                    paymentmethod.get('paymentterms') &&
                    paymentmethod.get('paymentterms').name) ||
                '',
            // @property {Boolean} showDiscountSummary
            showDiscountSummary: !!this.model.get('summary').discounttotal,
            // @property {Boolean} showGiftcerticate
            showGiftcerticate: !!this.model.get('summary').giftcertapplied,
            // @property {Boolean} showAdjustments
            showAdjustments: show_adjustments,
            // @property {Boolean}
            showMakeAPaymentButton: !!(is_open && !this.inModal),
            // @property {Boolean} showBillingAddress
            showBillingAddress: !!this.model.get('addresses').get(this.model.get('billaddress')),
            // @property {Array} payments
            payments: payments,
            // property {Boolean} showPayments
            showPayments: !!payments.length,
            // @property {Array} payments
            creditMemos: credit_memos,
            // property {Boolean} showCreditMemos
            showCreditMemos: !!credit_memos.length,
            // @property {Array} depositApplications
            depositApplications: deposit_applications,
            // property {Boolean} showCreditMemos
            showDepositApplications: !!deposit_applications.length,
            // @property {Boolean} showLines
            showLines: !!lines.length,
            // @property {Boolean} linesLengthGreaterThan1
            linesLengthGreaterThan1: lines.length > 1,
            // @property {Number} itemsQuantityNumber
            itemsQuantityNumber: items_quantity,
            // @property {Boolean} linesitemsNumberGreaterThan1
            linesitemsNumberGreaterThan1: items_quantity > 1,
            // @property {OrderLine.Collection} lines
            lines: lines,
            // @property {Boolean} showOpenedAccordion
            showOpenedAccordion: Utils.isTabletDevice() || Utils.isDesktopDevice(),
            // @property {Boolean} showRequestReturnButton
            showRequestReturnButton: !!this.validLines
        };
    }
});

export = InvoiceDetailsView;
