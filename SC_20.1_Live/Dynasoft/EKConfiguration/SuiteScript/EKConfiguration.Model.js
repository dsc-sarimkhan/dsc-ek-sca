// @module EKConfiguration
define('EKConfiguration.Model', [
    'SC.Model',
    'Application',
], function(
    SCModel,
    Application
) {
    // @class EKConfiguration.Model
    // @extends SCModel
    return SCModel.extend({
        name: 'EKConfiguration',

        getByKey: function(data){
            this.data = data;
            
            var search_results = this.search(data);
            if(search_results.records && search_results.records[0]){
                return search_results.records[0]; //
            }else{
                return {}
            }
        },

        // @method search
        // @param {Object}
        // @return {EKConfiguration.Result}
        search: function (data) {
            this.columns = {
                id: new nlobjSearchColumn('internalid'),
                key: new nlobjSearchColumn('custrecord_dsc_ek_config_key'),
                value: new nlobjSearchColumn('custrecord_dsc_ek_config_value')
            };
            
            var result = {};
            var records = [];
            var self = this;
            this.filters = [];
            this.data = data;
            
            this.filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
            if (this.data.internalid) {
                var internalid = _.isArray(this.data.internalid)
                    ? this.data.internalid
                    : this.data.internalid.split(',');
                this.filters.push(new nlobjSearchFilter('internalid', null, 'anyof', internalid));
            }
            if (this.data.key) {
                this.filters.push(new nlobjSearchFilter('custrecord_dsc_ek_config_key', null, 'is', this.data.key));
            }
            if (this.data.sort) {
                _.each(this.data.sort.split(','), function (column_name) {
                    if (self.columns[column_name]) {
                        self.columns[column_name].setSort(self.data.order >= 0);
                    }
                });
            }
            if (this.data.page === 'all') {
                this.search_results = Application.getAllSearchResults('customrecord_dsc_ek_configurations', _.values(this.filters), _.values(this.columns));
            }
            else {
                this.search_results = Application.getPaginatedSearchResults({
                    record_type: 'customrecord_dsc_ek_configurations',
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
            // @property {String} recordtype
            map_result.recordtype = record.getRecordType();
            // @property {String} internalid
            map_result.internalid = record.getValue('internalid');
            // @property {String} address1
            map_result.key = record.getValue('custrecord_dsc_ek_config_key');
            // @property {String} address2
            map_result.value = record.getValue('custrecord_dsc_ek_config_value');
            return map_result;
        }
    });
});
