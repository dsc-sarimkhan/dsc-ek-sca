/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderHistory.Details.View"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as order_history_details_tpl from 'order_history_details.tpl';
import * as order_history_packages_tpl from 'order_history_packages.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import TransactionLineViewsCellActionableView = require('../../../Commons/Transaction.Line.Views/JavaScript/Transaction.Line.Views.Cell.Actionable.View');
import TransactionLineViewsQuantityAmountView = require('../../../Commons/Transaction.Line.Views/JavaScript/Transaction.Line.Views.QuantityAmount.View');
import OrderHistoryItemActionsView = require('./OrderHistory.Item.Actions.View');
import AddressView = require('../../../Commons/Address/JavaScript/Address.Details.View');
import GlobalViewsFormatPaymentMethodView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.FormatPaymentMethod.View');
import OrderHistoryModel = require('./OrderHistory.Model');
import OrderHistoryPayments = require('./OrderHistory.Payments.View');
import OrderHistoryOtherPayments = require('./OrderHistory.Other.Payments.View');
import OrderHistoryPackagesView = require('./OrderHistory.Packages.View');
import OrderHistoryReturnAutorizationView = require('./OrderHistory.ReturnAutorization.View');
import GlobalViewsMessageView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Message.View');
import OrderHistorySummary = require('./OrderHistory.Summary.View');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import TransactionCollection = require('../../../Commons/Transaction/JavaScript/Transaction.Collection');
import LiveOrderModel = require('../../../Commons/LiveOrder/JavaScript/LiveOrder.Model');
import Tracker = require('../../../Commons/Tracker/JavaScript/Tracker');
import BigNumber = require('../../../Commons/Utilities/JavaScript/BigNumber');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import AjaxRequestsKiller = require('../../../Commons/AjaxRequestsKiller/JavaScript/AjaxRequestsKiller');

