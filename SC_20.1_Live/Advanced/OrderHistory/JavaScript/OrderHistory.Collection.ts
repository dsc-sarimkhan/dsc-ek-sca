/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderHistory.Collection"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import TransactionCollection = require('../../../Commons/Transaction/JavaScript/Transaction.Collection');
import OrderHistoryModel = require('./OrderHistory.Model');

// @class OrderHistory.Collection @extend Transaction.Collection
const OrderHistoryCollection: any = TransactionCollection.extend({
    // @property {OrderHistory.Model} model
    model: OrderHistoryModel,
    // @property {Boolean} cacheSupport enable or disable the support for cache (Backbone.CachedModel)
    cacheSupport: false,
    // @property {String} url
    url: Utils.getAbsoluteUrl('services/OrderHistory.Service.ss'),

    initialize: function(models, options) {
        TransactionCollection.prototype.initialize.apply(this, arguments);

        this.customFilters = options && options.filters;
    },

    // @method parse Handle the response from the back-end to properly manage total records found value
    // @param {Object} response JSON Response from the back-end service
    // @return {Array<Object>} List of returned records from the back-end
    parse: function(response) {
        this.totalRecordsFound = response.totalRecordsFound;
        this.recordsPerPage = response.recordsPerPage;

        return response.records;
    },

    // @method update Method called by ListHeader.View when applying new filters and constrains
    // @param {Collection.Filter} options
    // @return {Void}
    update: function(options) {
        const range = options.range || {};
        const data = {
            filter: this.customFilters || (options.filter && options.filter.value),
            sort: options.sort.value,
            order: options.order,
            from: range.from,
            to: range.to,
            page: options.page
        };

        this.fetch({
            data: data,
            reset: true,
            killerId: options.killerId
        });
    }
});

export = OrderHistoryCollection;
