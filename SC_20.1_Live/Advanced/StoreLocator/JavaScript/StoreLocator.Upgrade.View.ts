/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="StoreLocator.Upgrade.View"/>
// @module StoreLocator.Upgrade.View

import * as store_locator_upgrade from 'store_locator_upgrade.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

const StoreLocatorUpgradeView: any = BackboneView.extend({
    template: store_locator_upgrade,

    // @property {Object} attributes
    attributes: {
        id: 'StoreLocatorUpgrade',
        class: 'StoreLocatorUpgrade'
    },

    // @method initialize
    // @param {Object} options
    initialize: function initialize(options) {
        this.application = options.application;
    }
});

export = StoreLocatorUpgradeView;
