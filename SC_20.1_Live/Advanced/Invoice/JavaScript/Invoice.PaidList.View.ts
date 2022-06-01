/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Invoice.PaidList.View"/>

import '../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView';
import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as invoice_paid_list_tpl from 'invoice_paid_list.tpl';

import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import TransactionListView = require('../../../Commons/Transaction/JavaScript/Transaction.List.View');
import InvoiceCollection = require('./Invoice.Collection');
import ListHeaderView = require('../../../Commons/ListHeader/JavaScript/ListHeader.View');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import RecordViewsView = require('../../RecordViews/JavaScript/RecordViews.View');
import GlobalViewsPaginationView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Pagination.View');
import Handlebars = require('../../../Commons/Utilities/JavaScript/Handlebars');

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import AjaxRequestsKiller = require('../../../Commons/AjaxRequestsKiller/JavaScript/AjaxRequestsKiller');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

// @class Invoice.PaidList.View @extends Backbone.View
const InvoicePaidListView = TransactionListView.extend({
    // @property {Function} template
    template: invoice_paid_list_tpl,

    // @property {String} title
    title: Utils.translate('Invoices'),

    // @property {String} page_header
    page_header: Utils.translate('Invoices'),

    // @property {Object} attributes
    attributes: {
        id: 'PaidInvoicesHistory',
        class: 'PaidInvoices'
    },

    // @method initialize
    initialize: function(options): void {
        let page = '1';

        if (options.routerArguments && options.routerArguments[0]) {
            const params = Utils.parseUrlOptions(options.routerArguments[0]);

            if (params.page) {
                page = params.page.toString();
            }
        }
        this.options.page = page;

        this.collection = new InvoiceCollection();

        this.collection.on('sync', this.showContent, this);

        this.user = ProfileModel.getInstance();

        const today = new Date();
        const isoDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

        this.rangeFilterOptions = {
            fromMin: '1800-01-02',
            fromMax: isoDate,
            toMin: '1800-01-02',
            toMax: isoDate
        };

        // manages sorting and filtering of the collection
        this.listHeader = new ListHeaderView({
            view: this,
            application: options.application,
            collection: this.collection,
            sorts: this.sortOptions,
            rangeFilter: 'date',
            rangeFilterLabel: Utils.translate('From'),
            hidePagination: true
        });

        this.collection.on('sync reset', jQuery.proxy(this, 'render'));
    },

    beforeShowContent: function beforeShowContent() {
        return this.collection.fetch({
            data: {
                status: 'paid',
                page: this.options.page
            },
            killerId: AjaxRequestsKiller.getKillerId()
        });
    },

    // @method getSelectedMenu
    getSelectedMenu: function(): string {
        return 'invoices';
    },

    // @method getBreadcrumbPages
    getBreadcrumbPages: function() {
        return {
            text: this.title,
            href: '/paid-invoices'
        };
    },

    // @property {Array} sortOptions
    // Array of default sort options
    // sorts only apply on the current collection
    // which might be a filtered version of the original
    sortOptions: [
        {
            value: 'closedate',
            name: Utils.translate('By Close Date'),
            selected: true,
            sort: function() {
                return this.sortBy(function(invoice) {
                    return [invoice.get('closedateInMilliseconds'), invoice.get('tranid')];
                });
            }
        },
        {
            value: 'trandate',
            name: Utils.translate('By Invoice Date'),
            sort: function() {
                return this.sortBy(function(invoice) {
                    return [invoice.get('tranDateInMilliseconds'), invoice.get('tranid')];
                });
            }
        },
        {
            value: 'invoicenumber',
            name: Utils.translate('By Invoice Number'),
            sort: function() {
                return this.sortBy(function(invoice) {
                    return parseInt(
                        invoice
                            .get('tranid')
                            .split(/[^\(\)0-9]*/)
                            .join(''),
                        10
                    );
                });
            }
        },
        {
            value: 'amountdue',
            name: Utils.translate('By Amount'),
            sort: function() {
                return this.sortBy(function(invoice) {
                    return invoice.get('amount');
                });
            }
        }
    ],

    // @property {Object} childViews
    childViews: {
        ListHeader: function() {
            return this.listHeader;
        },
        'Invoice.Results': function() {
            return this._resultsView;
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

    _buildResultsView: function() {
        const self = this;
        let selectedColumns = [];

        if (!Configuration.get().transactionListColumns.enableInvoice) {
            selectedColumns.push({ label: 'Date', type: 'date', name: 'date', id: 'trandate' });
            selectedColumns.push({
                label: 'Close Date',
                type: 'date',
                name: 'close-date',
                id: 'closedate'
            });
            selectedColumns.push({
                label: 'Amount',
                type: 'currency',
                name: 'amount',
                id: 'amount_formatted'
            });
        } else {
            selectedColumns = Configuration.get().transactionListColumns.invoicePaid;
        }

        const records_collection = new Backbone.Collection(
            this.collection.map(function(invoice) {
                const model = new Backbone.Model({
                    touchpoint: 'customercenter',
                    title: new Handlebars.SafeString(
                        Utils.translate(
                            'Invoice #<span class="tranid">$(0)</span>',
                            invoice.get('tranid')
                        )
                    ),
                    detailsURL: 'invoices/' + invoice.get('internalid'),

                    id: invoice.get('internalid'),
                    internalid: invoice.get('internalid'),

                    columns: self._buildColumns(selectedColumns, invoice)
                });

                return model;
            })
        );

        return new BackboneCollectionView({
            childView: RecordViewsView,
            collection: records_collection,
            viewsPerRow: 1,
            childViewOptions: {
                referrer: 'paid-invoices'
            }
        });
    },

    // @method getContext @returns Invoice.PaidList.View.Context
    getContext: function() {
        this._resultsView = this._buildResultsView();
        let columns = [];
        if (this._resultsView.collection.length > 0) {
            columns = this._resultsView.collection.at(0).get('columns');
        }
        // @class Invoice.PaidList.View.Context
        return {
            // @property {Invoice.Collection} invoices
            invoices: this.collection,
            // @property {Boolean} showInvoices
            showInvoices: !!this.collection.length,
            // @property {String} pageHeader
            pageHeader: this.page_header,
            // @property {Boolean} showBackToAccount
            showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD',
            // @property {Array<{}>} columns
            columns: columns,
            // @property {Boolean} showPagination
            showPagination: !!(this.collection.totalRecordsFound && this.collection.recordsPerPage)
        };
    }
});

export = InvoicePaidListView;
