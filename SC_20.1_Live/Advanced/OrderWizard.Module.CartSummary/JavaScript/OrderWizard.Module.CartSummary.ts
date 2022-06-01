/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.CartSummary"/>

import * as _ from 'underscore';
import * as order_wizard_cart_summary_tpl from 'order_wizard_cart_summary.tpl';
import * as cart_summary_gift_certificate_cell_tpl from 'order_wizard_cartitems_module.tpl';

import WizardModule = require('../../Wizard/JavaScript/Wizard.Module');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import CartPromocodeListView = require('../../../Commons/Cart/JavaScript/Cart.Promocode.List.View');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import GlobalViewsFormatPaymentMethodView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.FormatPaymentMethod.View');
import LiveOrderModel = require('../../../Commons/LiveOrder/JavaScript/LiveOrder.Model');

// @class OrderWizard.Module.CartSummary @extends Wizard.Module
export = WizardModule.extend({
    // @property {Function} template
    template: order_wizard_cart_summary_tpl,

    // @property {String} className
    className: 'OrderWizard.Module.CartSummary',

    // @property {Object} attributes
    attributes: {
        id: 'order-wizard-layout',
        class: 'order-wizard-layout'
    },

    // @method initialize
    initialize: function initialize() {
        WizardModule.prototype.initialize.apply(this, arguments);
        const self = this;
        // on change model we need to refresh summary
        this.wizard.model.on('change:summary change:paymentmethods', function() {
            // This is an ugly hack to solve the case when the change event trigger first
            // than the confirmation and the lines are converted to collections and models
            if (
                !_.isArray(self.wizard.model.get('lines')) &&
                self.wizard.model.get('confirmation') &&
                _.isObject(self.wizard.model.get('confirmation').attributes)
            ) {
                self.render();
            }
        });

        const suitetaxes = Configuration.get('siteSettings.isSuiteTaxEnabled');

        if (suitetaxes && this.options.isConfirmation) {
            this.wizard.model.on('change:suitetaxes', function() {
                self.render();
            });
        }

        BackboneCompositeView.add(this);
    },

    isActive: function isActive(): boolean {
        return this.options.isConfirmation
            ? this.wizard.model.get('confirmation').get('internalid')
            : true;
    },

    // @method render
    // @return {Void}
    render: function render() {
        if (this.state === 'present') {
            this._render();
            this.trigger('ready', true);
        }
    },

    // @property {Object} childViews
    childViews: {
        GiftCertificates: function() {
            return new BackboneCollectionView({
                collection:
                    this.wizard.model.get('paymentmethods').where({ type: 'giftcertificate' }) ||
                    [],
                cellTemplate: cart_summary_gift_certificate_cell_tpl,
                viewsPerRow: 1,
                childView: GlobalViewsFormatPaymentMethodView,
                rowTemplate: null
            });
        },
        CartPromocodeListView: function() {
            const self = this;
            const promocodeListView = new CartPromocodeListView({
                model: this.wizard.model,
                hideRemovePromocodeButton: false
            });

            promocodeListView.on('removing_promocode', function() {
                self.trigger('change_enable_continue', false);
            });

            promocodeListView.on('remove_promocode_finished', function() {
                self.trigger('change_enable_continue', true);
            });

            if (this._isReadFromConfirmation()) {
                promocodeListView.setOptions({
                    model: this._getModel(),
                    isReadOnly: true
                });
            }

            return promocodeListView;
        }
    },
    _isReadFromConfirmation: function() {
        const confirmation = this.wizard.model.get('confirmation');
        // You need to read from confirmation from the wizards (checkout) that have
        // the isExternalCheckout and the return value is true (when returning from an external payment method)
        // Other wizards, like QuoteToSalesOrder, does not make the confirmation hack
        const read_from_confirmation =
            confirmation && confirmation.get('internalid') && this.wizard.isExternalCheckout;

        return read_from_confirmation;
    },

    // @method getShowShippingCost
    // @returns {boolean}
    getShowShippingCost: function(confirmation): boolean {
        const confirmation_lines = confirmation && confirmation.get('lines');

        if (confirmation_lines.length) {
            const pickup_lines = confirmation_lines.filter(function(model) {
                return (
                    model.get('fulfillmentChoice') && model.get('fulfillmentChoice') === 'pickup'
                );
            });

            const non_shippable_lines = confirmation_lines.filter(function(model) {
                return !model.get('item').get('_isfulfillable');
            });

            return confirmation_lines.length - non_shippable_lines.length - pickup_lines.length > 0;
        }
        return this.wizard.model.getIfThereAreDeliverableItems();
    },

    // @method getShowPickupCost
    // @returns {boolean}
    getShowPickupCost: function(confirmation): boolean {
        const confirmation_lines = confirmation && confirmation.get('lines');

        if (confirmation_lines.length) {
            return !!confirmation_lines.find(function(model) {
                return (
                    model.get('fulfillmentChoice') && model.get('fulfillmentChoice') === 'pickup'
                );
            });
        }
        return !!this.wizard.model.getPickupInStoreLines().length;
    },

    _getModel: function() {
        if (this._isReadFromConfirmation()) {
            const wizard_confirmation = this.wizard.model.get('confirmation');
            const internalid = wizard_confirmation.get('internalid');
            if (internalid) {
                wizard_confirmation.set('internalid', internalid.toString());
            }
            return wizard_confirmation;
        }
        return this.wizard.model;
    },
    // @method getContext
    // @returns {OrderWizard.Module.CartSummary.Context}
    getContext: function getContext() {
        const model = this._getModel();
        const summary = model.get('summary') || {};
        const item_count = LiveOrderModel.countItems(model.get('lines'));
        const confirmation = this.wizard.model.get('confirmation');

        // @class OrderWizard.Module.CartSummary.Context
        return {
            model: model,
            // @property {Number} itemCount
            itemCount: item_count,
            // @property {Boolean} itemCountGreaterThan1
            itemCountGreaterThan1: item_count > 1,
            // @property {Array} giftCertificates
            giftCertificates: model.get('paymentmethods').where({ type: 'giftcertificate' }) || [],
            // @property {Boolean} showGiftCertificates
            showGiftCertificates: !!summary.giftcertapplied,
            // @property {Boolean} showDiscount
            showDiscount: !!summary.discounttotal,
            // @property {Boolean} showHandlingCost
            showHandlingCost: !!summary.handlingcost,
            // @property {Boolean} showShippingCost
            showShippingCost: this.getShowShippingCost(confirmation),
            // @property {Boolean} showPickupCost
            showPickupCost: this.getShowPickupCost(confirmation),
            // @property {Boolean} showRemovePromocodeButton
            showRemovePromocodeButton: !!this.options.allow_remove_promocode,
            // @property {Boolean} showWarningMessage
            showWarningMessage: !!this.options.warningMessage,
            // @property {String} warningMessage
            warningMessage: this.options.warningMessage,
            // @property {Boolean} showEditCartMST
            showEditCartMST: this.wizard.isMultiShipTo() && !this.options.isConfirmation,
            // @property {String} taxLabel
            taxLabel: Configuration.get('summaryTaxLabel')
                ? Configuration.get('summaryTaxLabel')
                : 'Tax Total',
            // @property {String} suiteTaxesEnabled
            suiteTaxesEnabled: !!this.wizard.model.get('suitetaxes'),
            // @property {String} suiteTaxes
            suiteTaxes: this.wizard.model.get('suitetaxes')
        };
        // @class OrderWizard.Module.CartSummary
    }
});
