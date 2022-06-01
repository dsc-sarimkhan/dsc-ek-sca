/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Merchandising.Item.Collection">
import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import ItemCollection = require('../../../Commons/Item/JavaScript/Item.Collection');
import Session = require('../../../Commons/Session/JavaScript/Session');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');

// @module Merchandising

// @class Merchandising.ItemCollection Item collection used for the merchandising zone
// we declare a new version of the ItemCollection
// to make sure the urlRoot doesn't get overridden
// @extends Item.Collection
export = ItemCollection.extend({
    url: function() {
        const profile = ProfileModel.getInstance();
        return Utils.addParamsToUrl(
            profile.getSearchApiUrl(),
            _.extend({}, this.searchApiMasterOptions, Session.getSearchApiParams()),
            profile.isAvoidingDoubleRedirect()
        );
    }
});
