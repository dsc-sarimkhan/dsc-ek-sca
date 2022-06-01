/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Facets.FacetCategoriesList.View"/>

import * as _ from 'underscore';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');

// @module Facets
export = BackboneView.extend({
    initialize: function() {
        // We assume this.model is a facet
        BackboneCompositeView.add(this);
    },

    // @method getContext @return Facets.FacetCategoriesList.View.Context
    getContext: function() {
        // @class Facets.FacetCategoriesList.View.Context
        return {
            // @property {Boolean} hasListId
            hasListId: !_.isUndefined(this.options.listId),

            // @property {Boolean} listId
            listId: this.options.listId,

            // @property {Boolean} isCollapsible
            isCollapsible: this.options.list_id && this.options.collapsed
        };
        // @class Facets.FacetCategoriesList.Vie
    },

    childViews: {
        'Facets.FacetCategoryValues': function() {
            return new BackboneCollectionView({
                collection: _.values(this.options.list),
                // ,	childView: FacetsFacetCategoryView
                childViewOptions: {
                    facet: this.options.facet,
                    translator: this.options.translator,
                    selected: this.options.selected,
                    listId: this.options.listId
                }
            });
        }
    }
});
