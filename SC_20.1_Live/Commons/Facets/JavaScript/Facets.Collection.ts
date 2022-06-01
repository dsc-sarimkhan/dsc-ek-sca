/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Facets.Collection"/>

import FacetsModel = require('./Facets.Model');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');

import BackboneCachedCollection = require('../../../Commons/BackboneExtras/JavaScript/Backbone.CachedCollection');

// @module Facets
export = BackboneCachedCollection.extend({
    url: ProfileModel.getInstance().getSearchApiUrl(),

    model: FacetsModel,

    parse: function(response) {
        return [response];
    }
});
