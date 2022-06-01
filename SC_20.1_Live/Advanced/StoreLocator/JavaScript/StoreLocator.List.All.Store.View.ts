/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="StoreLocator.List.All.Store.View"/>
// @module StoreLocator.List.All.Store.View

import * as store_locator_list_all_store_tpl from 'store_locator_list_all_store.tpl';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

const StoreLocatorListAllStoreView: any = BackboneView.extend({
    template: store_locator_list_all_store_tpl,

    // @method initialize
    // @param {Object} options
    initialize: function initialize(options) {
        this.index = options.index;
    },

    // @method getContext
    // @return StoreLocator.ListAll.Store.View.Context
    getContext: function getContext() {
        return {
            // @property {String} name
            name: this.model.get('name'),
            // @property {String} storeId
            storeId: this.model.get('internalid'),
            // @property {String} touchpoint
            touchpoint: Configuration.get('siteSettings.isHttpsSupported') ? 'home' : 'storelocator'
        };
    }
});

export = StoreLocatorListAllStoreView;
