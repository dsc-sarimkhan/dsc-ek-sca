/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Receipt.Details.View"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as receipt_details_tpl from 'receipt_details.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import OrderHistoryDetailsView = require('../../OrderHistory/JavaScript/OrderHistory.Details.View');
import GlobalViewsFormatPaymentMethodView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.FormatPaymentMethod.View');
import AddressView = require('../../../Commons/Address/JavaScript/Address.Details.View');
import ReceiptDetailsItemSummaryView = require('./Receipt.Details.Item.Summary.View');
import ReceiptDetailsItemActionsView = require('./Receipt.Details.Item.Actions.View');
import TransactionLineViewsCellActionableView = require('../../../Commons/Transaction.Line.Views/JavaScript/Transaction.Line.Views.Cell.Actionable.View');
import LiveOrderModel = require('../../../Commons/LiveOrder/JavaScript/LiveOrder.Model');
import GlobalViewsMessageView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Message.View');
import ReceiptModel = require('./Receipt.Model');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import AjaxRequestsKiller = require('../../../Commons/AjaxRequestsKiller/JavaScript/AjaxRequestsKiller');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');

// @class Receipt.Details.View Views for receipt's details #extend Backbone.View
const ReceiptDetailsView: any = OrderHistoryDetailsView.extend({
    template: receipt_details_tpl,

    title: Utils.translate('Receipt Details'),

    attributes: {
        id: 'OrderDetail',
        class: 'OrderDetailsView'
    },

    events: {
        'click [data-action="addToCart"]': 'addToCart'
    },

    initialize: function(options) {
        this.internalid = options.routerArguments[0];

        this.model = new ReceiptModel({ internalid: this.internalid });
        this.model.on('change', this.showContent, this);

        if (Backbone.history.fragment.indexOf('transactionhistory/cashsale/') === 0) {
            this.options.referrer = 'transactionhistory';
        }

        this.application = options.application;
    },

    beforeShowContent: function beforeShowContent() {
        return this.model.fetch({
            data: { internalid: this.internalid, recordtype: 'cashsale' },
            killerId: AjaxRequestsKiller.getKillerId()
        });
    },

    addToCart: function(event) {
        const target = jQuery(event.currentTarget);
        const selected_line = this.model.get('lines').get(target.data('line-id'));
        const quantity = target.data('partial-quantity') || target.data('item-quantity');
        const placeholder = target
            .closest('[data-type="order-item"]')
            .find('[data-type="alert-placeholder"]');

        LiveOrderModel.getInstance()
            .addLine(selected_line)
            .done(function() {
                const message =
                    quantity > 1
                        ? Utils.translate(
                              '$(0) Items successfully added to <a href="#" data-touchpoint="viewcart">your cart</a><br/>',
                              quantity
                          )
                        : Utils.translate(
                              'Item successfully added to <a href="#" data-touchpoint="viewcart">your cart</a><br/>'
                          );

                const alert = new GlobalViewsMessageView({
                    message: message,
                    type: 'success',
                    closable: true
                });

                alert.show(placeholder, 6000);
            });
    },

    // @method getSelectedMenu
    getSelectedMenu: function() {
        return this.options.referrer === 'transactionhistory'
            ? 'transactionhistory'
            : 'receiptshistory';
    },

    // @method getBreadcrumbPages
    getBreadcrumbPages: function() {
        const created_from = this.model.get('createdfrom');
        const breadcrumb_pages = [];

        if (this.options.referrer === 'transactionhistory') {
            breadcrumb_pages.push({
                text: Utils.translate('Transaction History'),
                href: '/transactionhistory'
            });
        } else if (created_from && created_from.internalid) {
            breadcrumb_pages.push({
                text: Utils.translate('Purchase History'),
                href: '/purchases'
            });

            breadcrumb_pages.push({
                text: Utils.translate('Purchase #$(0)', created_from.tranid),
                href: '/purchases/view/' + created_from.recordtype + '/' + created_from.internalid
            });
        }

        breadcrumb_pages.push({
            text: Utils.translate('Receipt #$(0)', this.model.get('tranid')),
            path: '/receiptshistory/view/' + this.model.get('internalid')
        });

        return breadcrumb_pages;
    },

    render: function() {
        this.title = Utils.translate('Receipt Details');
        this.billaddress = this.model.get('addresses').get(this.model.get('billaddress'));
        this.paymentmethod =
            this.model.get('paymentmethods') &&
            this.model.get('paymentmethods').findWhere({ primary: true });

        BackboneView.prototype.render.apply(this, arguments);
    },
    childViews: {
        FormatPaymentMethod: function() {
            return new GlobalViewsFormatPaymentMethodView({ model: this.paymentmethod });
        },
        'Address.View': function() {
            return new AddressView({
                model: this.billaddress,
                hideDefaults: true,
                hideActions: true,
                hideSelector: true
            });
        },
        'Item.Details.Line': function() {
            return new BackboneCollectionView({
                collection: this.model.get('lines'),
                childView: TransactionLineViewsCellActionableView,
                childViewOptions: {
                    SummaryView: ReceiptDetailsItemSummaryView,
                    ActionsView: ReceiptDetailsItemActionsView,
                    application: this.application,
                    navigable: true
                }
            });
        }
    },

    // @method getItemsNumber
    getItemsNumber: function() {
        let items_quantity = 0;
        this.model.get('lines').each(function(models) {
            items_quantity += models.get('quantity');
        });

        return items_quantity;
    },

    // @method getContext @return Receipt.Details.View.Context
    getContext: function() {
        const lines = this.model.get('lines').models;
        const items_quantity = this.getItemsNumber();

        // @class Receipt.Details.View.Context
        return {
            // @property {Receipt.Model} model
            model: this.model,
            // @property {Number} orderNumber
            orderNumber: this.model.get('tranid'),
            // @property {String} date
            date: this.model.get('trandate'),
            // @property {String} status
            status: this.model.get('status') ? this.model.get('status').name : '',
            // @property {Boolean} showPaymentMethod
            showPaymentMethod: !!this.paymentmethod,
            // @property {Boolean} showBillingAddress
            showBillingAddress: !!this.billaddress,
            // @property {String} subTotalFormatted
            subTotalFormatted: this.model.get('summary').subtotal_formatted,
            // @property {Boolean} showDiscountTotal
            showDiscountTotal: !!parseFloat(this.model.get('summary').discounttotal),
            // @property {String} discountTotalFormatted
            discountTotalFormatted: this.model.get('summary').discounttotal_formatted,
            // @property {Boolean} showShippingCost
            showShippingCost: !!parseFloat(this.model.get('summary').shippingcost),
            // @property {String} shippingCostFormatted
            shippingCostFormatted: this.model.get('summary').shippingcost_formatted,
            // @property {Boolean} showHandlingCost
            showHandlingCost: !!parseFloat(this.model.get('summary').handlingcost),
            // @property {String} handlingCostFormatted
            handlingCostFormatted: this.model.get('summary').handlingcost_formatted,
            // @property {Boolean} showPromocode
            showPromocode: !!this.model.get('promocode'),
            // @property {String} promocode
            promocode: this.model.get('promocode') && this.model.get('promocode').code,
            // @property {String} taxTotalFormatted
            taxTotalFormatted: this.model.get('summary').taxtotal_formatted,
            // @property {String} totalFormatted
            totalFormatted: this.model.get('summary').total_formatted,
            // @property {String} downloadPDFURL
            pdfUrl: Utils.getDownloadPdfUrl({
                asset: 'cash-sale-details',
                id: this.model.get('internalid')
            }),
            // @property {Boolean} showLines
            showLines: !!(lines && lines.length),
            // @property {Boolean} isLinesLengthGreaterThan1
            isLinesLengthGreaterThan1: !!(lines && lines.length > 1),
            // @property {Number} itemsQuantityNumber
            itemsQuantityNumber: items_quantity,
            // @property {Number} itemsQuantityLengthGreaterThan1
            itemsQuantityLengthGreaterThan1: items_quantity > 1,
            // @property {Number} linesLength
            linesLength: lines ? lines.length : 0,
            // @property {Boolean} showCollapsedItems
            showCollapsedItems: this.application.getConfig('sca.collapseElements'),
            // @property {Boolean} haveCreatedFrom
            haveCreatedFrom: !!(
                this.model.get('createdfrom') && this.model.get('createdfrom').internalid
            ),
            // @property {Boolean} showOpenedAccordion
            showOpenedAccordion: Utils.isTabletDevice() || Utils.isDesktopDevice()
        };
    }
});

export = ReceiptDetailsView;
