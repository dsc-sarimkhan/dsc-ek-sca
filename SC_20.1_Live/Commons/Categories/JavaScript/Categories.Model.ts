/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Categories.Model"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';

import BackboneCachedModel = require('../../BackboneExtras/JavaScript/Backbone.CachedModel');

const original_fetch = BackboneCachedModel.prototype.fetch;

// @class Categories.Model @extends Backbone.CachedModel
// Connects to the search api to get all the items and the facets
// A Model Contains a Collection of items and the list of facet groups with its values
const CategoriesModel = BackboneCachedModel.extend({
    url: Utils.getAbsoluteUrl('services/Categories.Service.ss'),

    options: { cache: true },

    initialize: function() {},

    // @method fetch overrides fetch so we make sure that the cache is set to true, so we wrap it
    fetch: function(options) {
        options = _.extend(options || {}, this.options);

        options.cache = !this.ignoreCache;

        return original_fetch.apply(this, arguments);
    }
});

export = CategoriesModel;
