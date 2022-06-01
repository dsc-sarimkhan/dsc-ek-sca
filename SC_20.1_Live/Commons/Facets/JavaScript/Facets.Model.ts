/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Facets.Model"/>

import * as _ from 'underscore';

import * as Utils from '../../Utilities/JavaScript/Utils';

import BackboneCachedModel = require('../../BackboneExtras/JavaScript/Backbone.CachedModel');
import ItemCollection = require('../../../Commons/Item/JavaScript/Item.Collection');
import Session = require('../../../Commons/Session/JavaScript/Session');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import Configuration = require('../../Utilities/JavaScript/SC.Configuration');

// @module Facets
const original_fetch = BackboneCachedModel.prototype.fetch;

// @class Facets.Model @extends Backbone.CachedModel
// Connects to the search api to get all the items and the facets
// A Model Contains a Collection of items and the list of facet groups with its values
export = BackboneCachedModel.extend({
    options: {},

    searchApiMasterOptions: Configuration.get('searchApiMasterOptions.Facets', {}),

    url: function() {
        const profile = ProfileModel.getInstance();
        const url = Utils.addParamsToUrl(
            profile.getSearchApiUrl(),
            _.extend(
                Configuration.get('matrixchilditems.enabled') &&
                    Configuration.get('matrixchilditems.fieldset')
                    ? {
                          matrixchilditems_fieldset: Configuration.get('matrixchilditems.fieldset')
                      }
                    : {},
                this.searchApiMasterOptions,
                Session.getSearchApiParams()
            ),
            profile.isAvoidingDoubleRedirect(this.force_avoid_redirect)
        );

        return url;
    },

    initialize: function(options) {
        if (options && options.searchApiMasterOptions) {
            this.searchApiMasterOptions = options.searchApiMasterOptions;
        }

        // Listen to the change event of the items and converts it to an ItemCollection
        this.on('change:items', function(model, items) {
            if (!(items instanceof ItemCollection)) {
                // NOTE: Compact is used to filter null values from response
                model.set('items', new ItemCollection(_.compact(items)));
            }
        });
    },

    // @method fetch overrides fetch so we make sure that the cache is set to true, so we wrap it
    fetch: function(options) {
        Utils.deepExtend(options || {}, this.options);
        if (options.cache === undefined) {
            options.cache = true;
        }
        options.cache = !this.ignoreCache;

        this.force_avoid_redirect = options && options.data && options.data.force_avoid_redirect;

        return original_fetch.apply(this, arguments);
    }
});
