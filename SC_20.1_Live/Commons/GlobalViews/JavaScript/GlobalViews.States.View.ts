/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="GlobalViews.States.View"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended" />

import * as _ from 'underscore';

import * as global_views_states_tpl from 'global_views_states.tpl';

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// @class GlobalViews.States.View @extends Backbone.View
const GlobalViewsStatesView: any = BackboneView.extend({
    template: global_views_states_tpl,

    // @method getContext @returns GlobalViews.States.View.Context
    getContext: function() {
        const country =
            this.options.selectedCountry && this.options.countries[this.options.selectedCountry];
        const states = country && country.states;
        const self = this;

        _.each(states, function(state: any) {
            state.isSelected = state.code === self.options.selectedState;
        });

        // @class GlobalViews.States.View.Context
        return {
            // @property {Boolean} isCountryAndStatePresent
            isCountryAndStatePresent: !!(country && states),
            // @property {String} manage
            manage: this.options.manage || '',
            // @property {Array<Object>} sates
            states: states,
            // @property {String} selectedState
            selectedState: this.options.selectedState,
            // @property {String} inputClass
            inputClass: this.options.cssclass || 'input-xlarge'
        };
    }
});

export = GlobalViewsStatesView;
