/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Item.Collection"/>
import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';

import BackboneCachedCollection = require('../../BackboneExtras/JavaScript/Backbone.CachedCollection');
import ItemModel = require('./Item.Model');
import Session = require('../../Session/JavaScript/Session');
import ProfileModel = require('../../Profile/JavaScript/Profile.Model');

const ItemCollection: any = BackboneCachedCollection.extend({
    url: function() {
        const profile = ProfileModel.getInstance();
        const url = Utils.addParamsToUrl(
            profile.getSearchApiUrl(),
            _.extend({}, this.searchApiMasterOptions, Session.getSearchApiParams()),
            profile.isAvoidingDoubleRedirect()
        );

        return url;
    },

    model: ItemModel,

    // http://backbonejs.org/#Model-parse
    parse: function(response) {
        // NOTE: Compact is used to filter null values from response
        return _.compact(response.items) || null;
    }
});
export = ItemCollection;
