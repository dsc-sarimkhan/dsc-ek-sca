/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductList.Model"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';

import ProductListItemCollection = require('./ProductList.Item.Collection');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

function validateLength(value, name) {
    const max_length = 300;

    if (value && value.length > max_length) {
        return Utils.translate('$(0) must be at most $(1) characters', name, max_length);
    }
}

function validateName(value, name) {
    if (!value) {
        return Utils.translate('Name is required');
    }

    return validateLength(value, name);
}

// @class ProductList.Model Model for handling Product Lists (CRUD) @extends Backbone.Model
export = Backbone.Model.extend({
    urlRoot: Utils.getAbsoluteUrl('services/ProductList.Service.ss'),

    defaults: {
        name: '',
        description: '',
        items: new ProductListItemCollection(),
        scopeId: '2',
        scopeName: 'private',
        typeId: '1',
        typeName: 'default'
    },

    validation: {
        name: { fn: validateName },

        description: { fn: validateLength }
    },

    // redefine url to avoid possible cache problems from browser
    url: function() {
        const base_url = Backbone.Model.prototype.url.apply(this, arguments);
        const url_params = { t: new Date().getTime() };

        return Utils.addParamsToUrl(base_url, url_params);
    },

    initialize: function(attributes) {
        this.on('change:items', function(model, items) {
            if (model.previous('items') instanceof ProductListItemCollection) {
                model.set('items', model.previous('items'), { silent: true });
                model.get('items').reset(items);
            } else {
                model.set('items', new ProductListItemCollection(items), { silent: true });
            }
        });

        this.trigger('change:items', this, (attributes && attributes.items) || []);
    },

    // @method checked Returns true if an item with id: pli_to_add_id and options: pli_to_add_options is already in this product list. Options could be empty. @param {String} item_to_add_id @param {Object}item_to_add_options
    checked: function(line) {
        return !!this.get('items').find(function(product_list_line) {
            return product_list_line.isEqual(line);
        });
    },

    // @method getOutOfStockItems Returns all the items which are out of stock.
    // @param {ProductList.Item.Collection} items_to_check
    // @returns {ProductList.Item.Collection}
    getOutOfStockItems: function(items_to_check) {
        const items = !_.isUndefined(items_to_check) ? items_to_check : this.get('items');

        return items.filter(function(product_list_item) {
            return !product_list_item.get('item').get('_isPurchasable');
        });
    },

    // @method getNotPurchasableItemsDueToMinimumQuantity @param {ProductList.Item.Collection} items_to_check @returns {ProductList.Item.Collection} Returns all the items which do not fulfill minimum quantity requirements.
    getNotPurchasableItemsDueToMinimumQuantity: function(items_to_check) {
        const items = !_.isUndefined(items_to_check) ? items_to_check : this.get('items');

        return items.filter(function(product_list_item) {
            return !product_list_item.fulfillsMinimumQuantityRequirement();
        });
    },

    // @method someCheckedItemsExist Returns true if at least one item is checked. @return{Boolean}
    someCheckedItemsExist: function() {
        return this.get('items').some(function(product_list_item) {
            return product_list_item.get('checked');
        });
    },

    // @method canBeAddedToCart Returns true if the the items in the product list can be added to the cart by the following conditions:
    // 1.- Items > 0
    // 2.- No out of stock items
    // 3.- No items which do not fulfill minimum quantity items
    // only_checked_items determines if we are considering only checked items.
    // @param {Boolean} only_checked_items @return {Boolean}
    canBeAddedToCart: function(only_checked_items) {
        const items = !_.isUndefined(only_checked_items)
            ? new Backbone.Collection(
                  this.get('items').filter(function(product_list_item) {
                      return product_list_item.get('checked');
                  })
              )
            : this.get('items');

        return (
            items.length &&
            this.getOutOfStockItems(items).length === 0 &&
            this.getNotPurchasableItemsDueToMinimumQuantity(items).length === 0
        );
    }
});
