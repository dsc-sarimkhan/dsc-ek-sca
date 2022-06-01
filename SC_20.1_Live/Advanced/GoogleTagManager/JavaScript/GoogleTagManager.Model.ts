/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="GoogleTagManager.Model"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import BackboneModel = require('../../../Commons/BackboneExtras/JavaScript/Backbone.Model');

export = BackboneModel.extend({
    urlRoot: Utils.getAbsoluteUrl('services/GoogleTagManager.Service.ss'),

    getDataLayer: function(data) {
        const deferred = jQuery.Deferred();

        const self = this;

        self.set('id', data.id);
        self.set('events', data.events);
        this.save().done(function(result) {
            self.set('events', result.events);
            self.set('internalid', result.internalid);
            deferred.resolve();
        });

        return deferred.promise();
    },
    saveEvent: function(data) {
        const deferred = jQuery.Deferred();
        const self = this;

        this.set('events', data);
        self.save().done(function() {
            deferred.resolve();
        });

        return deferred.promise();
    }
});
