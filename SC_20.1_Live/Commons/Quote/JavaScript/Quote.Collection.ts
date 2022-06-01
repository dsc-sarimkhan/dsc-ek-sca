/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Quote.Collection"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';

import QuoteModel = require('./Quote.Model');
import Backbone = require('../../Utilities/JavaScript/backbone.custom');

// @class Quote.Collection @extends Backbone.Collection
const QuoteCollection: any = Backbone.Collection.extend({
    // @property {Quote.Model} model
    model: QuoteModel,

    // @property {String} url
    url: 'services/Quote.Service.ss?types=Estimate',

    // @method parse
    // @param {Quote.Model.List.Result} response This is the backend service response when fetching the model\
    // @return {Arra<Transaction.Model.List.Result.Record>}
    parse: function(response) {
        this.totalRecordsFound = response.totalRecordsFound;
        this.recordsPerPage = response.recordsPerPage;

        return response.records;
    },

    // @method update Method used by the ListHeader to filter the current list when seeing the Quote List
    // @param {Collection.Filter} options
    // @return {Void}
    update: function(options): void {
        const range = options.range || {};
        const from = range.from && Utils.stringToDate(range.from);
        const to = range.to && Utils.stringToDate(range.to);

        this.fetch({
            data: {
                filter: options.filter.value,
                sort: options.sort.value,
                order: options.order,
                from: from || null,
                to: to || null,
                page: options.page
            },
            reset: true,
            killerId: options.killerId
        });
    }
});

export = QuoteCollection;
