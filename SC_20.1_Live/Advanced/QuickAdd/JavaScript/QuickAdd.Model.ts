/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="QuickAdd.Model"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import TransactionLineModel = require('../../../Commons/Transaction/JavaScript/Transaction.Line.Model');

// @class QuickAdd.Model @extends Transaction.Line.Model
const QuickAddModel: any = TransactionLineModel.extend({
    // @method initialize
    // @return {Void}
    initialize: function() {
        TransactionLineModel.prototype.initialize.apply(this, arguments);

        // @property {QuickAdd.Model.Initialization.Options} options
        this.options = {};
    },

    // @method setOptions
    // @param {QuickAdd.Model.Initialization.Options} options
    // @return {QuickAdd.Model} Returns itself
    setOptions: function(options) {
        this.options = options || this.options;
        return this;
    },

    // @method clone Override default clone method to pass the set options to the cloned model
    // @return {QuickAdd.Model}
    clone: function() {
        const result = new QuickAddModel(this.toJSON());
        result.setOptions(this.options);
        return result;
    },

    // @property {Object} validation Specify the validation rules for the quantity and quickaddSearch attributes
    validation: {
        quickaddSearch: {
            fn: function(val) {
                const product = this.get('selectedProduct');
                const item = product && product.get('item');

                if (!(product && (product.getSku() === val || item.get('_name') === val))) {
                    return Utils.translate('Begin typing SKU to select an item');
                }
            }
        },
        quantity: {
            fn: function(val) {
                if (!val) {
                    return Utils.translate('Enter quantity');
                }

                const product = this.get('selectedProduct');
                const selectedItem = product && product.getItem();

                if (selectedItem) {
                    const already_set_quantity = _.isFunction(this.options.getItemQuantitySet)
                        ? this.options.getItemQuantitySet(selectedItem.id)
                        : 0;

                    if (
                        already_set_quantity + this.get('quantity') <
                        selectedItem.get('_minimumQuantity', true)
                    ) {
                        return Utils.translate(
                            'The minimum quantity for this item is $(0).',
                            selectedItem.get('_minimumQuantity', true)
                        );
                    }
                    if (
                        this.options.validateMaxQty &&
                        !!selectedItem.get('_maximumQuantity') &&
                        already_set_quantity + this.get('quantity') >
                            selectedItem.get('_maximumQuantity', true)
                    ) {
                        return Utils.translate(
                            'The maximum quantity for this item is $(0).',
                            selectedItem.get('_maximumQuantity', true)
                        );
                    }
                }
            }
        }
    }
});
export = QuickAddModel;

// @class QuickAdd.Model.Initialization.Options
// @property {Function<Number,Number>} getItemQuantitySet Function that given an item id returns how many item already are present in the cart-like.
// This work to decouple this component of any other concrete implementation.
// IMPORTANT: If the passed in item id is not in the cart-like this function must return 0 (the number zero).
