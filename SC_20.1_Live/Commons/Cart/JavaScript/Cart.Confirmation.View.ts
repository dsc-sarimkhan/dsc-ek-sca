/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Cart.Confirmation.View"/>

import * as Utils from '../../Utilities/JavaScript/Utils';
import * as cart_confirmation_modal_tpl from 'cart_confirmation_modal.tpl';

import TransactionLineViewsPriceView = require('../../Transaction.Line.Views/JavaScript/Transaction.Line.Views.Price.View');
import BackboneCompositeView = require('../../Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import TransactionLineViewsOptionsSelectedView = require('../../Transaction.Line.Views/JavaScript/Transaction.Line.Views.Options.Selected.View');
import ProductLineSkuView = require('../../ProductLine/JavaScript/ProductLine.Sku.View');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

export = BackboneView.extend({
    // @property {Function} template
    template: cart_confirmation_modal_tpl,

    // @property {String} title
    title: Utils.translate('Added to Cart'),

    modalClass: 'global-views-modal-large',

    // @property {String} page_header
    page_header: Utils.translate('Added to Cart'),

    // @property {Object} attributes
    attributes: {
        id: 'Cart.Confirmation.View',
        class: 'add-to-cart-confirmation-modal shopping-cart-modal'
    },

    // @method initialize
    initialize: function() {
        this.model.on('change', this.render, this);
        BackboneCompositeView.add(this);
    },

    destroy: function destroy() {
        this.model.off('change', this.render, this);
        this._destroy();
    },

    // @property {Object} childViews
    childViews: {
        'Line.Price': function() {
            return new TransactionLineViewsPriceView({
                model: this.model
            });
        },
        'Line.SelectedOptions': function() {
            return new TransactionLineViewsOptionsSelectedView({
                model: this.model
            });
        },
        'Line.Sku': function() {
            return new ProductLineSkuView({
                model: this.model
            });
        }
    },

    // @method getContext
    // @return {Cart.Confirmation.View.Context}
    getContext: function() {
        const item = this.model.get('item');

        // @class Cart.Confirmation.View.Context
        return {
            // @property {LiveOrder.Line.Model} model
            model: this.model,
            // @property {ImageContainer} thumbnail
            thumbnail: this.model.getThumbnail(),
            // @property {Boolean} showQuantity
            showQuantity: item.get('_itemType') !== 'GiftCert' && this.model.get('quantity') > 0,
            // @property {String} itemName
            itemName: item.get('_name', true)
        };
    }

    // @class Cart.Confirmation.View
});
