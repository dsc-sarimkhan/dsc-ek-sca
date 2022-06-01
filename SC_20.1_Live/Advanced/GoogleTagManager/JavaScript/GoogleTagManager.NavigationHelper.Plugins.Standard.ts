/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="GoogleTagManager.NavigationHelper.Plugins.Standard"/>

import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import Tracker = require('../../../Commons/Tracker/JavaScript/Tracker');
import BackboneModel = require('../../../Commons/BackboneExtras/JavaScript/Backbone.Model');

// @module GoogleTagManager.NavigationHelper.Plugins.Standard
// It handle the mouseClick event only on the items link of the follow list: Search/Category, Recently viewed items and related/correlated items

// @class GoogleTagManager.NavigationHelper.Plugins.Standard Contains the standard navigation helper behavior. @extends ApplicationModule
export = {
    // @method mouseClickNavigation Handle standard mouseClick event
    // @param {ApplicationSkeleton.Layout} layout General application layout
    // @param {jQuery.Event} e jQuery event
    // @return {jQuery.Event} e
    mouseDownNavigation: function(_layout, e) {
        const $item = jQuery(e.currentTarget).closest('[itemprop="itemListElement"]');

        if ($item.length) {
            const category = $item.data('track-productlist-category');

            if (category) {
                const item = {
                    category: category,
                    position: $item.data('track-productlist-position'),
                    list: $item.data('track-productlist-list'),
                    sku: $item.data('sku'),
                    itemId: $item.data('item-id'),
                    name: $item.find('[itemprop="name"]').text(),
                    price: $item.find('[itemprop="price"]').text()
                };

                Tracker.getInstance().trackProductClick(new BackboneModel(item));
            }
        }

        return e;
    }
};
