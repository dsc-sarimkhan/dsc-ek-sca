/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="GlobalViews.CountriesDropdown.View"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended" />

import * as _ from 'underscore';

import * as global_views_countriesDropdown_tpl from 'global_views_countriesDropdown.tpl';

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// @class GlobalViews.CountriesDropdown.View @extends Backbone.View
const GlobalViewsCountriesDropdownView: any = BackboneView.extend({
    template: global_views_countriesDropdown_tpl,

    // @method getContext @return GlobalViews.CountriesDropdown.View.Context
    getContext: function() {
        // @class GlobalViews.CountriesDropdown.View.Context
        return {
            // @property {String} cssclass
            cssclass: this.options.cssclass || '',
            // @property {Boolean} isCSSclass
            showCSSclass: !!this.options.cssclass,
            // @property {String} id
            id: this.options.manage || '',
            // @property {Array<Country>} countries
            countries: _.values(this.options.countries)
        };
    }
});

export = GlobalViewsCountriesDropdownView;

// @class Country
// @property {Number} code
// @property {String} name

// @class GlobalViews.CountriesDropdown.View.Options
// @property {String} cssclass
// @property {Array<Country>} countries
// @property {Number} selectedCountry
// @property {String} manage
