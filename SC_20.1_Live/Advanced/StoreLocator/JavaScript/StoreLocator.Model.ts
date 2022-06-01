/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="StoreLocator.Model"/>
// @module StoreLocator

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import LocationModel = require('../../Location.SCA/JavaScript/Location.Model');

const StoreLocatorModel: any = LocationModel.extend({
    // @property {String} urlRoot
    urlRoot: Utils.getAbsoluteUrl('services/StoreLocator.Service.ss')
});

export = StoreLocatorModel;
