/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Quote.List.View"/>
/// <reference path="../../Utilities/JavaScript/GlobalDeclarations.d.ts" />
/// <reference path="../../Utilities/JavaScript/UnderscoreExtended.d.ts" />

import './Quote.ListExpirationDate.View';
import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';

import * as quote_list_tpl from 'quote_list.tpl';

import TransactionListView = require('../../Transaction/JavaScript/Transaction.List.View');
import ListHeaderView = require('../../ListHeader/JavaScript/ListHeader.View');
import QuoteCollection = require('./Quote.Collection');
import RecordViewsView = require('../../../Advanced/RecordViews/JavaScript/RecordViews.View');
import Configuration = require('../../Utilities/JavaScript/SC.Configuration');

import Backbone = require('../../Utilities/JavaScript/backbone.custom');
import BackboneCollectionView = require('../../Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// @class Quote.List.View @extends Backbone.View
export = TransactionListView.extend({
    // @property {Function} template
    template: quote_list_tpl,

    // @property {String} className
    className: 'QuoteListView',

    // @property {String} title
    title: Utils.translate('Quotes'),

    // @property {String} page_header
    page_header: Utils.translate('Quotes'),

    // @property {Object} attributes
    attributes: {
        id: 'QuotesHistory',
        class: 'QuoteListView'
    },

    // @method initialize
    // @param {application:AplpicationSkeleton} options
    // @return {Void}
    initialize: function(options): void {
        this.application = options.application;
        this.collection = new QuoteCollection();

        this.listenCollection();
        this.setupListHeader();
        this.collection.on('reset', this.showContent, this);
    },

    // @method listenCollection Attaches to the current collection events request and reset to indicate if it is loading data or not
    // @return {Void}
    listenCollection: function(): void {
        this.setLoading(true);

        this.collection.on({
            request: _.bind(this.setLoading, this, true),
            reset: _.bind(this.setLoading, this, false)
        });
    },

    // @method setupListHeader Initialize the list header component
    // @return {Void}
    setupListHeader: function(): void {
        // manges sorting and filtering of the collection
        this.listHeader = new ListHeaderView({
            view: this,
            application: this.application,
            collection: this.collection,
            filters: this.filterOptions,
            sorts: this.sortOptions,
            allowEmptyBoundaries: true
        });
    },

    // @method setLoading Set the loading status of the current view
    // @param {Boolean} is_loading
    // @return {Void}
    setLoading: function(is_loading): void {
        // @property {Boolean} isLoading
        this.isLoading = is_loading;
    },

    // @property {Array<ListHeader.View.FilterOption>} filterOptions
    filterOptions: [
        {
            value: 'ALL',
            name: Utils.translate('Show all statuses'),
            selected: true
        },
        {
            value: '14',
            name: Utils.translate('Closed Lost')
        },
        {
            value: '8',
            name: Utils.translate('In Discussion')
        },
        {
            value: '9',
            name: Utils.translate('Identified Decision Makers')
        },
        {
            value: '10',
            name: Utils.translate('Proposal')
        },
        {
            value: '11',
            name: Utils.translate('In Negotiation')
        },
        {
            value: '12',
            name: Utils.translate('Purchasing')
        }
    ],

    // @property {Array<ListHeader.View.SortOption>} sortOptions
    sortOptions: [
        {
            value: 'tranid',
            name: Utils.translate('by Number'),
            selected: true
        },
        {
            value: 'trandate',
            name: Utils.translate('by Request date')
        },
        {
            value: 'duedate',
            name: Utils.translate('by Expiration date')
        },
        {
            value: 'total',
            name: Utils.translate('by Amount')
        }
    ],

    // @method getSelectedMenu Indicates what my account menu is selected when this view is being rendered
    // @return {String}
    getSelectedMenu: function() {
        return 'quotes';
    },

    // @method getBreadcrumbPages
    // @return {BreadcrumbPage}
    getBreadcrumbPages: function() {
        return {
            text: this.title,
            href: '/quotes'
        };
    },

    // @property {ChildViews} childViews
    childViews: {
        'Quote.List.Items': function() {
            return this._resultsView;
        },
        'List.Header': function() {
            return this.listHeader;
        }
    },

    _buildResultsView: function() {
        const self = this;
        const records_collection = new Backbone.Collection(
            this.collection.map(function(quote) {
                const quote_internalid = quote.get('internalid');
                let selectedColumns = [];

                if (!Configuration.get().transactionListColumns.enableQuote) {
                    selectedColumns.push({
                        label: 'Request date:',
                        type: 'request-date',
                        name: 'request-date',
                        id: 'trandate'
                    });
                    selectedColumns.push({
                        label: 'Amount:',
                        type: 'currency',
                        name: 'amount-date',
                        id: 'total_formatted'
                    });
                    selectedColumns.push({
                        label: 'Expiration date:',
                        type: 'expiration-date',
                        name: 'expiration-date',
                        compositeKey: 'QuoteListExpirationDateView',
                        composite: 'Quote.ListExpirationDate.View'
                    });
                    selectedColumns.push({
                        label: 'Status:',
                        type: 'status',
                        name: 'status',
                        id: 'status'
                    });
                } else {
                    selectedColumns = Configuration.get().transactionListColumns.quote;
                }

                return new Backbone.Model({
                    touchpoint: 'customercenter',
                    title: Utils.translate('Quote #$(0)', quote.get('tranid')),
                    detailsURL: '#/quotes/' + quote_internalid,
                    id: quote_internalid,
                    internalid: quote_internalid,
                    columns: self._buildColumns(selectedColumns, quote)
                });
            })
        );

        return new BackboneCollectionView({
            childView: RecordViewsView,
            collection: records_collection,
            viewsPerRow: 1
        });
    },

    // @method destroy Override default method to  from collection events
    // @return {Void}
    destroy: function() {
        this.collection.off('request reset');

        (<any>BackboneView.prototype).destroy.apply(this, arguments);
    },

    // @method getContext
    // @return {Quote.List.View.Context}
    getContext: function() {
        this._resultsView = this._buildResultsView();
        let columns = [];
        if (this._resultsView.collection.length > 0) {
            columns = this._resultsView.collection.at(0).get('columns');
        }
        // @class Quote.List.View.Context
        return {
            // @property {String} pageHeader
            pageHeader: this.page_header,
            // @property {Array} collection
            collection: this.collection,
            // @property {Boolean} collectionLength
            collectionLength: this.collection.length,
            // @property {Boolean} isLoading
            isLoading: this.isLoading,
            // @property {Boolean} showBackToAccount
            showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD',
            // @property {Array<{}>} columns
            columns: columns
        };
        // @class Quote.List.View
    }
});
