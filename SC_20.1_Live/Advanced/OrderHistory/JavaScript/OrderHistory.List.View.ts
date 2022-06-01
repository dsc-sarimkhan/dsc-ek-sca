/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderHistory.List.View"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as order_history_list_tpl from 'order_history_list.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import OrderHistoryListTrackingNumberView = require('./OrderHistory.List.Tracking.Number.View');
import TransactionListView = require('../../../Commons/Transaction/JavaScript/Transaction.List.View');
import OrderHistoryCollection = require('./OrderHistory.Collection');
import GlobalViewsPaginationView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Pagination.View');
import GlobalViewsShowingCurrentView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.ShowingCurrent.View');
import ListHeaderView = require('../../../Commons/ListHeader/JavaScript/ListHeader.View');
import RecordViewsActionableView = require('../../RecordViews/JavaScript/RecordViews.Actionable.View');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import Handlebars = require('../../../Commons/Utilities/JavaScript/Handlebars');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');

// @class OrderHistory.List.View view list of orders @extend Backbone.View
const OrderHistoryListView: any = TransactionListView.extend({
    // @property {Function} template
    template: order_history_list_tpl,
    // @property {String} title
    title: Utils.translate('Purchase History'),
    // @property {String} className
    className: 'OrderListView',
    // @property {String} page_header
    page_header: Utils.translate('Purchase History'),
    // @property {Object} attributes
    attributes: {
        id: 'PurchaseHistory',
        class: 'OrderListView'
    },
    // @property {Object} events
    events: {
        'click [data-action="navigate"]': 'navigateToOrder'
    },
    // @method getSelectedMenu
    getSelectedMenu: function() {
        return 'purchases';
    },
    // @method getBreadcrumbPages
    getBreadcrumbPages: function() {
        return {
            text: this.title,
            href: '/purchases'
        };
    },
    // @method initialize
    initialize: function(options) {
        this.application = options.application;
        if (Backbone.history.fragment.indexOf('open-purchases') === 0) {
            this.collection = new OrderHistoryCollection([], {
                filters: 'status:open'
            });
            this.activeTab = 'open';
        } else if (Backbone.history.fragment.indexOf('instore-purchases') === 0) {
            this.collection = new OrderHistoryCollection([], {
                filters: 'origin:instore'
            });
            this.activeTab = 'instore';
        } else {
            this.collection = new OrderHistoryCollection();
            this.activeTab = 'all';
        }
        this.isSCISIntegrationEnabled = Configuration.get(
            'siteSettings.isSCISIntegrationEnabled',
            false
        );

        const isoDate = Utils.dateToString(new Date());

        this.rangeFilterOptions = {
            fromMin: '1800-01-02',
            fromMax: isoDate,
            toMin: '1800-01-02',
            toMax: isoDate
        };

        this.listenCollection();

        // Manages sorting and filtering of the collection
        this.listHeader = new ListHeaderView({
            view: this,
            application: this.application,
            collection: this.collection,
            sorts: this.sortOptions,
            rangeFilter: 'date',
            rangeFilterLabel: Utils.translate('From'),
            hidePagination: true,
            allowEmptyBoundaries: true
        });
        this.collection.on('reset', this.showContent, this);
    },
    // @method navigateToOrder
    navigateToOrder: function(e) {
        // ignore clicks on anchors and buttons
        if (Utils.isTargetActionable(e)) {
            return;
        }

        if (!jQuery(e.target).closest('[data-type="accordion"]').length) {
            const order_id = jQuery(e.target)
                .closest('[data-id]')
                .data('id');
            const recordtype = jQuery(e.target)
                .closest('[data-record-type]')
                .data('record-type');
            Backbone.history.navigate('#purchases/view/' + recordtype + '/' + order_id, {
                trigger: true
            });
        }
    },
    // @method listenCollection
    listenCollection: function() {
        this.setLoading(true);

        this.collection.on({
            request: jQuery.proxy(this, 'setLoading', true),
            reset: jQuery.proxy(this, 'setLoading', false)
        });
    },
    // @method setLoading
    setLoading: function(value) {
        this.isLoading = value;
    },
    // @property {Array} sortOptions
    // Array of default sort options
    // sorts only apply on the current collection
    // which might be a filtered version of the original
    sortOptions: [
        {
            value: 'trandate,internalid',
            name: Utils.translate('Sort By Date'),
            selected: true
        },
        {
            value: 'tranid',
            name: Utils.translate('Sort By Number')
        },
        {
            value: 'amount',
            name: Utils.translate('Sort By Amount')
        }
    ],
    // @property {Object} childViews
    childViews: {
        ListHeader: function() {
            return this.listHeader;
        },
        'GlobalViews.Pagination': function() {
            return new GlobalViewsPaginationView(
                _.extend(
                    {
                        totalPages: Math.ceil(
                            this.collection.totalRecordsFound / this.collection.recordsPerPage
                        )
                    },
                    Configuration.defaultPaginationSettings
                )
            );
        },
        'GlobalViews.ShowCurrentPage': function() {
            return new GlobalViewsShowingCurrentView({
                items_per_page: this.collection.recordsPerPage,
                total_items: this.collection.totalRecordsFound,
                total_pages: Math.ceil(
                    this.collection.totalRecordsFound / this.collection.recordsPerPage
                )
            });
        },
        'Order.History.Results': function() {
            return this._resultsView;
        }
    },
    _buildResultsView: function() {
        const self = this;
        let selectedColumns = [];

        if (!Configuration.get().transactionListColumns.enableOrderHistory) {
            selectedColumns.push({ label: 'Date', id: 'trandate', type: 'date' });
            selectedColumns.push({
                label: 'Amount',
                name: 'amount',
                id: 'amount_formatted',
                type: 'currency'
            });

            if (self.isSCISIntegrationEnabled) {
                selectedColumns.push({ label: 'Origin', id: 'origin' });
            } else {
                selectedColumns.push({ label: 'Status', id: 'status', type: 'status' });
            }
        } else {
            selectedColumns = Configuration.get().transactionListColumns.orderHistory;
        }

        const records_collection = new Backbone.Collection(
            this.collection.map(function(order) {
                const model = new Backbone.Model({
                    title: new Handlebars.SafeString(
                        Utils.translate('<span class="tranid">$(0)</span>', order.get('tranid'))
                    ),
                    touchpoint: 'customercenter',
                    detailsURL:
                        '/purchases/view/' +
                        order.get('recordtype') +
                        '/' +
                        order.get('internalid'),
                    recordType: order.get('recordtype'),
                    id: order.get('internalid'),
                    internalid: order.get('internalid'),
                    trackingNumbers: order.get('trackingnumbers'),
                    columns: self._buildColumns(selectedColumns, order)
                });
                return model;
            })
        );

        return new BackboneCollectionView({
            childView: RecordViewsActionableView,
            collection: records_collection,
            viewsPerRow: 1,
            childViewOptions: {
                actionView: OrderHistoryListTrackingNumberView,
                actionOptions: {
                    showContentOnEmpty: true,
                    contentClass: '',
                    collapseElements: true
                }
            }
        });
    },

    // @method getContext @return OrderHistory.List.View.Context
    getContext: function() {
        this._resultsView = this._buildResultsView();
        let columns = [];
        if (this._resultsView.collection.length > 0) {
            columns = this._resultsView.collection.at(0).get('columns');
        }
        // @class OrderHistory.List.View.Context
        return {
            // @property {String} pageHeader
            pageHeader: this.page_header,
            // @property {Boolean} collectionLengthGreaterThan0
            collectionLengthGreaterThan0: this.collection.length > 0,
            // @property {Boolean} isLoading
            isLoading: this.isLoading,
            // @property {Boolean} showPagination
            showPagination: !!(this.collection.totalRecordsFound && this.collection.recordsPerPage),
            // @property {Boolean} showBackToAccount
            showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD',
            // @property {Boolean} isSCISIntegrationEnabled
            isSCISIntegrationEnabled: this.isSCISIntegrationEnabled,
            // @property {Boolean} allIsActive
            allIsActive: this.activeTab === 'all',
            // @property {Boolean} openIsActive
            openIsActive: this.activeTab === 'open',
            // @property {Boolean} inStoreIsActive
            inStoreIsActive: this.activeTab === 'instore',
            // @property {Array<{}>} columns
            columns: columns
        };
    }
});

export = OrderHistoryListView;
