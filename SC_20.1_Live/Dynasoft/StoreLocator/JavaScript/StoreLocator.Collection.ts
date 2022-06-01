/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="StoreLocator.Collection"/>
// @module StoreLocator

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as _ from 'underscore';

import LocationCollection = require('../../../Advanced/Location.SCA/JavaScript/Location.Collection');
import StoreLocatorModel = require('./StoreLocator.Model');

// @class StoreLocator.Collection @extend Backbone.Collection
const StoreLocatorCollection: any = LocationCollection.extend({
    // @property {StoreLocator.Model} model
    model: StoreLocatorModel,

    // @property {String} url
    url: Utils.getAbsoluteUrl('services/StoreLocator.Service.ss'),

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
                        results_per_page: options.results_per_page,
                        // DSC custom field for store type
                        storeType: options.storeType
                    },
                    reset: !!options.reset,
                    killerId: options.killerId
                },
                callbacks
            )
        );
    }
});

export = StoreLocatorCollection;
