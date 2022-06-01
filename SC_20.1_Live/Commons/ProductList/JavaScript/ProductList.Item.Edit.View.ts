/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductList.Item.Edit.View"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as jQuery from '../../Core/JavaScript/jQuery';

import * as product_list_edit_item_tpl from 'product_list_edit_item.tpl';

import ProductViewsPriceView = require('../../ProductViews/JavaScript/ProductViews.Price.View');
import ProductDetailsOptionsSelectorView = require('../../ProductDetails/JavaScript/ProductDetails.Options.Selector.View');
import ProductListItemModel = require('./ProductList.Item.Model');
import GlobalViewsStarRatingView = require('../../GlobalViews/JavaScript/GlobalViews.StarRating.View');
import BackboneCompositeView = require('../../Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');
import BackboneFormView = require('../../Backbone.FormView/JavaScript/Backbone.FormView');

// @class ProductList.Item.Edit.View View to handle Product Lists Item edition. @extends Backbone.View
export = BackboneView.extend({
    template: product_list_edit_item_tpl,

    title: Utils.translate('Edit item'),

    page_header: Utils.translate('Edit item'),

    modalClass: 'global-views-modal-large',

    events: {
        'submit form': 'submitForm',
        'blur [data-toggle="text-option"]': 'setOption',
        'click [data-toggle="set-option"]': 'setOption',
        'change [data-toggle="select-option"]': 'setOption',

        'change [name="quantity"]': 'updateQuantity',
        'keypress [name="quantity"]': 'ignoreEnter',
        'click [data-ui-action="add"]': 'addQuantity',
        'click [data-ui-action="minus"]': 'subQuantity',

        'change [name="description"]': 'updateDescription',
        'keypress [name="description"]': 'ignoreEnter',

        'change [name="priority"]': 'updatePriority',

        'keydown [data-toggle="text-option"]': 'tabNavigationFix',
        'focus [data-toggle="text-option"]': 'tabNavigationFix'
    },

    bindings: {
        '[name="description"]': 'description'
    },

    initialize: function(options) {
        this.application = options.application;
        this.parentView = options.parentView;
        this.target = options.target;
        this.title = options.title;
        this.page_header = options.title;
        this.originalQuantity = options.model.get('quantity');

        this.confirm_edit_method = options.confirm_edit_method;
        this.on('modal-close', this.cancelSubmit, this);

        BackboneCompositeView.add(this);
        BackboneFormView.add(this);
    },

    // Edit the current item
    submitForm: function(e) {
        e.preventDefault();

        if (this.model.areAttributesValid(['quantity', 'options'], {})) {
            const self = this;

            this.$('[data-action="edit"]').attr('disabled', 'true');

            this.model.save(null, { validate: false }).done(function(new_attributes) {
                self.parentView[self.confirm_edit_method](new_attributes);

                const item_list: any = _.findWhere(
                    self.application.ProductListModule.Utils.getProductLists().models,
                    { id: self.parentView.model.id }
                );
                item_list &&
                    item_list
                        .get('items')
                        .get(self.model.id)
                        .set('quantity', new_attributes.quantity);

                if (self.inModal && self.$containerModal) {
                    self.$containerModal
                        .removeClass('fade')
                        .modal('hide')
                        .data('bs.modal', null);
                    self.destroy();
                }
            });
        }
    },

    cancelSubmit: function(e) {
        const changed = this.model.changedAttributes();

        if (!changed || (_.keys(changed).length == 1 && _.keys(changed)[0] == 'location')) return;

        const keys = _.keys(changed);
        const prev = _.pick(this.model.previousAttributes(), keys);

        this.model.set(prev, { silent: true });
        this.model.set('quantity', this.originalQuantity);
    },

    // Updates the quantity of the model
    updateQuantity: function(e) {
        let new_quantity = parseInt(<any>jQuery(e.target).val(), 10);
        const min_quantity = this.getMinimumQuantity();
        const max_quantity = this.getMaximumQuantity();
        const current_quantity = this.model.get('quantity');

        new_quantity = new_quantity >= min_quantity ? new_quantity : min_quantity;

        new_quantity =
            max_quantity !== 0 && new_quantity > max_quantity ? max_quantity : new_quantity;

        jQuery(e.target).val(new_quantity);

        if (new_quantity !== current_quantity) {
            this.model.set('quantity', new_quantity);
            this.storeFocus(e);
            this.render();
        }
    },

    // @method addQuantity Increase the product's Quantity by 1
    // @param {HTMLEvent} e
    addQuantity: function(e) {
        e.preventDefault();

        const $element = jQuery(e.target);
        const oldValue = $element
            .parent()
            .find('input')
            .val();
        const newVal = parseInt(<any>oldValue, 10) + 1;

        const input = $element.parent().find('input');

        input.val(newVal);
        input.trigger('change');
    },

    // @method subQuantity Decreases the product's Quantity by 1
    // @param {HTMLEvent} e
    subQuantity: function(e) {
        e.preventDefault();

        const $element = jQuery(e.target);
        const oldValue = $element
            .parent()
            .find('input')
            .val();
        let newVal = parseInt(<any>oldValue, 10) - 1;

        newVal = Math.max(1, newVal);

        const input = $element.parent().find('input');

        input.val(newVal);
        input.trigger('change');
    },

    // @method getMinimumQuantity Returns the minimum purchasable quantity of the active item
    getMinimumQuantity: function(): number {
        return this.getMinMaxQuantity('_minimumQuantity', 1);
    },

    // @method getMaximumQuantity Returns the minimum purchasable quantity of the active item
    getMaximumQuantity: function(): number {
        return this.getMinMaxQuantity('_maximumQuantity', 0);
    },

    getMinMaxQuantity: function(minMax, minMaxNumber): number {
        if (this.model.isMatrixChild()) {
            const optionsSelected = this.model.get('itemDetails').itemOptions;
            const optionsAvailable = this.model.get('itemDetails').getPosibleOptions();
            const activeItem = this.model.getMatrixItem(optionsSelected, optionsAvailable);

            return activeItem && activeItem.get(minMax) ? activeItem.get(minMax) : minMaxNumber;
        }
        return this.model.get('item').get(minMax)
            ? this.model.get('item').get(minMax)
            : minMaxNumber;
    },

    // Updates the description of the model
    updateDescription: function(e) {
        const new_description = jQuery(e.target).val();
        const current_description = this.model.get('description');

        if (new_description !== current_description) {
            this.model.set('description', new_description);
            this.storeFocus(e);
        }
    },

    // Updates the priority of the model
    updatePriority: function(e) {
        const new_priority = jQuery(e.target).val();
        const current_priority = this.model.get('priority');

        if (new_priority !== current_priority) {
            this.model.set('priority', { id: new_priority });
            this.storeFocus(e);
        }
    },

    // Sets an item option (matrix or custom)
    setOption: function(e) {
        const $target = jQuery(e.currentTarget);
        let value = $target.val() || $target.data('value') || null;
        const cart_option_id = $target.closest('[data-type="option"]').data('cart-option-id');

        // Prevent from going away
        e.preventDefault();

        // if option is selected, remove the value
        if ($target.data('active')) {
            value = null;
        }

        this.model.setOption(cart_option_id, value);

        this.storeFocus(e);
        this.render();
    },

    // view.storeFocus
    // Computes and store the current state of the item and refresh the whole view, re-rendering the view at the end
    // This also updates the url, but it does not generates a history point
    storeFocus: function() {
        const focused_element = this.$(':focus').get(0);

        this.focusedElement = focused_element ? Utils.getFullPathForElement(focused_element) : null;
    },

    // view.tabNavigationFix:
    // When you blur on an input field the whole page gets rendered,
    // so the function of hitting tab to navigate to the next input stops working
    // This solves that problem by storing a a ref to the current input
    tabNavigationFix: function(e) {
        this.hideError();

        // If the user is hitting tab we set tabNavigation to true, for any other event we turn ir off
        this.tabNavigation = e.type === 'keydown' && e.which === 9;
        this.tabNavigationUpsidedown = e.shiftKey;
        this.tabNavigationCurrent = Utils.getFullPathForElement(e.target);
    },

    afterAppend: function() {
        this.focusedElement && this.$(this.focusedElement).focus();

        if (this.tabNavigation) {
            const current_index = this.$(':input').index(this.$(this.tabNavigationCurrent).get(0));
            const next_index = this.tabNavigationUpsidedown ? current_index - 1 : current_index + 1;

            this.$(':input:eq(' + next_index + ')').focus();
        }
    },

    // view.showInModal:
    // Takes care of showing the pdp in a modal, and changes the template, doesn't trigger the
    // after events because those are triggered by showContent
    showInModal: function(options) {
        this.template = 'product_list_edit_item';

        return this.application.getLayout().showInModal(this, options);
    },

    // don't want to trigger form submit when user presses enter when in the quantity input text
    ignoreEnter: function(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
        }
    },

    childViews: {
        'ItemViews.Price': function() {
            return new ProductViewsPriceView({
                model: this.model,
                origin: 'PRODUCTLISTDETAILSEDIT'
            });
        },
        'GlobalViews.StarRating': function() {
            return new GlobalViewsStarRatingView({
                model: this.model.get('item')
            });
        },
        'ItemDetails.Options': function() {
            return new ProductDetailsOptionsSelectorView({
                model: this.model
            });
        }
    },

    // @method getContext
    // @return {ProductList.Item.Edit.View.Context}
    getContext: function() {
        const line = this.model;
        const item = line.get('item');
        const min_quantity = item.get('_minimumQuantity');
        const max_quantity = this.getMaximumQuantity();
        const priority = line.get('priority');

        // @class ProductList.Item.Edit.View.Context
        return {
            // @property {Boolean} showRating
            showRating: SC.ENVIRONMENT.REVIEWS_CONFIG && SC.ENVIRONMENT.REVIEWS_CONFIG.enabled,
            // @property {Integer} quantity
            quantity: line.get('quantity'),
            // @property {Boolean} showMinimumQuantity
            showMinimumQuantity: min_quantity > 1,
            // @property {Number} minQuantity
            minQuantity: min_quantity,
            // @property {Boolean} showMaximumQuantity
            showMaximumQuantity: max_quantity > 0,
            // @property {Number} maxQuantity
            maxQuantity: max_quantity,
            // @property {String} description
            description: line.get('description'),
            // @property {String} productId
            productId: item.get('internalid'),
            // @property {String} productName
            productName: item.get('_name'),
            // @property {String} itemCreatedDate
            itemCreatedDate: line.get('created'),
            // @property {Boolean} isSelectionCompleteForEdit
            isSelectionCompleteForEdit: line.areAttributesValid(['quantity', 'options'], {}),
            // @property {Boolean} isPriority1
            isPriority1: priority.id === '1',
            // @property {Boolean} isPriority2
            isPriority2: priority.id === '2',
            // @property {Boolean} isPriority3
            isPriority3: priority.id === '3',
            // @property {ImageContainer} thumbnail
            thumbnail: this.model.getThumbnail()
        };
    }
});
