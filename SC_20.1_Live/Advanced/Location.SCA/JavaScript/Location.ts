/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Location"/>

import * as _ from 'underscore';
import './Location.ProductLine';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import LocationCollection = require('./Location.Collection');
import LocationModel = require('./Location.Model');
import TransactionModel = require('../../../Commons/Transaction/JavaScript/Transaction.Model');
import Cookies = require('../../../Commons/Utilities/JavaScript/js.cookie');

const locations_cache = {};

function fetchLocations(location_ids) {
    location_ids = _.isArray(location_ids) ? location_ids : [location_ids];

    const location_id_to_fetch = _.filter(location_ids, function(internalid: any) {
        return !locations_cache[internalid] ? internalid : false;
    });
    let promise = jQuery.Deferred();

    location_ids = _.unique(_.compact(location_ids));

    if (location_id_to_fetch.length) {
        if (location_id_to_fetch.length === 1) {
            promise = new LocationModel({ internalid: location_id_to_fetch[0] })
                .fetch()
                .done(function(location) {
                    locations_cache[location.internalid] = location;
                });
        } else {
            promise = new LocationCollection()
                .fetch({
                    data: {
                        internalid: location_id_to_fetch.join(',')
                    }
                })
                .done(function(locations) {
                    _.each(locations, function(location: any) {
                        locations_cache[location.internalid] = location;
                    });
                });
        }
    } else {
        promise.resolve();
    }

    return promise;
}

// @class ProductDetailToQuote @extend ApplicationModule
const Location = {
    // @method get
    // @param {String} location_id
    // @return {Object}
    get: function(location_id) {
        return locations_cache[location_id] || {};
    },
    // @method fetchLocations
    // @param {Array || String} location_ids
    // @return {jQuery.Deferred}
    fetchLocations: fetchLocations,
    // @method mountToApp
    // @param {ApplicationSkeleton} application
    // @return {Void}
    mountToApp: function mountToApp() {
        const original_transaction_model_fn = TransactionModel.prototype.initialize;

        TransactionModel.prototype.initialize = function initialize() {
            original_transaction_model_fn.apply(this, arguments);

            this.on('change:lines', function(model) {
                const default_location_id = Cookies.get('myStore');
                const lines = model.get('lines');
                const is_cart = this.get('internalid') === 'cart';
                const location_ids = lines.map(function(line) {
                    return line.get('location') && line.get('location').get('internalid');
                });

                if (!location_ids.length) {
                    return;
                }

                if (is_cart && default_location_id) {
                    location_ids.push(default_location_id);
                }

                fetchLocations(location_ids).done(function() {
                    lines.each(function(line) {
                        const internalid =
                            (line.get('location') && line.get('location').get('internalid')) ||
                            (is_cart ? default_location_id : null);

                        if (internalid) {
                            line.get('location').set(locations_cache[internalid]);
                        }
                    });
                });
            });
        };
    }
};

export = Location;
