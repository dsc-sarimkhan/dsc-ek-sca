/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Address.Collection"/>
import Model = require('./Address.Model');
import Backbone = require('../../Utilities/JavaScript/backbone.custom');

// @class Address.Collection @extend Backbone.Collection
const AddressCollection: any = Backbone.Collection.extend({
    // @property {Address.Model} model
    model: Model,

    // @property {String} url
    url: 'services/Address.Service.ss',

    // @method comparator Defines a custom comparative method between address to sort the address taking into account if there are default shipping or default billing
    // @param {Address.Model} model
    // @return {Number}
    comparator: function(model: any) {
        return model.get('defaultbilling') === 'T' || model.get('defaultshipping') === 'T' ? 0 : 1;
    },

    // @method getCollectionForRendering Get the address collection including new address button for rendering
    getCollectionForRendering: function() {
        let cloned_collection;

        if (this && !!this.length) {
            cloned_collection = this.clone();

            const new_address = this.first().clone();
            new_address.set('internalid', '-1');

            cloned_collection.models.push(new_address);
        }

        return cloned_collection;
    }
});

export = AddressCollection;
