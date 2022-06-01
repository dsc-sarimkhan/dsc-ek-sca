/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="StoreLocator.Collection"/>
// @module StoreLocator

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import LocationCollection = require('../../Location.SCA/JavaScript/Location.Collection');
import StoreLocatorModel = require('./StoreLocator.Model');

// @class StoreLocator.Collection @extend Backbone.Collection
const StoreLocatorCollection: any = LocationCollection.extend({
    // @property {StoreLocator.Model} model
    model: StoreLocatorModel,

    // @property {String} url
    url: Utils.getAbsoluteUrl('services/StoreLocator.Service.ss')
});

export = StoreLocatorCollection;
