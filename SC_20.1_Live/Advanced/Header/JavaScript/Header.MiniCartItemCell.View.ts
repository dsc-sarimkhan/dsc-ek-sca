/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Header.MiniCartItemCell.View"/>

import * as header_mini_cart_item_cell_tpl from 'header_mini_cart_item_cell.tpl';

import TransactionLineViewsOptionsSelectedView = require('../../../Commons/Transaction.Line.Views/JavaScript/Transaction.Line.Views.Options.Selected.View');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @module Header

// @class Header.MiniCart.View @extends BackboneView
export = BackboneView.extend({
    template: header_mini_cart_item_cell_tpl,

    initialize: function() {
        BackboneCompositeView.add(this);
    },

    childViews: {
        'Item.SelectedOptions': function() {
            return new TransactionLineViewsOptionsSelectedView({
                model: this.model
            });
        }
    },

    // @method getContext
    // @return {Header.MiniCart.View.Context}
    getContext: function() {
        const price_container_object = this.model.getPrice();

        // @class Header.MiniCart.View.Context
        return {
            line: this.model,
            // @property {Number} itemId
            itemId: this.model.get('item').id,
            // @property {String} itemType
            itemType: this.model.get('item').get('itemtype'),
            // @property {String} linkAttributes
            linkAttributes: this.model.getFullLink({
                quantity: null,
                location: null,
                fulfillmentChoice: null
            }),
            // @property {ImageContainer} thumbnail
            thumbnail: this.model.getThumbnail(),
            // @property {Boolean} isPriceEnabled
            isPriceEnabled: !ProfileModel.getInstance().hidePrices(),
            // @property {Boolean} isFreeGift
            isFreeGift: this.model.get('free_gift') === true,
            // @property {String} rateFormatted
            rateFormatted:
                this.model.get('rate_formatted') || price_container_object.price_formatted || ''
        };
        // @class Header.MiniCart.View
    }
});
