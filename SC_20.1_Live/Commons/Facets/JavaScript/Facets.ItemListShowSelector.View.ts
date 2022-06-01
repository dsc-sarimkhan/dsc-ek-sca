/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Facets.ItemListShowSelector.View"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended.d.ts" />

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';

import * as facets_item_list_show_selector_tpl from 'facets_item_list_show_selector.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @module Facets
export = BackboneView.extend({
    template: facets_item_list_show_selector_tpl,

    // @method getContext @returns {Facets.ItemListShowSelector.View.Context}
    getContext: function() {
        const option_items = this.options.options;
        const { translator } = this.options;
        const processed_option_items = [];

        _.each(option_items, function(option_item: any) {
            const processed_option_item = {
                configOptionUrl: translator
                    .cloneForOptions({ show: option_item.items, page: 1 })
                    .getUrl(),
                isSelected: parseInt(translator.getOptionValue('show'), 10) === option_item.items,
                name: Utils.translate(option_item.name, option_item.items),
                className: option_item.items
            };

            processed_option_items.push(processed_option_item);
        });

        // @class Facets.ItemListShowSelector.View.Context
        return {
            // @property {Array} options
            options: processed_option_items
        };
    }
});
