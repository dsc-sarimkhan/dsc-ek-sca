/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CustomerPayment.Details.View"/>
// @module CustomerPayment

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import * as customer_payment_details_tpl from 'customer_payment_details.tpl';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import RecordViewsView = require('../../RecordViews/JavaScript/RecordViews.View');
import GlobalViewsFormatPaymentMethodView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.FormatPaymentMethod.View');
import CustomerPaymentModel = require('./CustomerPayment.Model');
import AjaxRequestsKiller = require('../../../Commons/AjaxRequestsKiller/JavaScript/AjaxRequestsKiller');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');

const CustomerPaymentDetailsView: any = BackboneView.extend({
    template: customer_payment_details_tpl,

    title: Utils.translate('Payment Details'),

    page_header: Utils.translate('Payment Details'),

    attributes: {
        id: 'PaymentDetail',
        class: 'PaymentDetails'
    },

    initialize: function(options) {
        const internalid = options.routerArguments[0];

        this.model = new CustomerPaymentModel({ internalid: internalid });
        this.model.on('change', this.showContent, this);

        this.application = options.application;
    },

    beforeShowContent: function beforeShowContent() {
        return this.model.fetch({
            killerId: AjaxRequestsKiller.getKillerId()
        });
    },

    // @method getSelectedMenu
    getSelectedMenu: function() {
        return 'transactionhistory';
    },
    // @method getBreadcrumbPages
    getBreadcrumbPages: function() {
        return [
            {
                text: Utils.translate('Transaction History'),
                href: '/transactionhistory'
            },
            {
                text: Utils.translate('Payment #$(0)', this.model.get('tranid')),
                href: '/transactionhistory/customerpayment/' + this.model.get('internalid')
            }
        ];
    },

    render: function() {
        this.payment_method =
            this.model.get('paymentmethods') &&
            this.model.get('paymentmethods').findWhere({ primary: true });

        BackboneView.prototype.render.apply(this, arguments);
    },

    childViews: {
        'Invoices.Collection': function() {
            const records_collection = new Backbone.Collection(
                _.map(this.model.get('invoices'), function(invoice: any) {
                    const model = new Backbone.Model({
                        touchpoint: 'customercenter',
                        title: invoice.refnum
                            ? Utils.translate('Invoice #$(0)', invoice.refnum)
                            : Utils.translate('Journal'),
                        detailsURL: invoice.refnum ? '/invoices/' + invoice.internalid : '',

                        isNavigable: !!invoice.refnum,

                        id: invoice.id,
                        internalid: invoice.id,

                        columns: [
                            {
                                label: Utils.translate('Date:'),
                                type: 'date',
                                name: 'date',
                                value: invoice.applydate
                            },
                            {
                                label: Utils.translate('Disc:'),
                                type: 'discount',
                                name: 'discount',
                                value: invoice.disc_formatted
                            },
                            {
                                label: Utils.translate('Amount:'),
                                type: 'currency',
                                name: 'amount',
                                value: invoice.amount_formatted
                            }
                        ]
                    });

                    return model;
                })
            );

            return new BackboneCollectionView({
                childView: RecordViewsView,
                collection: records_collection,
                viewsPerRow: 1,
                childViewOptions: {
                    layoutColumns: 4
                }
            });
        },
        PaymentMethod: function() {
            return new GlobalViewsFormatPaymentMethodView({ model: this.payment_method });
        }
    },

    // @method getContext @return CustomerPayment.Details.View.Context
    getContext: function() {
        // @class CustomerPayment.Details.View.Context
        return {
            // @property {String} tranId
            tranId: this.model.get('tranid'),
            // @property {String} paymentFormatted
            paymentFormatted: this.model.get('payment_formatted'),
            // @property {String} tranDate
            tranDate: this.model.get('trandate'),
            // @property {String} status
            status: this.model.get('status').internalid,
            // @property {String} memo
            memo: this.model.get('memo'),
            // @property {Boolean} collapseElements
            collapseElements: Configuration.get('sca.collapseElements'),
            // @property {Boolean} showInvoices
            showInvoices: !!(this.model.get('invoices') && this.model.get('invoices').length),
            // @property {Boolean} showPaymentMethod
            showPaymentMethod: !!(this.payment_method && this.payment_method.get('type')),
            // @property {Boolean} showMemo
            showMemo: !!this.model.get('memo'),
            // @property {String} downloadPDFURL
            downloadPDFURL: Utils.getDownloadPdfUrl({
                asset: 'customer-payment-details',
                id: this.model.get('internalid')
            }),
            // @property {Boolean} showOpenedAccordion
            showOpenedAccordion: Utils.isTabletDevice() || Utils.isDesktopDevice(),
            // @property {Boolean} showPaymentEventFail
            showPaymentEventFail: this.model.get('paymenteventholdreason') === 'FORWARD_REQUESTED',
            // @property {String} redirectUrl
            redirectUrl: this.model.get('redirecturl')
        };
    }
});

export = CustomerPaymentDetailsView;
