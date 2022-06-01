/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PickupInStore.StoreSelector.View"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as pickup_in_store_store_selector_tpl from 'pickup_in_store_store_selector.tpl';

import StoreLocatorSearchView = require('../../StoreLocator/JavaScript/StoreLocator.Search.View');
import PickupInStoreStoreSelectorListView = require('./PickupInStore.StoreSelector.List.View');
import StoreLocatorCollection = require('../../StoreLocator/JavaScript/StoreLocator.Collection');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');

const PickupInStoreStoreSelectorView: any = BackboneView.extend({
    // @property {Function} template
    template: pickup_in_store_store_selector_tpl,

    // @property {String} title
    title: Utils.translate('Select Store'),

    // @method initialize
    // @param {PickupInStore.StoreSelector.View.InitializeParameters} options
    initialize: function initialize(options) {
        BackboneView.prototype.initialize.apply(this, arguments);

        this.model = options.model;
        this.application = options.application;
        this.item = this.model.getItem();
        this.item_pickup_in_store_locations = this.item.get(
            '_quantityavailableforstorepickup_detail'
        );
        this.source = options.source;

        this.reference_map = this.options.reference_map;
        this.store_collection = new StoreLocatorCollection();
    },

    // @property {method} focusFirstInput
    focusFirstInput: function focusFirstInput() {
        return !this.store_collection.length;
    },

    // @property {ChildViews} childViews
    childViews: {
        StoreSearch: function() {
            return new StoreLocatorSearchView({
                collection: this.store_collection,
                application: this.application,
                reference_map: this.reference_map,
                profileModel: ProfileModel.getInstance(),
                alwaysVisible: !Utils.isPhoneDevice(),
                useGeolocation: window.location.protocol === 'https:'
            });
        },

        StoreList: function() {
            return new PickupInStoreStoreSelectorListView({
                store_collection: this.store_collection,
                application: this.application,
                reference_map: this.reference_map,
                profileModel: ProfileModel.getInstance(),
                model: this.model,
                source: this.source
            });
        }
    }
});

export = PickupInStoreStoreSelectorView;
