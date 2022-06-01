/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Facets.FacetedNavigationItemCategory.View"/>

import * as _ from 'underscore';

import * as facets_faceted_navigation_item_category_tpl from 'facets_faceted_navigation_item_category.tpl';

import Configuration = require('../../Utilities/JavaScript/SC.Configuration');
import CategoriesUtils = require('../../../Commons/Categories/JavaScript/Categories.Utils');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @module Facets
export = BackboneView.extend({
    template: facets_faceted_navigation_item_category_tpl,

    events: {
        'click [data-action="see-more"]': 'toggleSeeMoreLess'
    },

    initialize: function() {
        this.categories =
            (this.model && (this.model.get('siblings') || this.model.get('categories'))) || [];
        this.categoryUrl = this.options.categoryUrl;

        this.on('afterViewRender', this.renderCategories, this);
    },

    // @method renderCategories
    renderCategories: function() {
        this.$('[data-collapsed="true"]').hide();
    },

    toggleSeeMoreLess: function(event) {
        const target = this.$(event.currentTarget);
        const target_see_more = target.find('[data-type="see-more"]');
        const target_see_less = target.find('[data-type="see-less"]');
        const target_was_expanded = !!target.data('collapsed');

        if (target_was_expanded) {
            target_see_more.show();
            target_see_less.hide();
        } else {
            target_see_more.hide();
            target_see_less.show();
        }

        target.data('collapsed', !target_was_expanded);
    },

    // @method getContext @return {Facets.FacetedNavigationItemCategory.View.Context}
    getContext: function() {
        const showFacet = this.categories.length;
        const values = [];
        const self = this;
        const showMax = Configuration.get('categories.sideMenu.showMax');
        const uncollapsible = Configuration.get('categories.sideMenu.uncollapsible');
        const collapsed = Configuration.get('categories.sideMenu.collapsed');

        _.each(this.categories, function(category: any) {
            values.push({
                displayName: category.name,
                label: category.name,
                link: category.fullurl,
                isActive: category.fullurl === self.categoryUrl,
                additionalFields: CategoriesUtils.getAdditionalFields(
                    category,
                    'categories.sideMenu.additionalFields'
                )
            });
        });

        const max = showMax || values.length;
        const displayValues = _.first(values, max);
        const extraValues = _.rest(values, max);

        const breadcrumb = this.model && (this.model.get('breadcrumb') || []);
        let parentName = '';

        if (breadcrumb && breadcrumb.length) {
            const index = breadcrumb.length > 1 ? breadcrumb.length - 2 : breadcrumb.length - 1;
            parentName = breadcrumb[index].name;
        }

        // @class Facets.FacetedNavigationItemCategory.View.Context
        return {
            // @property {String} htmlId
            htmlId: _.uniqueId('commercecategory_'),
            // @property {String} facetId
            facetId: 'commercecategory',
            // @property {Boolean} showFacet
            showFacet: !!showFacet,
            // @property {Array<Object>} values
            values: values,
            // @property {Array<Object>} displayValues
            displayValues: displayValues,
            // @property {Array<Object>} extraValues
            extraValues: extraValues,
            // @property {Boolean} showExtraValues
            showExtraValues: !!extraValues.length,
            // @property {Boolean} isUncollapsible
            isUncollapsible: !!uncollapsible,
            // @property {Boolean} isCollapsed
            isCollapsed: !uncollapsible && collapsed,
            // @property {String} parentName
            parentName: parentName
            // @class Facets.FacetedNavigationItemCategory.View
        };
    }
});
