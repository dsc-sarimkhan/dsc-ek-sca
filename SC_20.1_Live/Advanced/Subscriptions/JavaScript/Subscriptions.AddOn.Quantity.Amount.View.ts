/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Subscriptions.AddOn.Quantity.Amount.View"/>
// Subscriptions.AddOn.Quantity.Amount.View.js
// -----------------------

import * as _ from 'underscore';
import * as template from 'subscriptions_addon_quantity_amount.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

const SubscriptionsAddOnQuantityAmountView: any = BackboneView.extend({
    template: template,

    events: {
        'click [data-action="plus"]': 'addQuantity',
        'click [data-action="minus"]': 'subQuantity',
        'change [data-type="quantity-input"]': 'changeQuantity',
        'keypress [data-type="quantity-input"]': 'changeQuantity'
    },

    initialize: function() {
        this.$('[data-type="quantity-input"]').value = this.model.get('quantity');
    },

    // @method addQuantity Add 1 the current to quantity-input field
    // @param {jQuery.Event} e
    // @return {Void}
    addQuantity: function(e) {
        e.preventDefault();

        const old_quantity = parseInt(this.$('[data-type="quantity-input"]').val(), 10);
        this.new_quantity = old_quantity + 1;

        if (this.new_quantity !== old_quantity) {
            const $element = this.$(e.target);
            const quantity_input = $element.parent().find('input');

            quantity_input.val(this.new_quantity);
            quantity_input.change();

            this.setQuantity();
        }
    },

    // @method subQuantity Subtracts 1 from quantity-input field
    // @param {jQuery.Event} e
    // @return {Void}
    subQuantity: function(e) {
        e.preventDefault();

        const old_quantity = parseInt(this.$('[data-type="quantity-input"]').val(), 10);
        this.new_quantity = old_quantity - 1;

        if (this.new_quantity !== old_quantity && this.new_quantity >= 1) {
            const $element = this.$(e.target);
            const quantity_input = $element.parent().find('input');

            quantity_input.val(this.new_quantity);
            quantity_input.change();

            this.setQuantity();
        }
    },

    // @method changeQuantity Debounce callings to setQuantity function to prevent losing focus
    // @param {jQuery.Event} e
    // @return {Void}
    changeQuantity: _.debounce(function() {
        this.setQuantity();
    }, 1000),

    // @method setQuantity Updates the model quantity and the input field.
    // @return {Void}
    setQuantity: function() {
        const str_quantity = this.$('[data-type="quantity-input"]').val();

        const quantity = Math.round(parseFloat(str_quantity));

        if (!_.isNaN(quantity) && _.isNumber(quantity) && quantity > 0) {
            this.isMinusButtonDisabled = quantity <= 1;
            if (!this.model.has('initialQuantity')) {
                this.model.set('initialQuantity', this.model.get('quantity'));
            }
            this.model.set('quantity', quantity);
        }
    },
    // @method getContext @returns {Overview.Banner.View.Context}
    getContext: function() {
        // @class Overview.Banner.View.Context
        return {
            // @property {bool} isMinusButtonDisabled
            isMinusButtonDisabled: this.isMinusButtonDisabled,
            quantity: this.model.get('quantity'),
            isReadOnly: this.model.isReadOnly()
        };
    }
});

export = SubscriptionsAddOnQuantityAmountView;
