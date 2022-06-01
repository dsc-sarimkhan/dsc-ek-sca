/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="TransactionHistory.List.View"/>
// @module TransactionHistory

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as transaction_history_list_tpl from 'transaction_history_list.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import TransactionHistoryCollection = require('./TransactionHistory.Collection');
import ListHeaderView = require('../../../Commons/ListHeader/JavaScript/ListHeader.View');

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import RecordViewsView = require('../../RecordViews/JavaScript/RecordViews.View');

import GlobalViewsPaginationView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Pagination.View');

import Handlebars = require('../../../Commons/Utilities/JavaScript/Handlebars');

import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');

const TransactionHistoryListView: any = BackboneView.extend({
    template: transaction_history_list_tpl,

    title: Utils.translate('Transaction History'),

    page_header: Utils.translate('Transaction History'),

    attributes: {
        id: 'TransactionHistory',
        class: 'TransactionHistory'
    },

    initialize: function(options) {
        let page = '1';

        if (options.routerArguments && options.routerArguments[0]) {
            const params = Utils.parseUrlOptions(options.routerArgument);

            if (params.page) {
                page = params.page.toString();
            }
        }

        this.options.page = page;

        this.application = options.application;
        this.collection = new TransactionHistoryCollection();
        this.profileModel = ProfileModel.getInstance();

        this.listenCollection();

        this.collection.on('reset', this.showContent, this);

        const today = new Date();
        const isoDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

        this.rangeFilterOptions = {
            fromMin: '1800-01-02',
            fromMax: isoDate,
            toMin: '1800-01-02',
            toMax: isoDate
        };

        this.listHeader = new ListHeaderView({
            view: this,
            application: this.application,
            collection: this.collection,
            filters: this.filterOptions,
            sorts: this.sortOptions,
            rangeFilter: 'date',
            rangeFilterLabel: Utils.translate('From'),
            hidePagination: true,
            allowEmptyBoundaries: true
        });
    },

    // @method listenCollection
    listenCollection: function() {
        this.setLoading(true);

        this.collection.on({
            request: jQuery.proxy(this, 'setLoading', true),
            reset: jQuery.proxy(this, 'setLoading', false)
        });
    },

    // @method setLoading @param {Boolean} bool
    setLoading: function(bool) {
        this.isLoading = bool;
    },

    // @method getSelectedMenu @return {String}
    getSelectedMenu: function() {
        return 'transactionhistory';
    },
    // @method getBreadcrumbPages
    getBreadcrumbPages: function() {
        return {
            text: this.title,
            href: '/transactionhistory'
        };
    },

    // @property {Array} filterOptions Array of default filter options filters always apply on the original collection
    filterOptions: [
        {
            value: 'CustCred,CustPymt,CustDep,DepAppl,CustInvc,CashSale',
            name: Utils.translate('Show all record types'),
            selected: true
        },
        {
            value: 'CustCred',
            name: Utils.translate('Show Credit Memo'),
            permission: 'transactions.tranCustCred.1'
        },
        {
            value: 'CustPymt',
            name: Utils.translate('Show Payment'),
            permission: 'transactions.tranCustPymt.1'
        },
        {
            value: 'CustDep',
            name: Utils.translate('Show Deposit'),
            permission: 'transactions.tranCustDep.1'
        },
        {
            value: 'DepAppl',
            name: Utils.translate('Show Deposit Application'),
            permission: 'transactions.tranDepAppl.1'
        },
        {
            value: 'CustInvc',
            name: Utils.translate('Show Invoices'),
            permission: 'transactions.tranCustInvc.1'
        },
        {
            value: 'CashSale',
            name: Utils.translate('Show Cash Receipts'),
            permission: 'transactions.tranCashSale.1'
        }
    ],

    // @property {Array} sortOptions Array of default sort options sorts only apply on the current collection
    // which might be a filtered version of the original
    sortOptions: [
        {
            value: 'trandate,internalid',
            name: Utils.translate('by Date'),
            selected: true
        },
        {
            value: 'tranid',
            name: Utils.translate('by Number')
        },
        {
            value: 'amount',
            name: Utils.translate('by Amount')
        }
    ],

    childViews: {
        'ListHeader.View': function() {
            return this.listHeader;
        },
        'Records.Collection': function() {
            const records_collection = new Backbone.Collection(
                this.collection.map(function(transaction_history) {
                    const model = new Backbone.Model({
                        touchpoint: 'customercenter',
                        title: new Handlebars.SafeString(
                            Utils.translate(
                                transaction_history.getTypeLabel() +
                                    ' #<span class="tranid">$(0)</span>',
                                transaction_history.get('tranid')
                            )
                        ),
                        detailsURL: transaction_history.getTypeUrl(),

                        id: transaction_history.id,
                        internalid: transaction_history.id,

                        columns: [
                            {
                                label: Utils.translate('Date:'),
                                type: 'date',
                                name: 'date',
                                value: transaction_history.get('trandate')
                            },
                            {
                                label: Utils.translate('Amount:'),
                                type: 'currency',
                                name: 'amount',
                                value: transaction_history.get('amount_formatted')
                            },
                            {
                                label: Utils.translate('Status:'),
                                type: 'status',
                                name: 'status',
                                value: transaction_history.get('status').name
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
        }
    },

    // @method getContext @return {TransactionHistory.List.View.Context}
    getContext: function() {
        // @class TransactionHistory.List.View.Context
        return {
            // @property {String} pageHeader
            pageHeader: this.page_header,
            // @property {Boolean} showNoTermMessage
            hasTerms: !!this.profileModel.get('paymentterms'),
            // @property {Boolean} isThereAnyResult
            isThereAnyResult: !!this.collection.length,
            // @property {Boolean} isLoading
            isLoading: this.isLoading,
            // @property {Boolean} showPagination
            showPagination: !!(this.collection.totalRecordsFound && this.collection.recordsPerPage),
            // @property {Boolean} showCurrentPage
            showCurrentPage: this.options.showCurrentPage,
            // @property {Boolean} showBackToAccount
            showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD'
        };
    }
});

export = TransactionHistoryListView;
