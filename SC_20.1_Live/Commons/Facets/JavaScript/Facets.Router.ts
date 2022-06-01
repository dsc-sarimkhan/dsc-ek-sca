/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Facets.Router"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';

import BrowseView = require('./Facets.Browse.View');

import Configuration = require('../../Utilities/JavaScript/SC.Configuration');

// @class Facets.Router Mixes the Translator, Model and View
const FacetsRouter: any = function(application) {
    this.application = application;
    this.translatorConfig = application.translatorConfig;

    const pageType = this.application.getComponent('PageType');

    pageType.registerPageType({
        name: 'facet-browse',
        defaultTemplate: {
            name: 'facets_facet_browse.tpl',
            displayName: 'Facets Default',
            thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                'img/default-layout-facet-browse.png'
            )
        }
    });

    BrowseView.router = this;
};

FacetsRouter.prototype.addUrl = function(urls, functionToCall) {
    if (urls.length) {
        urls = _.map(urls, function(url: any) {
            return url.replace(/^\//, '');
        });
        const rootRegex = '^\\b(' + urls.join('|') + ')\\b$';
        const regex =
            '^\\b(' +
            urls.join('|') +
            ')\\b[\\' +
            Configuration.get('facetDelimiters.betweenFacetNameAndValue') +
            '\\?].*$';

        const pageType = this.application.getComponent('PageType');

        pageType.registerPageType({
            name: 'facet-browse',
            routes: [new RegExp(rootRegex), new RegExp(regex)],
            view: BrowseView
        });
    }
};

// @method getFacetsAliasesMapping @param {Array<Object>} corrections
FacetsRouter.prototype.getFacetsAliasesMapping = function(corrections) {
    const facets_aliases_mapping = {};

    _.each(corrections, function(correction: any) {
        facets_aliases_mapping[correction.usedAlias] = {
            url: correction.url,
            type: correction.type ? correction.type : ''
        };
    });

    return facets_aliases_mapping;
};

FacetsRouter.prototype.unaliasUrlHelper = function(
    facet_tokens,
    facets_aliases_mapping,
    separator_between_facets,
    separator_between_facet_name_and_value
) {
    let translated_facets = '';

    while (facet_tokens.length > 0) {
        const facet_name = facet_tokens.shift();
        const facet_value = facet_tokens.shift();

        if (_.isUndefined(facet_name) || _.isUndefined(facet_value)) {
            continue;
        }

        const facet_name_correction = facets_aliases_mapping[facet_name];
        const facet_value_correction = facets_aliases_mapping[facet_value];
        // Just double check if unalias is correct... not undefined and unalias type matches with the url component being analyzed!
        const facet_name_correction_url =
            facet_name_correction && facet_name_correction.type.toUpperCase() === 'FACET'
                ? facet_name_correction.url
                : null;
        const facet_value_correction_url =
            facet_value_correction && facet_value_correction.type.toUpperCase() === 'FACET_VALUE'
                ? facet_value_correction.url
                : null;

        if (facet_name_correction_url && facet_value_correction_url) {
            translated_facets +=
                facet_name_correction_url +
                separator_between_facet_name_and_value +
                facet_value_correction_url;
        } else if (facet_name_correction_url && !facet_value_correction_url) {
            translated_facets +=
                facet_name_correction_url + separator_between_facet_name_and_value + facet_value;
        } else if (!facet_name_correction_url && facet_value_correction_url) {
            translated_facets +=
                facet_name + separator_between_facet_name_and_value + facet_value_correction_url;
        } else {
            translated_facets += facet_name + separator_between_facet_name_and_value + facet_value;
        }

        if (facet_tokens.length > 0) {
            translated_facets += separator_between_facets;
        }
    }

    return translated_facets;
};

// @method unaliasUrl @param {String} aliased_url @param {Array<Object>} corrections
FacetsRouter.prototype.unaliasUrl = function(aliased_url, corrections) {
    if (aliased_url.indexOf('http://') === 0 || aliased_url.indexOf('https://') === 0) {
        throw new Error('URL must be relative');
    }

    aliased_url = aliased_url[0] === '/' ? aliased_url.substr(1) : aliased_url;

    const facet_delimiters = this.translatorConfig.facetDelimiters;
    const facets_n_options = aliased_url.split(facet_delimiters.betweenFacetsAndOptions);
    const facets =
        facets_n_options[0] && facets_n_options[0] !== this.translatorConfig.fallbackUrl
            ? facets_n_options[0]
            : '';
    const options = facets_n_options[1] || '';
    const facet_tokens = facets.split(
        new RegExp(
            '[\\' +
                facet_delimiters.betweenDifferentFacets +
                '\\' +
                facet_delimiters.betweenFacetNameAndValue +
                ']+',
            'ig'
        )
    );
    const facets_aliases_mapping = this.getFacetsAliasesMapping(corrections);
    let unaliased_url = this.unaliasUrlHelper(
        facet_tokens,
        facets_aliases_mapping,
        facet_delimiters.betweenDifferentFacets,
        facet_delimiters.betweenFacetNameAndValue
    );

    if (options) {
        const option_tokens = [];

        options.replace(
            new RegExp(
                '([^' +
                    facet_delimiters.betweenFacetsAndOptions +
                    facet_delimiters.betweenOptionNameAndValue +
                    facet_delimiters.betweenDifferentOptions +
                    ']+)(' +
                    facet_delimiters.betweenOptionNameAndValue +
                    '([^' +
                    facet_delimiters.betweenDifferentOptions +
                    ']*))?',
                'ig'
            ),
            function($0, $1, $2, $3) {
                option_tokens.push($1);
                option_tokens.push($3);
            }
        );

        const unaliased_options = this.unaliasUrlHelper(
            option_tokens,
            facets_aliases_mapping,
            facet_delimiters.betweenDifferentOptions,
            facet_delimiters.betweenOptionNameAndValue
        );

        unaliased_url = unaliased_url !== '' ? unaliased_url : this.translatorConfig.fallbackUrl;
        unaliased_url += facet_delimiters.betweenFacetsAndOptions + unaliased_options;
    }

    return unaliased_url;
};

export = FacetsRouter;
