/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="StoreLocator.Details.View"/>
// @module StoreLocator.Details.View

import * as store_locator_details_tpl from 'store_locator_details.tpl';

import StoreLocatorMapView = require('./StoreLocator.Map.View');
import LocationVenueDetailsView = require('../../Location.SCA/JavaScript/Location.VenueDetails.View');
import StoreLocatorModel = require('./StoreLocator.Model');
import ReferenceMap = require('../../StoreLocatorReferenceMapImplementation/JavaScript/ReferenceMap');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import AjaxRequestsKiller = require('../../../Commons/AjaxRequestsKiller/JavaScript/AjaxRequestsKiller');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

const StoreLocatorDetailsView: any = BackboneView.extend({
    template: store_locator_details_tpl,

    // @property {Object} attributes
    attributes: {
        id: 'StoreLocatorDetails',
        class: 'StoreLocatorDetails'
    },

    // @method initialize
    // @params {Object} options
    initialize: function initialize(options) {
        this.reference_map = new ReferenceMap();
        this.model = new StoreLocatorModel();
        this.reference_map.model = this.model;
        this.routerArguments = options.routerArguments;
        this.application = options.application;
        this.profile_model = ProfileModel.getInstance();

        // @property {String} title
        this.title = this.reference_map.configuration.title();
    },

    beforeShowContent: function beforeShowContent() {
        const id = this.routerArguments[0];

        return this.model.fetch({
            data: {
                internalid: id
            },
            killerId: AjaxRequestsKiller.getKillerId()
        });
    },

    // @property {Object} childViews
    childViews: {
        LocatorMap: function() {
            return new StoreLocatorMapView({
                application: this.application,
                reference_map: this.reference_map,
                model: this.model
            });
        },

        StoreLocationInfo: function() {
            return new LocationVenueDetailsView({
                application: this.application,
                model: this.model,
                showAddress: true
            });
        }
    },

    // @method getContext @returns StoreLocator.Details.View.Context
    getContext: function getContext() {
        const last_navigation = this.profile_model.get('storeLocator_last_search');
        const direction_url = this.reference_map.getDirectionsUrl(
            last_navigation,
            this.model.get('location')
        );

        return {
            title: this.reference_map.configuration.title,

            directionUrl: direction_url,

            redirectUrl: last_navigation ? 'stores' : 'stores/all'
        };
    }
});

export = StoreLocatorDetailsView;
