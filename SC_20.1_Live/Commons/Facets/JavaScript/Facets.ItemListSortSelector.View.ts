/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Facets.ItemListSortSelector.View"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as facets_item_list_sort_selector_tpl from 'facets_item_list_sort_selector.tpl';

import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @module Facets
export = BackboneView.extend({
    // @property {function} template
    template: facets_item_list_sort_selector_tpl,

    // @method getContext @returns {Facets.ItemListSortSelector.View.Context}
    getContext: function() {
        let option_items = this.options.options;
        const { translator } = this.options;
        const processed_option_items = [];

        // if price display is disabled, left aside the filters about price
        if (ProfileModel.getInstance().hidePrices()) {
            option_items = _.filter(option_items, function(item: any) {
                return item.id.search('price') === -1;
            });
        }

        _.each(option_items, function(option_item: any) {
            const processed_option_item = {
                configOptionUrl: translator
                    .cloneForOptions({ order: option_item.id, page: 1 })
                    .getUrl(),
                isSelected: translator.getOptionValue('order') === option_item.id ? 'selected' : '',
                name: Utils.translate(option_item.name, option_item.items),
                className: option_item.id.replace(':', '-')
            };

            processed_option_items.push(processed_option_item);
        });

        // @class Facets.ItemListSortSelector.View.Context
        return {
            // @property {Array<Object>} options
            options: processed_option_items
        };
    }
});
