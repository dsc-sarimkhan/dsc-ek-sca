/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="StoreLocator.Main.View"/>
// @module StoreLocator.Main.View

import * as store_locator_main_tpl from 'store_locator_main.tpl';

import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import StoreLocatorMapView = require('./StoreLocator.Map.View');
import StoreLocatorSearchView = require('./StoreLocator.Search.View');
import StoreLocatorResultsView = require('./StoreLocator.Results.View');
import StoreLocatorCollection = require('./StoreLocator.Collection');
import ReferenceMap = require('../../StoreLocatorReferenceMapImplementation/JavaScript/ReferenceMap');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

const StoreLocatorMainView: any = BackboneView.extend({
    template: store_locator_main_tpl,

    // @property {Object} attributes
    attributes: {
        id: 'StoreLocatorMain',
        class: 'StoreLocatorMain'
    },

    events: {
        'click [data-action="refine-search"]': 'refineSearch'
    },

    // @method initialize
    // @param options
    initialize: function initialize(options) {
        this.application = options.application;
        this.reference_map = new ReferenceMap();
        this.profileModel = ProfileModel.getInstance();
        this.title = this.reference_map.configuration.title();
        this.collection = new StoreLocatorCollection();
        this.reference_map.collection = this.collection;
    },

    // @method destroy
    destroy: function destroy() {
        // clear profile model
        if (Backbone.history.getFragment().split('/')[1] !== 'details') {
            this.profileModel.unset('storeLocator_last_search');
        }

        this._destroy();
    },

    // @property {Object} childViews
    childViews: {
        StoreLocatorMap: function() {
            return new StoreLocatorMapView({
                collection: this.collection,
                application: this.application,
                reference_map: this.reference_map
            });
        },

        StoreLocatorResults: function() {
            return new StoreLocatorResultsView({
                collection: this.collection,
                application: this.application,
                reference_map: this.reference_map,
                profileModel: this.profileModel
            });
        },

        StoreLocatorSearch: function() {
            return new StoreLocatorSearchView({
                collection: this.collection,
                application: this.application,
                reference_map: this.reference_map,
                profileModel: this.profileModel,
                useGeolocation: window.location.protocol === 'https:'
            });
        }
    },

    // @method getContext
    // @returns StoreLocator.Main.View.Context
    getContext: function getContext() {
        // @class StoreLocator.Main.View.Context
        return {
            // @property {String} title
            title: this.reference_map.configuration.title(),
            // @property {String} touchpoint
            touchpoint: Configuration.get('siteSettings.isHttpsSupported') ? 'home' : 'storelocator'
        };
    }
});

export = StoreLocatorMainView;
