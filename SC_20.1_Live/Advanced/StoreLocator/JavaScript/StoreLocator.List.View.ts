/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="StoreLocator.List.View"/>
// @module StoreLocator.List.View

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import * as store_locator_list_tpl from 'store_locator_list.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');

// @class StoreLocator.List.View @extend Backbone.View
const StoreLocatorListView: any = BackboneView.extend({
    template: store_locator_list_tpl,

    events: {
        'mouseover li': 'openMapInfoWindow'
    },

    // @method initialize
    initialize: function initialize(options) {
        this.reference_map = options.reference_map;

        this.index = options.index + 1;

        this.events = this.events || {};
    },

    // @method openMapInfoWindow
    // @return {void}
    openMapInfoWindow: function openMapInfoWindow() {
        if (
            this.reference_map.configuration.openPopupOnMouseOver() &&
            !Utils.isPhoneDevice() &&
            !Utils.isTabletDevice()
        ) {
            const marker = _.findWhere(this.reference_map.points, {
                store_id: this.model.get('internalid')
            });

            this.reference_map.showInfoWindow(marker, this.model, this.index);
        }
    },

    // @method getContext @returns StoreLocator.List.View.Context
    getContext: function getContext() {
        // @Class StoreLocator.List.View.Context
        return {
            // @property {{String}} storeName
            storeName: this.model.get('name'),
            // @property {{String}} storeDistance
            storeDistance: this.model.get('distance'),
            // @property {{String}} distanceUnit
            distanceUnit: this.model.get('distanceunit'),
            // @property {{String}} storeAddress
            storeAddress: this.model.get('address1'),
            // @property {{String}} storeId
            storeId: this.model.get('internalid'),
            // @property {{Number}} index
            index: this.index,
            // @property {{StoreLocation.Model}} model
            model: this.model,
            // @property {String} touchpoint
            touchpoint: Configuration.get('siteSettings.isHttpsSupported') ? 'home' : 'storelocator'
        };
    }
});

export = StoreLocatorListView;
