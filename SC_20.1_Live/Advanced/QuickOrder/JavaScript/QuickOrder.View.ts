/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="QuickOrder.View"/>

import * as _ from 'underscore';
import * as quick_order_tpl from 'quick_order.tpl';
import { Loggers } from '../../../Commons/Loggers/JavaScript/Loggers';

import * as InstrumentationAddToCart from '../../../Commons/Instrumentation/JavaScript/InstrumentationAddToCart';
import { ItemTrack } from '../../../Commons/Instrumentation/JavaScript/APMTrackerParameters';

import QuickAddView = require('../../QuickAdd/JavaScript/QuickAdd.View');
import LiveOrderModel = require('../../../Commons/LiveOrder/JavaScript/LiveOrder.Model');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class QuickOrder.View @extend Backbone.View
const QuickOrderView: any = BackboneView.extend({
    // @property {Function} template
    template: quick_order_tpl,

    // @method initialize Overrides default method to convert current view in to composite
    // @return {Void}
    initialize: function() {
        this.cart = LiveOrderModel.getInstance();

        this.quickAddViewComponent = new QuickAddView({
            getItemQuantitySet: _.bind(this.getItemQuantitySet, this),
            showBackorderable: false,
            validateMaxQty: true
        });
        this.quickAddViewComponent.on('selectedLine', this.addNewLine, this);
    },

    // @method getItemQuantitySet Auxiliary method used to provide the amount of already added items into the transaction to the quick add component
    // @param {Number} item_id
    // @return {Number}
    getItemQuantitySet: function(item_id) {
        const selected_line = this.cart.get('lines').find(function(line) {
            return line.get('item').id === item_id;
        });

        return selected_line ? parseInt(selected_line.get('quantity'), 10) : 0;
    },

    // @method addNewLine
    // @param {QuickAdd.View.SelectedLine.Properties} options
    // @return {Void}
    addNewLine: function(options) {
        const loggers = Loggers.getLogger();
        const itemTrack: ItemTrack = InstrumentationAddToCart.itemToTrack(options.selectedLine);
        const actionId = loggers.start('Add to Cart');
        const { selectedLine } = options;

        this.cart.addLine(selectedLine).then(() => {
            const addToCartOperationIds = InstrumentationAddToCart.getAddToCartOperationId(
                this.cart.get('lines').models,
                selectedLine
            );
            loggers.end(actionId, {
                operationIds: addToCartOperationIds,
                status: 'success',
                itemId: itemTrack.itemId,
                itemQuantity: itemTrack.itemQuantity
            });
        });
    },

    // @property {ChildViews} childViews
    childViews: {
        QuickAddView: function() {
            return this.quickAddViewComponent;
        }
    },
    // @method destroy Override default implementation to clean up all attached events of the initialize
    // @return {Void}
    destroy: function() {
        this.quickAddViewComponent.off('selectedLine');
        this._destroy();
    },

    // @method getContext
    // @return {QuickOrder.View.Context}
    getContext: function() {
        // @class QuickOrder.View.Context
        return {
            // @property {Boolean} showOpenedAccordion
            showOpenedAccordion: !!this.options.openQuickOrder
        };
        // @class QuickOrder.View
    }
});

export = QuickOrderView;