// @class OrderHistory.Details.View @extend Backbone.View
const OrderHistoryDetailsView: any = BackboneView.extend({
    // @property {Function} template
    template: order_history_details_tpl,

    // @property {String} title
    title: Utils.translate('Purchase Details'),

    // @property {String} page_header
    page_header: Utils.translate('Purchase Details'),

    // @property {Object} attributes
    attributes: {
        id: 'PurchaseDetail',
        class: 'OrderDetailsView'
    },

    // @property {Object} events
    events: {
        'click [data-action="add-to-cart"]': 'addToCart',
        'click [data-action="go-to-returns"] a': 'goToReturns'
    },

    // @method initialize
    initialize: function(options) {
        this.application = options.application;
        this.id = options.routerArguments[1];
        this.recordtype = options.routerArguments[0];
        this.is_basic = !!this.application.getConfig('isBasic');

        const self = this;

        this.model = new OrderHistoryModel();

        this.model.on('change:cancel_response', function(model, response_code) {
            let message = '';
            let type = '';

            if (response_code) {
                if (response_code === 'ERR_ALREADY_APPROVED_STATUS') {
                    message = Utils.translate(
                        'You cannot cancel this order because it has already been approved.'
                    );
                    type = 'error';
                } else if (response_code === 'ERR_ALREADY_CANCELLED_STATUS') {
                    message = Utils.translate('You have cancelled this purchase successfully.');
                    type = 'warning';
                } else if (response_code === 'OK') {
                    message = Utils.translate('The order was successfully cancelled.');
                    type = 'success';
                }

                if (message && type) {
                    self.once('afterViewRender', function() {
                        self.showError(message, type, true);
                    });

                    self.render();
                }
            }
        });
    },
    beforeShowContent: function() {
        const suiteTaxEnabled = Configuration.get('siteSettings.isSuiteTaxEnabled');
        let suiteTaxPromise;
        const self = this;

        const fetch = this.model.fetch({
            data: {
                internalid: self.id,
                recordtype: self.recordtype
            },
            killerId: AjaxRequestsKiller.getKillerId()
        });

        if (suiteTaxEnabled) {
            const defer = jQuery.Deferred();
            fetch.then(function() {
                jQuery
                    .get(
                        Utils.getAbsoluteUrl(
                            'SC/OrderHistory/OrderHistory.ss?internalid=' + self.id + '&n='+SC.ENVIRONMENT.siteSettings.siteid+'&domain='+SC.ENVIRONMENT.shoppingDomain,
                            true
                        )
                    )
                    .then(function(result) {
                        self.model.set('taxesPerType', _.isArray(result) ? result : []);
                    })
                    .always(function() {
                        defer.resolve();
                    });
            });
            return defer;
        }

        return fetch;
    },

    // @method getReturnAuthorizations
    getReturnAuthorizations: function() {
        const return_authorizations = this.model.get('returnauthorizations');
        let total_lines = 0;

        return_authorizations.each(function(return_authorization) {
            total_lines += return_authorization.get('lines')
                ? return_authorization.get('lines').length
                : 0;
        });

        return_authorizations.totalLines = total_lines;

        return return_authorizations;
    },

    // @method getRecipts
    getRecipts: function() {
        if (!this.receipts) {
            const receipts_lines = _.values(this.model.get('receipts').models);
            this.receipts = new TransactionCollection();

            if (receipts_lines.length) {
                this.receipts.add(receipts_lines);
            }
        }
        return this.receipts;
    },

    // @method isAnyLinePurchasable
    getPayments: function() {
        return _.where(this.model.get('adjustments'), { recordtype: 'customerpayment' });
    },
    getCreditMemos: function() {
        return _.where(this.model.get('adjustments'), { recordtype: 'creditmemo' });
    },
    getDepositApplications: function() {
        return _.where(this.model.get('adjustments'), { recordtype: 'depositapplication' });
    },

    // @method getSelectedMenu
    getSelectedMenu: function() {
        return 'ordershistory';
    },

    // @method getBreadcrumbPages
    getBreadcrumbPages: function() {
        return [
            {
                text: Utils.translate('Purchase History'),
                href: '/purchases'
            },
            {
                text: '#' + this.model.get('tranid'),
                href: '/purchases/view/' + this.model.get('recordtype') + '/' + this.model.get('id')
            }
        ];
    },

    // @method render
    render: function() {
        this.paymentmethod =
            this.model.get('paymentmethods') &&
            this.model.get('paymentmethods').findWhere({ primary: true });
        this.billaddress = this.model.get('addresses').get(this.model.get('billaddress'));
        this.shipaddress = this.model.get('addresses').get(this.model.get('shipaddress'));

        BackboneView.prototype.render.apply(this, arguments);
    },

    // @method trackEventReorder
    trackEventReorder: function(line) {
        line &&
            Tracker.getInstance().trackEvent({
                category: 'My Account - User Interaction',
                action: 'Reorder',
                label: line.generateURL()
            });
    },

    // @method addToCart
    addToCart: function(e) {
        e.preventDefault();

        const self = this;
        const line_id = this.$(e.target).data('line-id');
        const $form = this.$(e.target).closest('[data-type="order-item"]');
        const $alert_placeholder = $form.find('[data-type=alert-placeholder]');
        const quantity =
            this.$(e.target).data('partial-quantity') || this.$(e.target).data('item-quantity');
        const selected_line = this.model.get('lines').get(line_id);

        // The 'fulfillmentChoice' for reorders must be setted to 'ship'
        if (selected_line.get('fulfillmentChoice')) {
            selected_line.set('fulfillmentChoice', 'ship');
        }

        LiveOrderModel.getInstance()
            .addLine(selected_line)
            .done(function() {
                self.trackEventReorder(selected_line);
                // show warning if some options were not set
                const availableOptions = selected_line.get('item').get('itemoptions_detail').fields;

                const areMissingOptions = !_.every(selected_line.get('options').models, function(
                    optionModel: any
                ) {
                    return _.find(availableOptions, function(availableOption: any) {
                        return optionModel.get('cartOptionId') === availableOption.internalid;
                    });
                });

                let message;
                if (!areMissingOptions) {
                    message =
                        quantity > 1
                            ? Utils.translate(
                                  '$(0) Items successfully added to <a href="#" data-touchpoint="viewcart">your cart</a><br/>',
                                  quantity
                              )
                            : Utils.translate(
                                  'Item successfully added to <a href="#" data-touchpoint="viewcart">your cart</a><br/>'
                              );
                } else {
                    message =
                        quantity > 1
                            ? Utils.translate(
                                  '$(0) Items were added to <a href="#" data-touchpoint="viewcart">your cart</a> with variants<br/>',
                                  quantity
                              )
                            : Utils.translate(
                                  'Item was added to <a href="#" data-touchpoint="viewcart">your cart</a> with variants<br/>'
                              );
                }

                const alert = new GlobalViewsMessageView({
                    message: message,
                    type: areMissingOptions ? 'warning' : 'success',
                    closable: true
                });

                alert.show($alert_placeholder, 6000);
            });
    },

    // @method goToReturns scroll the page up to the order's return
    goToReturns: function(e) {
        e.preventDefault();

        const $return_authorizations_header = this.$(
            '[data-target="#returns-authorizations"]'
        ).first();
        this.$('#returns-authorizations')
            .first()
            .collapse('show');

        jQuery('html, body').animate(
            {
                scrollTop: $return_authorizations_header.offset().top
            },
            500
        );
    },

    // @method getNonShippableItems
    // @return {Array<Transaction.Line.Model>}
    getNonShippableLines: function() {
        return this.model.get('lines').where({ linegroup: 'nonshippable' });
    },
    // @method getInStoreLines
    // @return {Array<Transaction.Line.Model>}
    getInStoreLines: function() {
        return this.model.get('lines').where({ linegroup: 'instore' });
    },

    // @method getShippableLines Gets all line that have a linegroup as shippable
    // @return {Array<Transaction.Line.Model>}
    getShippableLines: function() {
        return this.model.get('lines').where({ linegroup: 'shippable' });
    },

    getOrderPackages: function() {
        const shippable_packages = this.getShippablePackages();
        const instore_packages = this.getInstorePackages();

        return shippable_packages.concat(instore_packages);
    },
    getShippablePackages: function() {
        const self = this;
        const shippable_lines = this.getShippableLines();
        const is_multi_ship_to = this.model.get('ismultishipto');
        const ship_groups = {};
        let amount = 0;

        _.each(shippable_lines || [], function(line: any) {
            if (
                line.get('quantitybackordered') ||
                line.get('quantitypicked') ||
                line.get('quantitypacked')
            ) {
                const shipaddress = is_multi_ship_to
                    ? line.get('shipaddress')
                    : self.model.get('shipaddress');
                const shipmethod = is_multi_ship_to
                    ? line.get('shipmethod')
                    : self.model.get('shipmethod');

                if (line.get('quantitybackordered')) {
                    let pending_line;

                    if (line.get('quantitypacked') === line.get('quantity')) {
                        pending_line = line;
                    } else {
                        pending_line = line.clone();

                        pending_line.set('item', line.get('item').attributes);

                        pending_line.set('quantity', line.get('quantitybackordered'));

                        amount = new BigNumber(line.get('rate'))
                            .times(pending_line.get('quantity'))
                            .toNumber();
                        pending_line.set('amount', amount);
                    }

                    const key_pending = [shipaddress, shipmethod, 'pending'].join('-');

                    ship_groups[key_pending] = ship_groups[key_pending] || {
                        internalid: key_pending,
                        shipaddress: self.model
                            .get('addresses')
                            .findWhere({ internalid: shipaddress }),
                        shipmethod: self.model
                            .get('shipmethods')
                            .findWhere({ internalid: shipmethod }),
                        packageGroup: 'ship',
                        status: {
                            internalid: 'pending',
                            name: Utils.translate('Pending shipment')
                        },
                        lines: []
                    };

                    ship_groups[key_pending].lines.push(pending_line);
                }

                if (line.get('quantitypicked') || line.get('quantitypacked')) {
                    let picked_packed_line;

                    let quantity = 0;

                    if (line.get('quantitypicked')) {
                        quantity += line.get('quantitypicked');
                    }

                    if (line.get('quantitypacked')) {
                        quantity += line.get('quantitypacked');
                    }

                    if (quantity === line.get('quantity')) {
                        picked_packed_line = line;
                    } else {
                        picked_packed_line = line.clone();

                        picked_packed_line.set('quantity', quantity);

                        amount = new BigNumber(line.get('rate'))
                            .times(picked_packed_line.get('quantity'))
                            .toNumber();

                        picked_packed_line.set('amount', amount);

                        picked_packed_line.set('item', line.get('item').attributes);
                    }

                    const key_processing = [shipaddress, shipmethod, 'processing'].join('-');

                    ship_groups[key_processing] = ship_groups[key_processing] || {
                        internalid: key_processing,
                        shipaddress: self.model
                            .get('addresses')
                            .findWhere({ internalid: shipaddress }),
                        shipmethod: self.model
                            .get('shipmethods')
                            .findWhere({ internalid: shipmethod }),
                        packageGroup: 'ship',
                        status: {
                            internalid: 'picked_packed',
                            name: Utils.translate('Processing shipment')
                        },
                        lines: []
                    };

                    ship_groups[key_processing].lines.push(picked_packed_line);
                }
            }
        });

        this.model.get('fulfillments').each(function(fulfillment) {
            const shipaddress = self.model
                .get('addresses')
                .findWhere({ internalid: fulfillment.get('shipaddress') });
            const shipmethod = self.model
                .get('shipmethods')
                .findWhere({ internalid: fulfillment.get('shipmethod') });

            fulfillment.set('shipaddress', shipaddress);
            fulfillment.set('shipmethod', shipmethod);

            const lines = _.compact(
                fulfillment.get('lines').map(function(line) {
                    let fulfilled_line;
                    const original_line = self.model.get('lines').get(line.get('internalid'));

                    if (original_line && original_line.get('linegroup') === 'shippable') {
                        // ignore instore lines
                        fulfilled_line = original_line.clone();

                        fulfilled_line.set('quantity', original_line.get('quantityfulfilled'));

                        amount = new BigNumber(original_line.get('rate'))
                            .times(fulfilled_line.get('quantity'))
                            .toNumber();

                        fulfilled_line.set('amount', amount);

                        fulfilled_line.set('item', original_line.get('item'), { silent: true });

                        return fulfilled_line;
                    }
                })
            );

            if (lines.length) {
                ship_groups[fulfillment.get('internalid')] = ship_groups[
                    fulfillment.get('internalid')
                ] || {
                    internalid: fulfillment.get('internalid'),
                    shipaddress: shipaddress,
                    shipmethod: shipmethod,
                    packageGroup: 'ship',
                    status: {
                        internalid: 'shipped',
                        name: Utils.translate('Shipped')
                    },
                    date: fulfillment.get('date'),
                    trackingnumbers: fulfillment.get('trackingnumbers'),
                    lines: []
                };

                ship_groups[fulfillment.get('internalid')].lines = lines;
            }
        });

        return _.values(ship_groups);
    },

    getInstorePackages: function() {
        const instore_lines = this.getInStoreLines();
        const instore_groups = {};
        let amount = 0;

        _.each(instore_lines || [], function(line: any) {
            if (
                line.get('quantitybackordered') ||
                line.get('quantitypicked') ||
                line.get('quantityfulfilled')
            ) {
                const location = line.get('location');

                if (line.get('quantitybackordered')) {
                    let pending_line;

                    if (line.get('quantitypacked') === line.get('quantity')) {
                        pending_line = line;
                    } else {
                        pending_line = line.clone();

                        pending_line.set('item', line.get('item').attributes);

                        pending_line.set('quantity', line.get('quantitybackordered'));

                        amount = new BigNumber(line.get('rate'))
                            .times(pending_line.get('quantity'))
                            .toNumber();
                        pending_line.set('amount', amount);
                    }

                    const key_pending = [location.get('internalid'), 'pending'].join('-');

                    instore_groups[key_pending] = instore_groups[key_pending] || {
                        internalid: key_pending,
                        location: location,
                        packageGroup: 'instore',
                        status: {
                            internalid: 'pending',
                            name: Utils.translate('Preparing order')
                        },
                        lines: []
                    };

                    instore_groups[key_pending].lines.push(pending_line);
                }

                if (line.get('quantitypicked')) {
                    let picked_line;

                    if (line.get('quantitypicked') === line.get('quantity')) {
                        picked_line = line;
                    } else {
                        picked_line = line.clone();

                        picked_line.set('quantity', line.get('quantitypicked'));

                        amount = new BigNumber(line.get('rate'))
                            .times(picked_line.get('quantity'))
                            .toNumber();

                        picked_line.set('amount', amount);

                        picked_line.set('item', line.get('item').attributes);
                    }

                    const key_picked = [location.get('internalid'), 'picked'].join('-');

                    instore_groups[key_picked] = instore_groups[key_picked] || {
                        internalid: key_picked,
                        location: location,
                        packageGroup: 'instore',
                        status: {
                            internalid: 'picked',
                            name: Utils.translate('Ready to pick up')
                        },
                        lines: []
                    };

                    instore_groups[key_picked].lines.push(picked_line);
                }

                if (line.get('quantityfulfilled')) {
                    let pickedup_line;

                    if (line.get('quantityfulfilled') === line.get('quantity')) {
                        pickedup_line = line;
                    } else {
                        pickedup_line = line.clone();

                        pickedup_line.set('quantity', line.get('quantityfulfilled'));

                        amount = new BigNumber(line.get('rate'))
                            .times(pickedup_line.get('quantity'))
                            .toNumber();

                        pickedup_line.set('amount', amount);

                        pickedup_line.set('item', line.get('item').attributes);
                    }

                    const key_pickedup = [location.get('internalid'), 'pickedup'].join('-');

                    instore_groups[key_pickedup] = instore_groups[key_pickedup] || {
                        internalid: key_pickedup,
                        location: location,
                        packageGroup: 'instore',
                        status: {
                            internalid: 'pickedup',
                            name: Utils.translate('Picked up')
                        },
                        lines: []
                    };

                    instore_groups[key_pickedup].lines.push(pickedup_line);
                }
            }
        });

        return _.values(instore_groups);
    },

    // @property {Object} childViews
    childViews: {
        FormatPaymentMethod: function() {
            return new GlobalViewsFormatPaymentMethodView({ model: this.paymentmethod });
        },

        'Billing.Address.View': function() {
            return new AddressView({
                model: this.billaddress,
                hideDefaults: true,
                hideActions: true,
                hideSelector: true
            });
        },

        NonShippableLines: function() {
            return new BackboneCollectionView({
                collection: this.non_shippable_lines || this.getNonShippableLines(),
                childView: TransactionLineViewsCellActionableView,
                viewsPerRow: 1,
                childViewOptions: {
                    navigable: !this.application.isStandalone,
                    application: this.application,
                    SummaryView: TransactionLineViewsQuantityAmountView,
                    ActionsView: OrderHistoryItemActionsView,
                    showAlert: false
                }
            });
        },

        ReturnAutorization: function() {
            return new BackboneCollectionView({
                collection: this.getReturnAuthorizations(),
                childView: OrderHistoryReturnAutorizationView,
                childViewOptions: {
                    navigable: !this.application.isStandalone
                },
                viewsPerRow: 1
            });
        },

        Payments: function() {
            return new BackboneCollectionView({
                collection: this.getPayments(),
                childView: OrderHistoryPayments,
                childViewOptions: {
                    application: this.application,
                    is_basic: this.is_basic,
                    recordtype: this.model.get('recordtype')
                }
            });
        },

        OtherPayments: function() {
            return new OrderHistoryOtherPayments({
                credit_memos: this.getCreditMemos(),
                deposit_applications: this.getDepositApplications(),
                show_links: this.is_basic
            });
        },

        Summary: function() {
            return new OrderHistorySummary({
                model: this.model,
                application: this.application,
                is_basic: this.is_basic
            });
        },
        OrderPackages: function() {
            return new BackboneCollectionView({
                collection: this.getOrderPackages(),
                childView: OrderHistoryPackagesView,
                cellTemplate: order_history_packages_tpl,
                viewsPerRow: 1,
                childViewOptions: {
                    application: this.application,
                    showAlert: false
                }
            });
        }
    },

    // @method getContext @returns OrderHistory.Details.View.Context
    getContext: function() {
        const transaction_record_origin_instore: any = _.findWhere(
            Configuration.get('transactionRecordOriginMapping'),
            { id: 'inStore' }
        );
        const transaction_record_origin: any = _.findWhere(
            Configuration.get('transactionRecordOriginMapping'),
            { origin: this.model.get('origin') }
        );

        this.isInStore = this.model.get('origin') === transaction_record_origin_instore.origin;

        this.accordionLimit = Configuration.accordionCollapseLimit;

        this.non_shippable_lines = this.getNonShippableLines();
        this.in_store_lines = this.getInStoreLines();

        const return_authorizations = this.getReturnAuthorizations();
        const order_ship_method = this.model.get('shipmethod');
        let delivery_method_name = '';
        const status = this.model.get('status');
        const created_from = this.model.get('createdfrom');

        if (order_ship_method && this.model.get('shipmethods')._byId[order_ship_method]) {
            delivery_method_name = this.model
                .get('shipmethods')
                ._byId[order_ship_method].getFormattedShipmethod();
        } else if (order_ship_method && order_ship_method.name) {
            delivery_method_name = order_ship_method.name;
        }

        // @class OrderHistory.Details.View.Context
        return {
            // @property {OrderHistory.Model} model
            model: this.model,
            // @property {Boolean} showNonShippableItems
            showNonShippableLines: !!this.non_shippable_lines.length,
            // @property {Boolean} showNonShippableLinesAccordion
            showNonShippableLinesAccordion: this.non_shippable_lines.length > this.accordionLimit,
            // @property {Array} nonShippableItems
            nonShippableLines: this.non_shippable_lines,
            // @property {Boolean} nonShippableItemsLengthGreaterThan1
            nonShippableLinesLengthGreaterThan1: this.non_shippable_lines.length > 1,
            // @property {Boolean} showNonShippableItems
            showInStoreLines: !!this.in_store_lines.length,
            // @property {Boolean} showInStoreLinesAccordion
            showInStoreLinesAccordion: this.in_store_lines.length > this.accordionLimit,
            // @property {Array} nonShippableItems
            inStoreItems: this.in_store_lines,
            // @property {Boolean} nonShippableItemsLengthGreaterThan1
            inStoreLinesLengthGreaterThan1: this.in_store_lines.length > 1,
            // @property {Transaction.Line.Collection} lines
            lines: this.model.get('lines'),
            // @property {Boolean} collapseElements
            collapseElements: this.application.getConfig('sca.collapseElements'),
            // @property {Address.Model} billAddress
            showBillAddress: !!this.billaddress,
            // @property {Boolean} showOrderShipAddress
            showOrderShipAddress: !!this.model.get('shipaddress'),
            // @property {Address.Model} orderShipaddress
            orderShipaddress: this.model.get('shipaddress')
                ? this.model.get('addresses').get(this.model.get('shipaddress'))
                : null,
            // @property {Boolean} showReturnAuthorizations
            showReturnAuthorizations: !!return_authorizations.length,
            // @property {Object} returnAuthorizations
            returnAuthorizations: return_authorizations,
            // @property {String} deliveryMethodName
            deliveryMethodName: delivery_method_name || '',
            // @property {Boolean} showDeliveryMethod
            showDeliveryMethod: !!delivery_method_name,
            // @property {Boolean} isInStore
            isInStore: this.isInStore,
            // @property {Boolean} showPaymentMethod
            showPaymentMethod: !this.getPayments().length,
            // @property {Boolean} initiallyCollapsed
            initiallyCollapsed: Utils.isPhoneDevice() ? '' : 'in',
            // @property {Boolean} initiallyCollapsedArrow
            initiallyCollapsedArrow: Utils.isPhoneDevice() ? 'collapsed' : '',
            // @property {String} originName
            originName: transaction_record_origin.name,
            // @property {String} title
            title: transaction_record_origin.detailedName,
            // @property {Boolean} showPaymentEventFail
            showPaymentEventFail:
                this.model.get('paymentevent').holdreason === 'FORWARD_REQUESTED' &&
                status.internalid !== 'cancelled' &&
                status.internalid !== 'closed',
            // @property {Boolean} showEstimateDetail
            showQuoteDetail: !!created_from && created_from.name,
            // @property {String} quoteName
            quoteName: Utils.translate('Quote #$(0)', created_from.name),
            // @property {String} estimateURL
            quoteURL:
                created_from && created_from.internalid ? 'quotes/' + created_from.internalid : '',
            // @property {Boolean} showPurchaseOrderNumber
            showPurchaseOrderNumber: !!this.model.get('purchasenumber')
        };
    }
});

export = OrderHistoryDetailsView;
