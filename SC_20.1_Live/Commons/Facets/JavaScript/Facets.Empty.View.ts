/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Facets.Empty.View"/>

import * as facets_empty_tpl from 'facets_empty.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @module Facets
// @class Facets.Empty.View @extends Backbone.View
export = BackboneView.extend({
    template: facets_empty_tpl,

    // @method getContext @returns {Facets.Empty.View.Context}
    getContext: function() {
        // @class Facets.Empty.View.Context
        return {
            // @property {String} keywords
            keywords: this.options.keywords
        };
        // @classFacets.Empty.View.View
    }
});
