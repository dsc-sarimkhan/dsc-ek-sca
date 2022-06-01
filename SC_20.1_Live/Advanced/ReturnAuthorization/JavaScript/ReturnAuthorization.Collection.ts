/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ReturnAuthorization.Collection"/>
// @module ReturnAuthorization.Collection

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import Model = require('./ReturnAuthorization.Model');
import TransactionCollection = require('../../../Commons/Transaction/JavaScript/Transaction.Collection');

// @class ReturnAuthorization.Collection @extend Transaction.Collection
const ReturnAuthorizationCollection: any = TransactionCollection.extend({
    model: Model,
    // @property {Boolean} cacheSupport enable or disable the support for cache (Backbone.CachedModel)
    cacheSupport: true,

    url: Utils.getAbsoluteUrl('services/ReturnAuthorization.Service.ss')
});

export = ReturnAuthorizationCollection;
