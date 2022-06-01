/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Cart.Item.Summary.View"/>

import * as _ from 'underscore';
import * as cart_item_summary_tpl from 'cart_item_summary.tpl';

import CartPromocodeListItemView = require('./Cart.Promocode.List.Item.View');
import BackboneCompositeView = require('../../Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

export = BackboneView.extend({
    // @property {Function} template
    template: cart_item_summary_tpl,

    // @method initialize Defines this view as composite
    // @return {Void}
    initialize: function() {
        BackboneCompositeView.add(this);
    },

    // @property {Object} events
    events: {
        'click [data-action="plus"]': 'addQuantity',
        'click [data-action="minus"]': 'subQuantity'
    },

    // @method addQuantity Add 1 to the quantity field
    // @param {jQuery.Event} e
    // @return {Void}
    addQuantity: function(e) {
        e.preventDefault();

        const $element = this.$(e.target);
        const quantity_input = $element.parent().find('input');
        const old_value = quantity_input.val();
        const max_quantity = this.model.get('item').get('_maximumQuantity', true);
        let new_val = parseFloat(old_value) + 1;

        new_val = max_quantity ? Math.min(max_quantity, new_val) : new_val;

        quantity_input.val(new_val);
        quantity_input.change();
    },

    // @method subQuantity Subtract 1 from the quantity field
    // @param {jQuery.Event} e
    // @return {Void}
    subQuantity: function(e) {
        e.preventDefault();

        const $element = this.$(e.target);
        const quantity_input = $element.parent().find('input');
        const old_value = quantity_input.val();
        let new_val = parseFloat(old_value) - 1;

        new_val = Math.max(this.model.get('item').get('_minimumQuantity', true), new_val);

        quantity_input.val(new_val);
        quantity_input.change();
    },
    childViews: {
        PromocodeList: function() {
            if (this.model.get('discounts_impact')) {
                const discounts = _.filter(this.model.get('discounts_impact').discounts, function(
                    discount: any
                ) {
                    return !!discount.promotion_couponcode;
                });

                return new BackboneCollectionView({
                    collection: discounts,
                    viewsPerRow: 1,
                    childView: CartPromocodeListItemView,
                    childViewOptions: {
                        isReadOnly: true,
                        source: 'item_summary'
                    }
                });
            }
        }
    },

    // @method getContext
    // @return {Cart.Item.Summary.View.Context}
    getContext: function() {
        const minimum_quantity = this.model.get('item').get('_minimumQuantity', true) || 1;
        const maximum_quantity = this.model.get('item').get('_maximumQuantity', true);
        const price_container_object = this.model.getPrice();

        // @class Cart.Item.Summary.View.Context
        return {
            // @property {Model} line
            line: this.model,
            // @property {String} lineId
            lineId: this.model.get('internalid'),
            // @property {Boolean} isMinusButtonDisabled
            isMinusButtonDisabled:
                this.model.get('item').get('quantity') <= minimum_quantity ||
                this.model.get('item').get('quantity') === 1,
            // @property {Boolean} isPlusButtonDisabled
            isPlusButtonDisabled:
                !!maximum_quantity && this.model.get('item').get('quantity') >= maximum_quantity,
            // @property {Boolean} showQuantity
            showQuantity: this.model.get('item').get('_itemType') === 'GiftCert',
            // @property {Boolean} showComparePrice
            showComparePrice: this.model.get('amount') > this.model.get('total'),
            // @property {Boolean} showMinimumQuantity
            showMinimumQuantity: minimum_quantity > 1,
            // @property {Integer} minimumQuantity
            minimumQuantity: minimum_quantity,
            // @property {Boolean} showMaximumQuantity
            showMaximumQuantity: !!maximum_quantity,
            // @property {Integer} maximumQuantity
            maximumQuantity: maximum_quantity,
            // @property {Boolean} isPriceEnabled
            isPriceEnabled: !ProfileModel.getInstance().hidePrices(),
            // @property {String} totalFormatted
            totalFormatted:
                price_container_object.total_formatted || this.model.get('total_formatted') || ''
        };
        // @class Cart.Item.Summary.View
    }
});
