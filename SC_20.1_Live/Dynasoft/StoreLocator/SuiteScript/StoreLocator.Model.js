/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module StoreLocator
define('StoreLocator.Model', [
    'SC.Model',

    'Application',
    'Utils',
    'Location.Model',
    'Configuration'
], function(
    SCModel,

    Application,
    Utils,
    LocationModel,
    Configuration
) {
    // @class StoreLocator.Model
    // @extends SCModel
    return LocationModel.extend({
        name: 'StoreLocator',
        // @method list Overrides filters for the retrieving the first three nearest stores.
        // @param {Object} data
        // @returns {Array<Object>} list of stores
        list: function (data) {
            data.locationtype =
                data.locationtype || Configuration.get('storeLocator.defaultTypeLocations');
            var result = this.search(data);
            if (!result.length && !result.recordsPerPage) {
                data.radius = undefined;
                data.results_per_page =
                    data.results_per_page ||
                        Configuration.get('storeLocator.defaultQuantityLocations');
                data.page = 1;
                result = this.search(data);
            }
            return result;
        },

        getDealer: function(data) {
            this.result = {};

            this.data = data;

            const internalid = _.isArray(this.data.internalid)
                ? this.data.internalid
                : this.data.internalid.split(',');
            const search_results = this.dealerSearch(data);

            if (internalid.length === 1) {
                this.result = search_results[0];
            } else {
                this.result = search_results;
            }

            return this.result;
        },

        getDealerList: function(data){
            data.locationtype =
                data.locationtype || Configuration.get('storeLocator.defaultTypeLocations');
            var result = this.dealerSearch(data);
            if (!result.length && !result.recordsPerPage) {
                data.radius = undefined;
                data.results_per_page =
                    data.results_per_page ||
                        Configuration.get('storeLocator.defaultQuantityLocations');
                data.page = 1;
                result = this.dealerSearch(data);
            }
            return result;
        },

        dealerSearch: function (data) {
            this.columns= {
                name: new nlobjSearchColumn('custrecord_ek_dealer_loc_name'),
                address1: new nlobjSearchColumn('custrecord_ek_dealer_loc_address1'),
                address2: new nlobjSearchColumn('custrecord_ek_dealer_loc_address2'),
                city: new nlobjSearchColumn('custrecord_ek_dealer_loc_city'),
                country: new nlobjSearchColumn('custrecord_ek_dealer_loc_country'),
                state: new nlobjSearchColumn('custrecord_ek_dealer_loc_state'),
                internalid: new nlobjSearchColumn('internalid'),
                isinactive: new nlobjSearchColumn('isinactive'),
                phone: new nlobjSearchColumn('custrecord_ek_dealer_loc_phone'),
                zip: new nlobjSearchColumn('custrecord_ek_dealer_loc_zip'),
                latitude: new nlobjSearchColumn('custrecord_ek_dealer_loc_latitude'),
                longitude: new nlobjSearchColumn('custrecord_ek_dealer_loc_longitude'),
                'locationtype:': new nlobjSearchColumn('custrecord_ek_dealer_loc_locationtype')
            };
            var result = {};
            var records = [];
            var self = this;
            this.filters = [];
            this.data = data;
            this.filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
            if (this.data.locationtype) {
                var location_type = _.isArray(this.data.locationtype)
                    ? this.data.locationtype
                    : this.data.locationtype.split(',');
                this.filters.push(new nlobjSearchFilter('custrecord_ek_dealer_loc_locationtype', null, 'anyof', location_type));
            }
            if (this.data.latitude && this.data.longitude) {
                // Automatic location detection fails, without completing the latitude and longitude fields.
                // Delete this filters when fixed.
                this.filters.push(new nlobjSearchFilter('custrecord_ek_dealer_loc_latitude', null, 'isnotempty'));
                this.filters.push(new nlobjSearchFilter('custrecord_ek_dealer_loc_longitude', null, 'isnotempty'));
                var formula = this.getDistanceFormulates()
                    .replace(/longitude/g, 'custrecord_ek_dealer_loc_longitude')
                    .replace(/latitude/g, 'custrecord_ek_dealer_loc_latitude');

                if (this.data.radius) {
                    this.filters.push(new nlobjSearchFilter('formulanumeric', null, 'lessthan', this.data.radius).setFormula(formula));
                }
                // Validate that the formula returns some value.
                this.filters.push(new nlobjSearchFilter('formulanumeric', null, 'noneof', '@NONE@'));
                this.columns.distance = new nlobjSearchColumn('formulanumeric')
                    .setFormula(formula)
                    .setFunction('roundToTenths');
            }
            if (this.data.internalid) {
                var internalid = _.isArray(this.data.internalid)
                    ? this.data.internalid
                    : this.data.internalid.split(',');
                this.filters.push(new nlobjSearchFilter('internalid', null, 'anyof', internalid));
            }
            // DSC custom filter for store type
            if (this.data.storeType) {
                this.filters.push(new nlobjSearchFilter('custrecord_ek_dealer_loc_store_type', null, 'anyof', this.data.storeType));
            }
            this.columns.custrecord_dsc_store_type = new nlobjSearchColumn('custrecord_ek_dealer_loc_store_type');
            if (this.data.sort) {
                _.each(this.data.sort.split(','), function (column_name) {
                    if (self.columns[column_name]) {
                        self.columns[column_name].setSort(self.data.order >= 0);
                    }
                });
            }

            if (this.data.page === 'all') {
                this.search_results = Application.getAllSearchResults('customrecord_ek_dealer_location', _.values(this.filters), _.values(this.columns));
            }
            else {
                this.search_results = Application.getPaginatedSearchResults({
                    record_type: 'customrecord_ek_dealer_location',
                    filters: _.values(this.filters),
                    columns: _.values(this.columns),
                    page: this.data.page || 1,
                    results_per_page: this.data.results_per_page
                });
            }
            
            var results = (this.data.page === 'all' ? this.search_results : this.search_results.records) ||
                [] ||
                [];

            _.each(results, function (record) {
                records.push(self.getDealerRecordValues(record));
            });
            if (this.data.page === 'all' || this.data.internalid) {
                result = records;
            }
            else {
                result = this.search_results;
                result.records = records;
            }
            return result;
        },

        getDealerRecordValues: function (record) {
            var map_result = {};
            var id = record.getValue('internalid');
            var friendlyName = this.getFriendlyName(id);
            // @property {String} recordtype
            map_result.recordtype = record.getRecordType();
            // @property {String} internalid
            map_result.internalid = id;
            // @property {String} address1
            map_result.address1 = record.getValue('custrecord_ek_dealer_loc_address1');
            // @property {String} address2
            map_result.address2 = record.getValue('custrecord_ek_dealer_loc_address2');
            // @property {String} address3
            // map_result.address3 = record.getValue('address3');
            // @property {String} city
            map_result.city = record.getValue('custrecord_ek_dealer_loc_city');
            // @property {String} country
            map_result.country = record.getText('custrecord_ek_dealer_loc_country');
            // @property {String} state
            map_result.state = record.getText('custrecord_ek_dealer_loc_state');
            
            map_result.name =
                friendlyName !== '' ? friendlyName : record.getValue('custrecord_ek_dealer_loc_name');
            // @property {String} phone
            map_result.phone = record.getValue('custrecord_ek_dealer_loc_phone');
            // @property {String} zip
            map_result.zip = record.getValue('custrecord_ek_dealer_loc_zip');
            // @property {Object} location
            map_result.location = {
                // @property {String} latitude
                latitude: record.getValue('custrecord_ek_dealer_loc_latitude'),
                // @property {String} longitude
                longitude: record.getValue('custrecord_ek_dealer_loc_longitude')
            };
            // @property {Number} locationtype
            map_result.locationtype = record.getValue('custrecord_ek_dealer_loc_locationtype');
            if (this.data.latitude && this.data.longitude) {
                var distance = Math.round(record.getValue('formulanumeric') * 10) / 10;

                if (!_.isUndefined(distance)) {
                    // @property {Number} distance
                    map_result.distance = Math.round(record.getValue('formulanumeric') * 10) / 10;
                    map_result.distanceunit = Configuration.get().storeLocator.distanceUnit;
                }
            }

            map_result.storeType = record.getValue('custrecord_ek_dealer_loc_store_type');
            return map_result;
        },
        // @method search
        // @param {Object}
        // @return {Location.Result}
        search: function (data) {
            var result = {};
            var records = [];
            var self = this;
            this.filters = [];
            this.data = data;
            this.filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
            if (this.data.locationtype) {
                var location_type = _.isArray(this.data.locationtype)
                    ? this.data.locationtype
                    : this.data.locationtype.split(',');
                this.filters.push(new nlobjSearchFilter('locationtype', null, 'anyof', location_type));
            }
            if (this.data.latitude && this.data.longitude) {
                // Automatic location detection fails, without completing the latitude and longitude fields.
                // Delete this filters when fixed.
                this.filters.push(new nlobjSearchFilter('latitude', null, 'isnotempty'));
                this.filters.push(new nlobjSearchFilter('longitude', null, 'isnotempty'));
                var formula = this.getDistanceFormulates();
                if (this.data.radius) {
                    this.filters.push(new nlobjSearchFilter('formulanumeric', null, 'lessthan', this.data.radius).setFormula(formula));
                }
                // Validate that the formula returns some value.
                this.filters.push(new nlobjSearchFilter('formulanumeric', null, 'noneof', '@NONE@'));
                this.columns.distance = new nlobjSearchColumn('formulanumeric')
                    .setFormula(formula)
                    .setFunction('roundToTenths');
            }
            if (this.data.internalid) {
                var internalid = _.isArray(this.data.internalid)
                    ? this.data.internalid
                    : this.data.internalid.split(',');
                this.filters.push(new nlobjSearchFilter('internalid', null, 'anyof', internalid));
            }
            // // DSC custom filter for store type
            // if (this.data.storeType) {
            //     this.filters.push(new nlobjSearchFilter('custrecord_dsc_store_type', null, 'anyof', this.data.storeType));
            // }
            // this.columns.custrecord_dsc_store_type = new nlobjSearchColumn('custrecord_dsc_store_type');
            if (this.data.sort) {
                _.each(this.data.sort.split(','), function (column_name) {
                    if (self.columns[column_name]) {
                        self.columns[column_name].setSort(self.data.order >= 0);
                    }
                });
            }
            if (this.isPickupInStoreEnabled) {
                this.columns.allowstorepickup = new nlobjSearchColumn('allowstorepickup');
                this.columns.timezone = new nlobjSearchColumn('timezone');
                this.columns.nextpickupcutofftime = new nlobjSearchColumn('nextpickupcutofftime');
            }
            if (this.data.page === 'all') {
                this.search_results = Application.getAllSearchResults('location', _.values(this.filters), _.values(this.columns));
            }
            else {
                this.search_results = Application.getPaginatedSearchResults({
                    record_type: 'location',
                    filters: _.values(this.filters),
                    columns: _.values(this.columns),
                    page: this.data.page || 1,
                    results_per_page: this.data.results_per_page
                });
            }
            var results = (this.data.page === 'all' ? this.search_results : this.search_results.records) ||
                [] ||
                [];
            if (this.isPickupInStoreEnabled) {
                this.searchServiceHoursResults = this.searchServiceHours(_.map(results, function (record) {
                    return record.getId();
                }));
            }
            _.each(results, function (record) {
                records.push(self.getRecordValues(record));
            });
            if (this.data.page === 'all' || this.data.internalid) {
                result = records;
            }
            else {
                result = this.search_results;
                result.records = records;
            }
            return result;
        },
        // @method getRecordValues
        // @return {Locator.Model.Result}
        getRecordValues: function (record) {
            var map_result = {};
            var id = record.getValue('internalid');
            var friendlyName = this.getFriendlyName(id);
            // @property {String} recordtype
            map_result.recordtype = record.getRecordType();
            // @property {String} internalid
            map_result.internalid = id;
            // @property {String} address1
            map_result.address1 = record.getValue('address1');
            // @property {String} address2
            map_result.address2 = record.getValue('address2');
            // @property {String} address3
            map_result.address3 = record.getValue('address3');
            // @property {String} city
            map_result.city = record.getValue('city');
            // @property {String} country
            map_result.country = record.getValue('country');
            // @property {String} state
            map_result.state = record.getValue('state');
            // @property {String} isoffice
            map_result.isoffice = record.getValue('isoffice');
            // @property {String} makeinventoryavailable
            map_result.makeinventoryavailable = record.getValue('makeinventoryavailable');
            // @property {String} makeinventoryavailablestore
            map_result.makeinventoryavailablestore = record.getValue('makeinventoryavailablestore');
            // @property {String} name
            map_result.name =
                friendlyName !== '' ? friendlyName : record.getValue('namenohierarchy');
            // @property {String} phone
            map_result.phone = record.getValue('phone');
            // @property {String} zip
            map_result.zip = record.getValue('zip');
            // @property {Object} location
            map_result.location = {
                // @property {String} latitude
                latitude: record.getValue('latitude'),
                // @property {String} longitude
                longitude: record.getValue('longitude')
            };
            // @property {Number} locationtype
            map_result.locationtype = record.getValue('locationtype');
            if (this.data.latitude && this.data.longitude) {
                var distance = Math.round(record.getValue('formulanumeric') * 10) / 10;
                if (!_.isUndefined(distance)) {
                    // @property {Number} distance
                    map_result.distance = Math.round(record.getValue('formulanumeric') * 10) / 10;
                    map_result.distanceunit = Configuration.get().storeLocator.distanceUnit;
                }
            }
            if (this.isPickupInStoreEnabled) {
                // @property {String} openinghours
                map_result.servicehours = this.getServiceHours(id);
                // @property {Object} timezone
                map_result.timezone = {
                    text: record.getText('timezone'),
                    value: record.getValue('timezone')
                };
                // @property {Boolean} allowstorepickup
                map_result.allowstorepickup = record.getValue('allowstorepickup') === 'T';
                if (map_result.allowstorepickup) {
                    // @property {String} nextpickupcutofftime
                    map_result.nextpickupcutofftime = record.getValue('nextpickupcutofftime');
                    var next_pickup_cut_off_time_date = map_result.nextpickupcutofftime &&
                        map_result.nextpickupcutofftime !== ' ' &&
                        nlapiStringToDate(map_result.nextpickupcutofftime);
                    if (next_pickup_cut_off_time_date) {
                        var current_date = Utils.getTodayDate();
                        var days_of_the_week = [
                            'sunday',
                            'monday',
                            'tuesday',
                            'wednesday',
                            'thursday',
                            'friday',
                            'saturday'
                        ];
                        if (current_date.getDay() === next_pickup_cut_off_time_date.getDay()) {
                            map_result.nextpickupday = 'today';
                        }
                        else if (current_date.getDay() + 1 ===
                            next_pickup_cut_off_time_date.getDay()) {
                            map_result.nextpickupday = 'tomorrow';
                        }
                        else {
                            map_result.nextpickupday =
                                days_of_the_week[next_pickup_cut_off_time_date.getDay()];
                        }
                        map_result.nextpickuphour = nlapiDateToString(next_pickup_cut_off_time_date, 'timeofday');
                    }
                    else {
                        // @property {String} nextpickupday
                        map_result.nextpickupday = null;
                        // @property {String} nextpickuphour
                        map_result.nextpickuphour = null;
                        // @property {String} nextpickupcutofftime
                        map_result.nextpickupcutofftime = null;
                    }
                }
            }
            // map_result.storeType = record.getValue('custrecord_dsc_store_type');
            return map_result;
        }
    });
});
