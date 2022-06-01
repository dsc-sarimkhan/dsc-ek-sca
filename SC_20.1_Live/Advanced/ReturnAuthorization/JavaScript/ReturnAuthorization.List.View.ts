/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ReturnAuthorization.List.View"/>
// @module ReturnAuthorization.List.View

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import UrlHelper = require('../../../Commons/UrlHelper/JavaScript/UrlHelper');
import * as return_authorization_list_tpl from 'return_authorization_list.tpl';

import TransactionListView = require('../../../Commons/Transaction/JavaScript/Transaction.List.View');
import ListHeader = require('../../../Commons/ListHeader/JavaScript/ListHeader.View');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import RecordViewsView = require('../../RecordViews/JavaScript/RecordViews.View');
import GlobalViewsPaginationView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Pagination.View');
import GlobalViewsShowingCurrentView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.ShowingCurrent.View');
import GlobalViewsMessageView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Message.View');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import ReturnAuthorizationCollection = require('./ReturnAuthorization.Collection');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

// @class ReturnAuthorization.List.View @extend Backbone.View
const ReturnAuthorizationListView: any = TransactionListView.extend({
    template: return_authorization_list_tpl,

    className: 'ReturnAuthorizationList',

    title: Utils.translate('Returns'),

    page_header: Utils.translate('Returns'),

    attributes: {
        id: 'ReturnsHistory',
        class: 'ReturnAuthorizationList'
    },

    initialize: function(options) {
        const { application } = options;
        this.application = application;
        const parameters = Utils.parseUrlOptions(options.routerArguments[0]);
        this.collection = new ReturnAuthorizationCollection();
        this.page = parameters.page;

        this.listenCollection();

        const isoDate = Utils.dateToString(new Date());

        this.rangeFilterOptions = {
            fromMin: '1800-01-02',
            fromMax: isoDate,
            toMin: '1800-01-02',
            toMax: isoDate
        };

        // manages sorting and filtering of the collection
        this.list_header = new ListHeader({
            view: this,
            application: application,
            collection: this.collection,
            sorts: this.sortOptions,
            rangeFilter: 'date',
            rangeFilterLabel: Utils.translate('Requested from'),
            listHeaderId: 'returns',
            hidePagination: true,
            allowEmptyBoundaries: true
        });

        if (parameters.cancel) {
            this.message = Utils.translate('Good! Your request was successfully cancelled.');
            Backbone.history.navigate(
                UrlHelper.removeUrlParameter(Backbone.history.fragment, 'cancel'),
                { replace: true }
            );
        }
        this.collection.on('reset', this.showContent, this);
    },

    // @method getSelectedMenu
    getSelectedMenu: function() {
        return 'returns';
    },
    // @method getBreadcrumbPages
    getBreadcrumbPages: function() {
        return {
            text: Utils.translate('Returns'),
            href: '/returns'
        };
    },

    listenCollection: function() {
        this.setLoading(true);

        this.collection.on({
            request: jQuery.proxy(this, 'setLoading', true),
            reset: jQuery.proxy(this, 'setLoading', false)
        });
    },

    setLoading: function(value) {
        this.isLoading = value;
    },

    childViews: {
        'ListHeader.View': function() {
            return this.list_header;
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
        'Records.List': function() {
            return this._resultsView;
        },
        Message: function() {
            return new GlobalViewsMessageView({
                message: this.message,
                closable: true,
                type: 'success'
            });
        }
    },
    _buildResultsView: function() {
        const self = this;
        let selectedColumns = [];

        if (!Configuration.get().transactionListColumns.enableReturnAuthorization) {
            selectedColumns.push({
                label: 'Date:',
                type: 'date',
                name: 'request-date',
                id: 'trandate'
            });
            selectedColumns.push({ label: 'Items:', type: 'items', name: 'items', id: 'quantity' });
            selectedColumns.push({
                label: 'Amount:',
                type: 'currency',
                name: 'amount',
                id: 'amount_formatted'
            });
            selectedColumns.push({ label: 'Status', type: 'status', name: 'status', id: 'status' });
        } else {
            selectedColumns = Configuration.get().transactionListColumns.returnAuthorization;
        }

        const records_collection = new Backbone.Collection(
            this.collection.map(function(return_authorization) {
                return new Backbone.Model({
                    touchpoint: 'customercenter',
                    title: return_authorization.get('tranid'),
                    detailsURL:
                        '#returns/' +
                        return_authorization.get('recordtype') +
                        '/' +
                        return_authorization.get('internalid'),

                    id: return_authorization.get('internalid'),
                    internalid: return_authorization.get('internalid'),

                    columns: self._buildColumns(selectedColumns, return_authorization)
                });
            })
        );
        return new BackboneCollectionView({
            collection: records_collection,
            viewsPerRow: 1,
            childView: RecordViewsView
        });
    },

    sortOptions: [
        {
            value: 'trandate,internalid',
            name: Utils.translate('Sort By Date'),
            selected: true
        },
        {
            value: 'tranid',
            name: Utils.translate('Sort By Number')
        }
    ],

    // @method getContext @return ReturnAuthorization.List.View.Context
    getContext: function() {
        this._resultsView = this._buildResultsView();
        let columns = [];
        if (this._resultsView.collection.length > 0) {
            columns = this._resultsView.collection.at(0).get('columns');
        }
        // @class ReturnAuthorization.List.View.Context
        return {
            // @property {String} pageHeader
            pageHeader: this.page_header,
            // @property {Boolean} showMessage
            showMessage: !!this.message,
            // @property {Boolean} isResultLengthGreaterThan0
            isResultLengthGreaterThan0: !!this.collection.length,
            // @property {Boolean} isLoading
            isLoading: this.isLoading,
            // @property {Boolean} showBackToAccount
            showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD',
            // @property {Boolean} showPagination
            showPagination: !!(this.collection.totalRecordsFound && this.collection.recordsPerPage),
            // @property {Array<{}>} columns
            columns: columns
        };
    }
});

export = ReturnAuthorizationListView;
