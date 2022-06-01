/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Location.Collection"/>
import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import LocationModel = require('./Location.Model');
import BackboneCachedCollection = require('../../../Commons/BackboneExtras/JavaScript/Backbone.CachedCollection');

// @class Location.Collection @extend Backbone.Collection
const LocationCollection: any = BackboneCachedCollection.extend({
    // @property {Location.Model} model
    model: LocationModel,

    // @property {String} url
    url: Utils.getAbsoluteUrl('services/Location.Service.ss'),

    // @method parse Transforms the JSON response to extract  the array of models from the correct
    // response as to know what page is loaded
    parse: function parse(response) {
        if (!_.isUndefined(response.totalRecordsFound)) {
            this.totalRecordsFound = response.totalRecordsFound;
            this.recordsPerPage = response.recordsPerPage;
            return response.records;
        }
        return response;
    },

    // @method update
    // @param {Object} options
    // @param {Object} callbacks
    update: function update(options, callbacks) {
        return this.fetch(
            _.extend(
                {
                    data: {
                        // @property {String} latitude
                        latitude: options.latitude,
                        // @property {String} longitude
                        longitude: options.longitude,
                        // @property {String} radius
                        radius: options.radius,
                        // @property {String} sort
                        sort: options.sort,
                        // @property {Number} page
                        page: options.page,
                        // @property {Number} locationtype
                        locationtype: options.locationtype,
                        // @property {Number} results_per_page
                        results_per_page: options.results_per_page
                    },
                    reset: !!options.reset,
                    killerId: options.killerId
                },
                callbacks
            )
        );
    }
});

export = LocationCollection;
