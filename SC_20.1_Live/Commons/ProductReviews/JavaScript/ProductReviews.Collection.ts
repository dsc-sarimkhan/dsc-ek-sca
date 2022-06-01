/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductReviews.Collection"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';

import Model = require('./ProductReviews.Model');
import BackboneCachedCollection = require('../../BackboneExtras/JavaScript/Backbone.CachedCollection');
import Configuration = require('../../Utilities/JavaScript/SC.Configuration');

// @class ProductReviews.Collection
// Returns an extended version of the CachedCollection constructor
// @extends Backbone.CachedCollection
export = BackboneCachedCollection.extend({
    url: Utils.addParamsToUrl(Utils.getAbsoluteUrl('services/ProductReviews.Service.ss'), {
        'no-cache': new Date().getTime()
    }),

    model: Model,

    // pre-processes the data after fetching
    // http://backbonejs.org/#Model-parse
    parse: function(data) {
        // We set up some global attributes to the Collection
        this.page = data.page;
        this.recordsPerPage = data.recordsPerPage;
        this.totalRecordsFound = data.totalRecordsFound;
        this.totalPages = Math.ceil(this.totalRecordsFound / this.recordsPerPage);

        // and we return only the collection from the server
        return data.records;
    },

    // @method parseOptions @param {Object} options
    parseOptions: function(options) {
        if (options) {
            if (options.filter) {
                options.filter = options.filter.id;
            }

            if (options.sort) {
                options.sort = options.sort.id;
            }

            options.itemid = this.itemid;
        }

        return options;
    },

    // @method getReviewParams Parse url options and return product reviews api params
    // @param {filter:String,itemid:String,sort:String} options url parameters
    // @return {Object} reviews_params
    getReviewParams: function(options) {
        let sort;
        let filter;
        // Cumputes Params for Reviews API
        let reviews_params: any = {};

        if (options) {
            if (options.itemid) {
                reviews_params.itemid = options.itemid;
            }

            // if there's a filter in the URL
            if (options.filter) {
                // we get it from the config file, based on its id
                filter =
                    _.find(Configuration.get('productReviews.filterOptions'), function(i) {
                        return i.id === options.filter;
                    }) || {};
            } else {
                // otherwise we just get the default one
                filter =
                    _.find(Configuration.get('productReviews.filterOptions'), function(i) {
                        return i.isDefault;
                    }) || {};
            }
            // and we add it to the reviews_params obj
            reviews_params = _.extend(reviews_params, filter.params);

            // same for sorting, if it comes as a parameter
            if (options.sort) {
                // we get it from the config file
                sort =
                    _.find(Configuration.get('productReviews.sortOptions'), function(i) {
                        return i.id === options.sort;
                    }) || {};
            } else {
                // otherwise we just get the default one
                sort =
                    _.find(Configuration.get('productReviews.sortOptions'), function(i) {
                        return i.selected;
                    }) || {};
            }
            if (Object.keys(sort).length === 0) {
                sort =
                    _.find(Configuration.get('productReviews.sortOptions'), function(i) {
                        return i.isDefault;
                    }) || {};
            }
            // and we add it to the reviews_params obj
            const params =
                options.order === 'inverse'
                    ? { order: `${sort.params.order.split(':')[0]}:DESC` }
                    : sort.params;
            reviews_params = _.extend(reviews_params, params);
        }

        // If there's a specific page in the url, we pass that to
        // if there isn't, we just get the first oen
        reviews_params = _.extend(reviews_params, { page: (options && options.page) || 1 });

        return reviews_params;
    },

    // @method update
    // custom method called by ListHeader view  it receives the currently applied filter,
    // currently applied sort and currently applied order
    // @param options
    update: function(options) {
        const data = this.getReviewParams(this.parseOptions(options));

        if (data.order) {
            // check for inverse results
            data.order =
                options.order && options.order < 0
                    ? data.order.replace('ASC', 'DESC')
                    : data.order.replace('DESC', 'ASC');
        }

        this.fetch({
            data: data,
            reset: true,
            killerId: options.killerId
        });
    }
});
