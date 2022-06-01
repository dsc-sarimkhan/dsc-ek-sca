/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.CartItems"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as order_wizard_cartitems_module_tpl from 'order_wizard_cartitems_module.tpl';

import WizardModule = require('../../Wizard/JavaScript/Wizard.Module');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import TransactionLineViewsCellNavigableView = require('../../../Commons/Transaction.Line.Views/JavaScript/Transaction.Line.Views.Cell.Navigable.View');
import LiveOrderModel = require('../../../Commons/LiveOrder/JavaScript/LiveOrder.Model');
// @class OrderWizard.Module.CartItems @extends Wizard.Module
export = WizardModule.extend({
    // @property {Function} template
    template: order_wizard_cartitems_module_tpl,

    // @method render
    render: function() {
        this.application = this.wizard.application;
        this.profile = this.wizard.options.profile;
        this.options.application = this.wizard.application;

        if (this.isActive()) {
            this._render();
        }
    },

    initialize: function() {
        const self = this;

        WizardModule.prototype.initialize.apply(this, arguments);
        this.wizard.model.on('ismultishiptoUpdated', function() {
            self.render();
        });

        this.wizard.model.on('promocodeUpdated', function() {
            self.render();
        });

        BackboneCompositeView.add(this);
    },

    // @property {Object} childViews
    childViews: {
        'Items.Collection': function() {
            return new BackboneCollectionView({
                collection: this.model.get('lines'),
                childView: TransactionLineViewsCellNavigableView,
                viewsPerRow: 1,
                childViewOptions: {
                    navigable: !this.options.hide_item_link,

                    detail1Title: Utils.translate('Qty:'),
                    detail1: 'quantity',

                    detail2Title: Utils.translate('Unit price:'),
                    detail2: 'rate_formatted',

                    detail3Title: Utils.translate('Amount:'),
                    detail3: 'amount_formatted'
                }
            });
        }
    },

    // @method getContext @returns {OrderWizard.Module.CartItems.Context}
    getContext: function() {
        const lines = this.model.get('lines');
        const item_count = LiveOrderModel.countItems(lines);

        // @class OrderWizard.Module.CartItems.Context
        return {
            // @property {LiveOrder.Model} model
            model: this.model,
            // @property {Boolean} itemCountGreaterThan1
            itemCountGreaterThan1: item_count > 1,
            // @property {Number} itemCount
            itemCount: item_count,
            // @property {Boolean} showOpenedAccordion
            showOpenedAccordion: _.result(this.options || {}, 'showOpenedAccordion', false),
            // @property {Boolean} showEditCartButton
            showEditCartButton: !this.options.hide_edit_cart_button,
            // @property {Boolean} showHeaders
            showHeaders: !this.options.hideHeaders,
            // @property {Boolean} showMobile
            showMobile: this.options.showMobile
        };
    }
});
