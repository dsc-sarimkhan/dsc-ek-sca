/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.NonShippableItems"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as order_wizard_non_shippable_items_module_tpl from 'order_wizard_non_shippable_items_module.tpl';

import WizardModule = require('../../Wizard/JavaScript/Wizard.Module');
import TransactionLineViewsCellNavigableView = require('../../../Commons/Transaction.Line.Views/JavaScript/Transaction.Line.Views.Cell.Navigable.View');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');

// @module OrderWizard
// @class OrderWizard.Module.NonShippalbeItems @extend Wizard.Module
export = WizardModule.extend({
    template: order_wizard_non_shippable_items_module_tpl,

    initialize: function(options) {
        WizardModule.prototype.initialize.apply(this, arguments);
        this.wizard.model.on('ismultishiptoUpdated', this.render, this);

        this.options = options;

        BackboneCompositeView.add(this);
    },

    // Returns the list of non shippable items/lines
    getLinesNotShippable: function() {
        return this.wizard.model.getNonShippableLines();
    },

    isActive: function(): boolean {
        return this.getLinesNotShippable().length;
    },

    render: function(): void {
        if (this.isActive()) {
            this._render();
        } else {
            this.$el.empty();
        }
    },

    childViews: {
        'NonShippableItems.Collection': function() {
            return new BackboneCollectionView({
                collection: this.getLinesNotShippable(),
                childView: TransactionLineViewsCellNavigableView,
                viewsPerRow: 1,
                childViewOptions: {
                    navigable: false,

                    detail1Title: Utils.translate('Qty:'),
                    detail1: 'quantity',

                    detail2Title: Utils.translate('Unit price'),
                    detail2: 'rate_formatted',

                    detail3Title: Utils.translate('Amount:'),
                    detail3: 'amount_formatted'
                }
            });
        }
    },

    // @method getContext @return {OrderWizard.Module.NonShippalbeItems.Context}
    getContext: function() {
        const lines_not_shippable = this.getLinesNotShippable();

        // @class OrderWizard.Module.NonShippalbeItems.Context
        return {
            // @property {Boolean} showNonShippableLines
            showNonShippableLines: !!(lines_not_shippable && lines_not_shippable.length),
            // @property {Number} nonShippableLinesLength
            nonShippableLinesLength: lines_not_shippable.length,
            // @property {String} title
            title: this.options.title,
            // @property {Boolean} showCustomTitle
            showCustomTitle: !!this.options.title,
            // @property {Boolean} showEditCartButton
            showEditCartButton: !!this.options.show_edit_cart_button,
            // @property {Boolean} showMobile
            showMobile: !!this.options.showMobile,
            // @property {Boolean} showTableHeader
            showTableHeader: !!this.options.show_table_header,
            // @property {Boolean} showOpenedAccordion
            showOpenedAccordion: !!this.options.show_opened_accordion
        };
    }
});
