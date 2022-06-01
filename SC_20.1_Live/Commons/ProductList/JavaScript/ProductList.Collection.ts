/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductList.Collection"/>

import * as Utils from '../../Utilities/JavaScript/Utils';

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import ProductListModel = require('./ProductList.Model');

// @class ProductList.Collection @extends Backbone.Collection
export = Backbone.Collection.extend({
    url: Utils.getAbsoluteUrl('services/ProductList.Service.ss'),

    model: ProductListModel,

    // Filter based on the iterator and return a collection of the same type
    filtered: function(iterator) {
        return new this.constructor(this.filter(iterator));
    }
});
