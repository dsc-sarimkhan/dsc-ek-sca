/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Facets.ItemListDisplaySelector.View"/>

import * as _ from 'underscore';

import * as facets_item_list_display_selector_tpl from 'facets_item_list_display_selector.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @module Facets
export = BackboneView.extend({
    template: facets_item_list_display_selector_tpl,

    // @method getContext @returns {Facets.ItemListDisplaySelector.View.Context}
    getContext: function() {
        const option_items = this.options.options;
        const { translator } = this.options;
        const processed_option_items = [];

        _.each(option_items, function(option_item: any) {
            const processed_option_item = {
                configOptionUrl: translator.cloneForOption('display', option_item.id).getUrl(),
                isActive: translator.getOptionValue('display') === option_item.id,
                isGrid: option_item.id === 'grid',
                name: option_item.name,
                icon: option_item.icon
            };

            processed_option_items.push(processed_option_item);
        });

        // @class Facets.ItemListDisplaySelector.View.Context
        return {
            // @property {String} configClasses
            configClasses: this.options.configClasses,

            // @property {Array} options
            options: processed_option_items
        };
        // @class Facets.ItemListDisplaySelector.View
    }
});
