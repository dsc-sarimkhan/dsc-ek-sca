// @module EKHomeBanner
define('EKHomeBanner.Model', [
    'SC.Model',
    'Application',
], function (
    SCModel,
    Application
) {
    // @class EKHomeBanner.Model
    // @extends SCModel
    return SCModel.extend({
        name: 'EKHomeBanner',

        list: function (data) {

            var search_results = this.search(data);

            return search_results;
        },
        // @method search
        // @param {Object}
        // @return {EKHomeBanner.Result}
        search: function (data) {
            this.columns = {
                id: new nlobjSearchColumn('internalid'),
                seq_number: new nlobjSearchColumn('custrecord_ek_home_banner_seq'),
                img_url: new nlobjSearchColumn('custrecord_ek_home_banner_img'),
                nav_url: new nlobjSearchColumn('custrecordek_home_banner_url')
            };
            this.columns.seq_number.setSort();//sort by sequence number

            var records = [];
            var self = this;
            this.filters = [];
            this.filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

            this.search_results = Application.getAllSearchResults('customrecord_ek_home_banner', _.values(this.filters), _.values(this.columns));

            var results = this.search_results || [];

            _.each(results, function (record) {
                records.push(self.getRecordValues(record));
            });

            return records;
        },
        // @method getRecordValues
        // @return {Locator.Model.Result}
        getRecordValues: function (record) {
            var map_result = {};
            // @property {String} recordtype
            map_result.recordtype = record.getRecordType();
            map_result.internalid = record.getValue('internalid');
            map_result.seq_number = record.getValue('custrecord_ek_home_banner_seq');
            map_result.img_url = record.getText('custrecord_ek_home_banner_img');
            map_result.nav_url = record.getValue('custrecordek_home_banner_url');

            return map_result;
        }
    });
});