/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CreditMemo.Details.View"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as credit_memo_details_tpl from 'credit_memo_details.tpl';

import Backbone = require('../../Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');
import CreditMemoModel = require('./CreditMemo.Model');
import AjaxRequestsKiller = require('../../AjaxRequestsKiller/JavaScript/AjaxRequestsKiller');
import BackboneCollectionView = require('../../Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import TransactionLineViewsCellNavigableView = require('../../Transaction.Line.Views/JavaScript/Transaction.Line.Views.Cell.Navigable.View');
import RecordViewsView = require('../../Utilities/JavaScript/RecordViewsView');

const CreditMemoDetailsView: any = BackboneView.extend({
    template: credit_memo_details_tpl,

    title: Utils.translate('Credit Memo Details'),

    page_header: Utils.translate('Credit Memo Details'),

    attributes: {
        id: 'CreditMemoDetail',
        class: 'CreditMemoDetails'
    },

    initialize: function(options) {
        const internalid = options.routerArguments[0];

        this.model = new CreditMemoModel({ internalid: internalid });
        this.model.on('change', this.showContent, this);
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
                href: 'transactionhistory'
            },
            {
                text: Utils.translate('Credit Memo #$(0)', this.model.get('tranid')),
                href: 'transactionhistory/creditmemo/' + this.model.get('internalid')
            }
        ];
    },

    // @method getItemsNumber
    getItemsNumber: function() {
        let items_quantity = 0;
        this.model.get('lines').each(function(models) {
            items_quantity += models.get('quantity');
        });

        return items_quantity;
    },

    childViews: {
        'Items.Collection': function() {
            return new BackboneCollectionView({
                collection: this.model.get('lines'),
                childView: TransactionLineViewsCellNavigableView,
                viewsPerRow: 1,
                childViewOptions: {
                    navigable: !this.options.application.isStandalone,

                    detail1Title: Utils.translate('Quantity:'),
                    detail1: 'quantity',

                    detail2Title: Utils.translate('Unit price'),
                    detail2: 'rate_formatted',

                    detail3Title: Utils.translate('Amount:'),
                    detail3: 'total_formatted'
                }
            });
        },
        'Invoices.Collection': function() {
            const records_collection = new Backbone.Collection(
                _.map(this.model.get('invoices'), function(invoice: any) {
                    const model = new Backbone.Model({
                        touchpoint: 'customercenter',
                        title: invoice.refnum,
                        detailsURL: '/invoices/' + invoice.internalid,

                        id: invoice.id,
                        internalid: invoice.id,

                        columns: [
                            {
                                label: Utils.translate('Transaction Date'),
                                type: 'date',
                                name: 'date',
                                value: invoice.applydate
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
                viewsPerRow: 1
            });
        }
    },

    // @method getContext @return CreditMemo.Details.View.Context
    getContext: function() {
        const items_quantity = this.getItemsNumber();

        // @class CreditMemo.Details.View.Context
        return {
            // @property {String} tranId
            tranId: this.model.get('tranid'),
            // @property {String} totalFormatted
            totalFormatted: this.model.get('summary').total_formatted,
            // @property {String} tranDate
            tranDate: this.model.get('trandate'),
            // @property {String} status
            status: this.model.get('status').internalid,
            // @property {String} subTotalFormatted
            subTotalFormatted: this.model.get('summary').subtotal_formatted,
            // @property {String} discountFormatted
            discountFormatted: this.model.get('summary').discounttotal_formatted,
            // @property {String} taxTotalFormatted
            taxTotalFormatted: this.model.get('summary').taxtotal_formatted,
            // @property {String} amountPaidFormatted
            amountPaidFormatted: this.model.get('amountpaid_formatted'),
            // @property {String} amountRemainingFormatted
            amountRemainingFormatted: this.model.get('amountremaining_formatted'),
            // @property {String} shippingCostFormatted
            shippingCostFormatted: this.model.get('summary').shippingcost_formatted,
            // @property {String} downloadPDFURL
            downloadPDFURL: Utils.getDownloadPdfUrl({
                asset: 'credit-memo-details',
                id: this.model.get('internalid')
            }),
            // @property {String} memo
            memo: this.model.get('memo'),
            // @property {Boolean} showMemoDetails
            showMemoDetails: this.model.get('memo'),
            // @property {Number} itemsQuantityNumber
            itemsQuantityNumber: items_quantity,
            // @property {Boolean} linesitemsNumberGreaterThan1
            linesitemsNumberGreaterThan1: items_quantity > 1,
            // @property {Boolean} showInvoicesDetails
            showInvoicesDetails: !!(this.model.get('invoices') && this.model.get('invoices').length)
        };
    }
});

export = CreditMemoDetailsView;
