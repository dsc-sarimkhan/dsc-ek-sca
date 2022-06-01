/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Facets.FacetsDisplay.View"/>

import * as _ from 'underscore';

import * as facets_facets_display_tpl from 'facets_facets_display.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @module Facets
export = BackboneView.extend({
    template: facets_facets_display_tpl,

    // @method getContext @return {Facets.FacetsDisplay.View.Context}
    getContext: function() {
        const { facets } = this.options;
        const { translator } = this.options;

        _.each(facets, function(facet: any) {
            facet.value = _.isArray(facet.value) ? facet.value : [facet.value];
        });

        const facet_values = [];

        _.each(facets, function(facet: any) {
            const { parser } = facet.config;

            _.each(facet.value, function(value: any) {
                const from = _.isObject(value) ? value.from : '';
                const to = _.isObject(value) ? value.to : '';

                const value_data = {
                    facetValueIsObject: _.isObject(value),
                    from: from && parser ? parser(from) : from,
                    to: to && parser ? parser(to) : to,
                    valueLabel: translator.getLabelForValue(facet.id, value),
                    facetValueUrl: translator.cloneForFacetId(facet.id, value).getUrl(),
                    facetValue: facet.value
                };

                facet_values.push(value_data);
            });
        });

        // @class Facets.FacetsDisplay.View.Context
        return {
            // @property {Boolean} hasFacets
            hasFacets: facets.length > 0,

            // @property {String} clearAllFacetsLink
            clearAllFacetsLink: translator.cloneWithoutFacets().getUrl(),

            // @property {Array} values
            values: facet_values
        };
        // @class Facets.FacetsDisplay.View
    }
});
