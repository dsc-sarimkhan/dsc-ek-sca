/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Categories.Collection"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';

import Backbone = require('../../Utilities/JavaScript/backbone.custom');
import Configuration = require('../../Utilities/JavaScript/SC.Configuration');

// @class Categories.Collection @extends Backbone.Collection
const CategoriesCollection = Backbone.Collection.extend({
    url: function() {
        const url = Utils.addParamsToUrl(Utils.getAbsoluteUrl('services/Categories.Service.ss'), {
            menuLevel: Configuration.get('categories.menuLevel')
        });

        return url;
    },

    initialize: function(options) {
        this.options = options;
    }
});

export = CategoriesCollection;
