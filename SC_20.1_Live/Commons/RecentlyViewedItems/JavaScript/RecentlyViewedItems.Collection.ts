/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

///<amd-module name="RecentlyViewedItems.Collection"/>

import * as _ from 'underscore';
import '../../Utilities/JavaScript/Utils';

import * as jQuery from '../../Core/JavaScript/jQuery';

import Configuration = require('../../Utilities/JavaScript/SC.Configuration');
import ItemCollection = require('../../Item/JavaScript/Item.Collection');
import Tracker = require('../../Tracker/JavaScript/Tracker');
import Cookies = require('../../../Commons/Utilities/JavaScript/js.cookie');
// @class RecentlyViewedItems.Collection @extends Item.Collection
const RecentlyViewedItemsModel = ItemCollection.extend({
		// @method initialize
		initialize: function () {
			this.useCookie =
				Configuration.recentlyViewedItems && Configuration.recentlyViewedItems.useCookie;
			this.searchApiMasterOptions = Configuration.searchApiMasterOptions.Facets;

			this.track_on = false;

			if (this.useCookie) {
				this.promise = this.loadItemsFromCookie();
			} else {
				this.promise = jQuery.Deferred().resolveWith(this);
			}
		},
		// @method addHistoryItem
		addHistoryItem: function (item) {
			if (this.useCookie) {
            const self = this;

				this.promise.done(function () {
					// If the item is already in the recently viewed, we remove it
					self.remove(item);

					// we add the item at the beginning of a collection
					self.unshift(item);

					if (self.useCookie) {
                    const current_items = Cookies.get('recentlyViewedIds');
                    const news_items = _.union(self.pluck('internalid'), current_items);

                    Cookies.set('recentlyViewedIds', news_items, { path: '/', expires: 365 });
					}
				});
			}
		},
		// @method loadItemsFromCookie
		loadItemsFromCookie: function () {
			// create an array of ID items to get only the elements that are present in the cookie but are not present in memory

        let cookie_ids = Cookies.get('recentlyViewedIds') || [];

			if (typeof cookie_ids === 'string') {
				cookie_ids = [cookie_ids.replace(/[\[\]]+/g, '')];
			} else if (!_.isArray(cookie_ids)) {
				cookie_ids = [cookie_ids];
			}

        const items_ids = _.difference(cookie_ids, this.pluck('internalid')).join(',');

			if (items_ids) {
				return this.fetch({ data: { id: items_ids } }, { silent: true });
        }
				return jQuery.Deferred().resolveWith(this);
		},
		turnOnTracking: function () {
			this.track_on = true;
    },
		trackCollection: function () {
        const self = this;

			this.promise.done(function () {
					if(self.track_on){
					Tracker.getInstance().trackProductListEvent(self, 'Recently Viewed Items');
					self.track_on = false;
				}
			});
		}
});

const RecentlyViewedItemsCollection:any = {
    getInstance: function() {
		this.instance = this.instance || new RecentlyViewedItemsModel();

		this.instance.trackCollection();

		return this.instance;
	}
};

export = RecentlyViewedItemsCollection;
