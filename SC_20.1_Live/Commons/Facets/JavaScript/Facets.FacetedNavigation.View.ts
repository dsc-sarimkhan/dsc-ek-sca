/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Facets.FacetedNavigation.View"/>

import * as _ from 'underscore';

import * as facets_faceted_navigation_tpl from 'facets_faceted_navigation.tpl';

import FacetsFacetedNavigationItemView = require('./Facets.FacetedNavigationItem.View');

import Configuration = require('../../Utilities/JavaScript/SC.Configuration');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');

// @module Facets
export = BackboneView.extend({
    template: facets_faceted_navigation_tpl,

    initialize: function(options) {
        BackboneCompositeView.add(this);

        this.categoryItemId = options.categoryItemId;
        this.clearAllFacetsLink = options.clearAllFacetsLink;
        this.hasCategories = options.hasCategories;
        this.hasItems = options.hasItems;
        this.hasFacets = options.hasFacets;
        this.hasCategoriesAndFacets = options.hasCategoriesAndFacets;
        this.appliedFacets = options.appliedFacets;
        this.hasFacetsOrAppliedFacets = options.hasFacetsOrAppliedFacets;

        this.keywords = options.keywords;
        this.totalProducts = options.totalProducts;
    },

    childViews: {
        'Facets.FacetedNavigationItems': function() {
            const { translator } = this.options; // FacetsHelper.parseUrl(this.options.translatorUrl, this.options.translatorConfig, this.options.translator.categoryUrl)
            let ordered_facets =
                this.options.facets &&
                this.options.facets.sort(function(a, b) {
                    // Default Priority is 0
                    return (
                        (translator.getFacetConfig(b.url || b.id).priority || 0) -
                        (translator.getFacetConfig(a.url || a.id).priority || 0)
                    );
                });

            // if prices aren't to be shown we take out price related facet
            const hidden_facet_names = Configuration.get('loginToSeePrices.hiddenFacetNames', []);

            if (ProfileModel.getInstance().hidePrices()) {
                ordered_facets = _.reject(ordered_facets, function(item: any) {
                    return _.indexOf(hidden_facet_names, item.id) >= 0;
                });
            }

            return new BackboneCollectionView({
                childView: FacetsFacetedNavigationItemView,
                viewsPerRow: 1,
                collection: new Backbone.Collection(ordered_facets),
                childViewOptions: {
                    translator: translator
                }
            });
        }
    },

    // @method getContext
    // @returns {Facets.FacetedNavigation.View.Context}
    getContext: function() {
        // @class Facets.FacetedNavigation.View.Context
        return {
            // @property {Number} totalProducts
            totalProducts: this.totalProducts,
            // @property {Boolean} isTotalProductsOne
            isTotalProductsOne: this.totalProducts === 1,
            // @property {String} keywords
            keywords: this.keywords,
            // @property {String} categoryItemId
            categoryItemId: this.categoryItemId,
            // @property {String} clearAllFacetsLink
            clearAllFacetsLink: this.clearAllFacetsLink,
            // @property {Boolean} hasCategories
            hasCategories: this.hasCategories,
            // @property {Boolean} hasItems
            hasItems: this.hasItems,
            // @property {Boolean} hasFacets
            hasFacets: this.hasFacets,
            // @property {Boolean} hasCategoriesAndFacets
            hasCategoriesAndFacets: this.hasCategoriesAndFacets,
            // @property {Array} appliedFacets
            appliedFacets: this.appliedFacets,
            // @property {Boolean} hasAppliedFacets
            hasAppliedFacets: this.appliedFacets && this.appliedFacets.length > 0,
            // @property {Array} hasFacetsOrAppliedFacets
            hasFacetsOrAppliedFacets: this.hasFacetsOrAppliedFacets
        };
        // @class Facets.FacetedNavigation.View
    }
});
