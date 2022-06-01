/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Subscriptions.Line.Collection"/>
import Model = require('./Subscriptions.Line.Model');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

const SubscriptionsLineCollection: any = Backbone.Collection.extend({
    model: Model
});

export = SubscriptionsLineCollection;
