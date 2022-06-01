/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Facets.ItemListSummary.View"/>

import * as facets_item_list_summary_tpl from 'facets_item_list_summary.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @module Facets
export = BackboneView.extend({
    template: facets_item_list_summary_tpl,

    // @method getContext @returns {Facets.ItemListSummary.View.Context}
    getContext: function() {
        const { configuration } = this.options;
        const range_end = configuration.currentPage * configuration.itemPerPage;
        const total = configuration.totalItems;

        // @class Facets.ItemListSummary.View.Context
        return {
            // @property {Number} rangeEnd
            rangeEnd: Math.min(range_end, total),

            // @property {Number} rangeStart
            rangeStart: range_end - configuration.itemsPerPage + 1,

            // @property {total} rangeStart
            total: total
        };
    }
});
