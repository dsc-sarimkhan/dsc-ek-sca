/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ItemRelations.Correlated.Collection"/>

import * as _ from 'underscore';

import Configuration = require('../../Utilities/JavaScript/SC.Configuration');
import ItemCollection = require('../../Item/JavaScript/Item.Collection');

// @class ItemRelations.Correlated.Collection @extends Item.Collection
const ItemRelationsCorrelatedCollection: any = ItemCollection.extend({
    initialize: function(options) {
        this.searchApiMasterOptions = Configuration.searchApiMasterOptions.correlatedItems;
        this.itemsIds = _.isArray(options.itemsIds)
            ? _.sortBy(options.itemsIds, function(id) {
                  return id;
              })
            : [options.itemsIds];
    },

    // @method fetchItems @return {jQuery.Deferred}
    fetchItems: function() {
        return this.fetch({ data: { id: this.itemsIds.join(',') } });
    },

    // http://backbonejs.org/#Model-parse
    parse: function(response) {
        const original_items = _.compact(response.items) || [];
        const self = this;
        const items = {};

        _.each(_.pluck(original_items, 'correlateditems_detail'), function(correlated_items: any) {
            _.each(correlated_items, function(correlated_item: any) {
                if (
                    self &&
                    self.itemsIds &&
                    correlated_item &&
                    items &&
                    !_.contains(self.itemsIds, correlated_item.internalid) &&
                    !items[correlated_item.internalid]
                ) {
                    items[correlated_item.internalid] = correlated_item;
                }
            });
        });

        return _.toArray(items);
    }
});

export = ItemRelationsCorrelatedCollection;
