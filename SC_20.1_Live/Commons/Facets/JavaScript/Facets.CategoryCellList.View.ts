/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Facets.CategoryCellList.View"/>

import FacetsCategoryCellView = require('./Facets.CategoryCell.View');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');

// @module Facets
export = BackboneView.extend({
    initialize: function() {
        BackboneCompositeView.add(this);
    },

    childViews: {
        'Facets.CategoryCells': function() {
            return new BackboneCollectionView({
                childView: FacetsCategoryCellView,
                collection: this.model.values.values
            });
        }
    },

    // @method getContext @return Facets.CategoryCellList.View.Context
    getContext: function() {
        // @class Facets.CategoryCellList.View.Context
        return {
            // @property {String} hasTwoOrMoreFacets
            hasTwoOrMoreFacets: this.options.hasTwoOrMoreFacets,

            // @property {String} name
            name: this.model.name,

            // @property {String} url
            url: this.model.url
        };
    }
});
