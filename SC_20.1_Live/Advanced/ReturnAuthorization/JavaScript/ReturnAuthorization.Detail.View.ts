/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ReturnAuthorization.Detail.View"/>
// @module ReturnAuthorization.Detail.View

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as return_authorization_detail_tpl from 'return_authorization_detail.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import CancelView = require('./ReturnAuthorization.Cancel.View');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import ReturnAuthorizationModel = require('./ReturnAuthorization.Model');
import TransactionLineViewsCellNavigableView = require('../../../Commons/Transaction.Line.Views/JavaScript/Transaction.Line.Views.Cell.Navigable.View');
import RecordViewsView = require('../../RecordViews/JavaScript/RecordViews.View');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import AjaxRequestsKiller = require('../../../Commons/AjaxRequestsKiller/JavaScript/AjaxRequestsKiller');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class ReturnAuthorization.Detail.View @extend Backbone.View
const ReturnAuthorizationDetailView: any = BackboneView.extend({
    template: return_authorization_detail_tpl,

    title: Utils.translate('Return Details'),

    events: {
        'click [data-action="cancel"]': 'cancel'
    },

    attributes: {
        id: 'ReturnsDetail',
        class: 'ReturnAuthorizationDetail'
    },

    initialize: function(options) {
        this.application = options.application;
        this.model = new ReturnAuthorizationModel();
        this.routerArguments = options.routerArguments;
    },

    beforeShowContent: function beforeShowContent() {
        return this.model.fetch({
            data: { internalid: this.routerArguments[1], recordtype: this.routerArguments[0] },
            killerId: AjaxRequestsKiller.getKillerId()
        });
    },

    // @method getSelectedMenu
    getSelectedMenu: function() {
        return 'returns';
    },
    // @method getBreadcrumbPages
    getBreadcrumbPages: function() {
        return [
            {
                text: Utils.translate('Returns'),
                href: '/returns'
            },
            {
                text: Utils.translate('Return #$(0)', this.model.get('tranid')),
                href: '/returns'
            }
        ];
    },

    getRecordProperties: function() {
        const created_from = this.model.get('createdfrom');
        const is_basic = this.application.getConfig('isBasic');
        const properties = {
            record_url: '',
            record_label: Utils.translate('Invoice')
        };

        // site builder basic does not support invoice link
        if (!created_from || (is_basic && created_from.type === 'CustInvc')) {
            return properties;
        }

        switch (created_from.type) {
            case 'SalesOrd':
                properties.record_url = '/ordershistory/view/' + created_from.internalid;
                properties.record_label = Utils.translate('Order');
                break;

            case 'CashSale':
                properties.record_url = '/receiptshistory/view/' + created_from.internalid;
                properties.record_label = Utils.translate('Receipt');
                break;

            default:
                properties.record_url = '/invoices/' + created_from.internalid;
                properties.record_label = Utils.translate('Invoice');
        }

        return properties;
    },

    cancel: function() {
        new CancelView({
            application: this.application,
            model: this.model
        }).showInModal('returns');

        this.model.once('sync', jQuery.proxy(this, 'redirect'));
    },

    redirect: function() {
        Backbone.history.navigate('returns?cancel=' + this.model.get('internalid'), {
            trigger: true
        });
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
                    navigable: !this.application.isStandalone,

                    detail1Title: Utils.translate('Qty:'),
                    detail1: 'quantity',

                    detail2Title: Utils.translate('Reason:'),
                    detail2: 'reason',

                    detail3Title: Utils.translate('Amount:'),
                    detail3: 'total_formatted'
                }
            });
        },
        'Invoices.Collection': function() {
            const records_collection = this.model.get('applies').map(function(apply) {
                const is_invoice = apply.get('recordtype') === 'invoice';
                let title;

                if (is_invoice) {
                    title = Utils.translate('Invoice #$(0)', apply.get('tranid'));
                } else {
                    title =
                        apply.get('recordtype') +
                        (apply.get('tranid') ? ' #' + apply.get('tranid') : '');
                }

                return {
                    touchpoint: 'customercenter',
                    title: title,
                    detailsURL: is_invoice ? '/invoices/' + apply.get('internalid') : '',
                    tranid: apply.get('tranid'),
                    internalid: apply.get('internalid'),
                    columns: [
                        {
                            label: Utils.translate('Transaction Date'),
                            type: 'date',
                            name: 'date',
                            value: apply.get('applydate')
                        },
                        {
                            label: Utils.translate('Amount:'),
                            type: 'currency',
                            name: 'amount',
                            value: apply.get('amount_formatted')
                        }
                    ]
                };
            });

            return new BackboneCollectionView({
                childView: RecordViewsView,
                collection: records_collection,
                viewsPerRow: 1
            });
        }
    },

    // @method getDownloadPdfUrl @returns {String}
    getDownloadPdfUrl: function() {
        let pdfUrl = '';

        switch (this.model.get('recordtype')) {
            case 'creditmemo':
                pdfUrl = Utils.getDownloadPdfUrl({
                    asset: 'credit-memo-details',
                    id: this.model.get('internalid')
                });
                break;
            case 'returnauthorization':
                pdfUrl = Utils.getDownloadPdfUrl({
                    asset: 'return-details',
                    id: this.model.get('internalid')
                });
                break;
        }

        return pdfUrl;
    },

    // @method getContext @return ReturnAuthorization.Detail.View.Context
    getContext: function() {
        const lines_length = this.model.get('lines').length;
        const applies = this.model.get('applies');
        const items_quantity = this.getItemsNumber();

        // @class ReturnAuthorization.Detail.View.Context
        return {
            // @property {ReturnAuthorization.Model} model
            model: this.model,
            // @property {String} createdFromURL
            downloadPDFURL: this.getDownloadPdfUrl(),
            // @property {Boolean} isCancelable
            isCancelable: !!this.model.get('isCancelable'),
            // @property {Boolean} showCreatedFrom
            showCreatedFrom: !!(
                this.model.get('createdfrom') && this.model.get('createdfrom').internalid
            ),
            // @property {Boolean} showCreatedFromLink
            showCreatedFromLink: !!this.model.get('createdfrom').tranid,
            // @property {Boolean} isElementCollapsed
            isElementCollapsed: !!Configuration.get('sca.collapseElements'),
            // @property {Number} linesLength
            linesLength: lines_length,
            // @property {Boolean} showComment
            showComments: !!this.model.get('memo'),
            // @property {Boolean} showOpenedAccordion
            showOpenedAccordion: Utils.isTabletDevice() || Utils.isDesktopDevice(),
            // @property {Boolean} initiallyCollapsed
            initiallyCollapsed: Utils.isPhoneDevice() ? '' : 'in',
            // @property {Boolean} initiallyCollapsedArrow
            initiallyCollapsedArrow: Utils.isPhoneDevice() ? 'collapsed' : '',
            // @property {Boolean} linesLengthGreaterThan1
            linesLengthGreaterThan1: lines_length > 1,
            // @property {Number} itemsQuantityNumber
            itemsQuantityNumber: items_quantity,
            // @property {Boolean} linesitemsNumberGreaterThan1
            linesitemsNumberGreaterThan1: items_quantity > 1,
            // @property {Boolean} isCreditMemo
            showAppliesSection: this.model.get('recordtype') === 'creditmemo',
            // @property {Boolean} showDiscountTotal
            showDiscountTotal: !!this.model.get('summary').discounttotal,
            // @property {Boolean} showHandlingTotal
            showHandlingTotal: !!this.model.get('summary').handlingcost,
            // @property {Boolean} showShippingTotal
            showShippingTotal: !!this.model.get('summary').shippingcost,
            // @property {Boolean} showInvoicesDetails
            showInvoicesDetails: !!(applies && applies.length)
        };
    }
});

export = ReturnAuthorizationDetailView;
