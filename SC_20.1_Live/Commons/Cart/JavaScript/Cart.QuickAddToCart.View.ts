/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Cart.QuickAddToCart.View"/>

import * as _ from 'underscore';
import * as cart_quickaddtocart_tpl from 'cart_quickaddtocart.tpl';

import LiveOrderModel = require('../../LiveOrder/JavaScript/LiveOrder.Model');
import BackboneCompositeView = require('../../Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import CartAddToCartButtonView = require('./Cart.AddToCart.Button.View');
import ProductViewsPriceView = require('../../ProductViews/JavaScript/ProductViews.Price.View');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');
import Configuration = require('../../Utilities/JavaScript/SC.Configuration');

// @class Cart.QuickAddToCart.View @extend Backbone.View
export = BackboneView.extend({
    // @property {Function} template
    template: cart_quickaddtocart_tpl,

    events: {
        'blur [data-action="setquantity"]': 'updateQuantity'
    },

    // @method initialize Override default method to define state properties and attach to model's change event
    // @param {Cart.QuickAddToCart.View.Initialize.Options} options
    // @return {Void}
    initialize: function initialize() {
        BackboneCompositeView.add(this);

        this.cart = LiveOrderModel.getInstance();

        // @property {Boolean} showQuickAddToCartButton Indicate if the current model is valid to be added form the facet list and if the configuration to show this button is enabled
        this.showQuickAddToCartButton = !!(
            Configuration.get('addToCartFromFacetsView', false) &&
            this.model.getItem().get('_isPurchasable') &&
            !this.hasRequiredCustomFields() &&
            this.model.areAttributesValid(['options'])
        );
    },

    //@method hasRequiredCustomFields Returns if the item has required custom fields
	//@return {Boolean}
	hasRequiredCustomFields: function hasRequiredCustomFields () 
	{
		let hasRequiredFields = false;

		if (this.model.getItem().get('_optionsDetails') && this.model.getItem().get('_optionsDetails').fields)
		{
			_.find(this.model.getItem().get('_optionsDetails').fields, function (field: any) 
			{
				if (field.ismandatory)
				{
					hasRequiredFields = true;
					return;
				}
			}) 
		}

		return hasRequiredFields;
	},

    // @method getMinimumQuantity Returns the minimum quantity taking into account how many item are in the cart
    // @return {Number}
    getMinimumQuantity: function getMinimumQuantity() {
        return !this.cart.findLine(this.model) ? this.model.getItem().get('_minimumQuantity') : 1;
    },
    // @method getMaximumQuantity Returns the maximum quantity, if set, taking into account how many item are in the cart
    // @return {Number}
    getMaximumQuantity: function getMaximumQuantity() {
        let maximum_quantity = this.model.getItem().get('_maximumQuantity');
        if (maximum_quantity) {
            const line_in_cart = this.cart.findLine(this.model);

            maximum_quantity = !line_in_cart
                ? maximum_quantity
                : maximum_quantity - line_in_cart.quantity;

            return maximum_quantity;
        }
    },
    // @method updateQuantity Set the quantity into the current line
    // @param {jQuery.Event} e
    // @return {Void}
    updateQuantity: function updateQuantity(e) {
        let new_quantity = parseInt(this.$(e.target).val(), 10);
        const minimum_quantity = this.getMinimumQuantity();
        const maximum_quantity = this.getMaximumQuantity();

        if (_.isNaN(new_quantity) || !_.isNumber(new_quantity) || new_quantity < minimum_quantity) {
            new_quantity = minimum_quantity;
        } else if (!!maximum_quantity && new_quantity > maximum_quantity) {
            new_quantity = maximum_quantity;
        }

        this.model.set('quantity', new_quantity);
        this.render();
    },

    childViews: {
        AddToCart: function() {
            return new CartAddToCartButtonView({
                model: this.model,
                application: this.options.application
            });
        },
        'ProductViewsPrice.Price': function() {
            return new ProductViewsPriceView({
                model: this.model,
                origin: 'ITEMCELL'
            });
        }
    },

    // @method getContext
    // @return {Cart.QuickAddToCart.View.Context}
    getContext: function getContext() {
        const item_model = this.model.get('item');

        // @class Cart.QuickAddToCart.View.Context
        return {
            // @property {String} itemId
            itemId: item_model.get('_id'),
            // @property {Boolean} showQuickAddToCartButton
            showQuickAddToCartButton: this.showQuickAddToCartButton,
            // @property {Number} minimumQuantity
            minimumQuantity: this.getMinimumQuantity(),
            // @property {Boolean} maximumQuantity
            isMaximumQuantity: !!this.getMaximumQuantity(),
            // @property {Number} isMaximumQuantity
            maximumQuantity: this.getMaximumQuantity(),
            // @property {Number} quantity
            quantity: this.model.get('quantity')
        };
        // @class Cart.QuickAddToCart.View
    }
});

// @class Cart.QuickAddToCart.View.Initialize.Options
// @property {Product.Model} model
