/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Subscriptions.Collection"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import SubscriptionsModel = require('./Subscriptions.Model');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

export interface SubscriptionBillingAccount {
    internalId: number;
    name: string;
}
// @class Subscriptions.Collection @extend Backbone.Collection
export const SubscriptionsCollection: any = Backbone.Collection.extend({
    // @property {Subscriptions.Model} model
    model: SubscriptionsModel,
    // @property {Boolean} cacheSupport enable or disable the support for cache (Backbone.CachedModel)
    cacheSupport: false,
    // @property {String} url
    url: Utils.getAbsoluteUrl('SC/Subscriptions/Subscriptions.ss', true),

    initialize: function(models, options) {
        this.customFilters = options && options.filters;
    },

    // @method parse Handle the response from the back-end to properly manage total records found value
    // @param {Object} response JSON Response from the back-end service
    // @return {Array<Object>} List of returned records from the back-end
    parse: function(response) {
        const original_items = _.compact(response);
        const items = _.sortBy(original_items, function(o: any) {
            return o.isActive;
        });

        if (!_.isUndefined(response.totalRecordsFound)) {
            this.totalRecordsFound = response.totalRecordsFound;
            this.recordsPerPage = response.recordsPerPage;
        }

        if (!_.isUndefined(response.billingAccounts)) {
            this.billingAccounts = _.toArray(response.billingAccounts);
        }

        return _.toArray(response.subscriptions);
    },

    // @method update Method called by ListHeader.View when applying new filters and constrains
    // @param {Collection.Filter} options
    // @return {Void}
    update: function(options) {
        // @property {DateRange?} range
        const range = options.range || {};

        this.fetch({
            data: {
                // @property {value:String?} filter
                filter: options.filter && options.filter.value,
                from: range.from,
                to: range.to,
                // @property {String?} page
                page: options.page
            },
            reset: true,
            // @property {String?} killerId
            killerId: options.killerId
        });
    }
});
