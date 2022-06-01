/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductList.Details.View"/>

import * as _ from 'underscore';
import '../../BackboneExtras/JavaScript/Backbone.View.render';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as jQuery from '../../Core/JavaScript/jQuery';

import * as product_list_details_tpl from 'product_list_details.tpl';

import ProductListItemCollection = require('./ProductList.Item.Collection');
import ProductListModel = require('./ProductList.Model');
import ProductListListsView = require('./ProductList.Lists.View');
import ProductListAddedToCartView = require('./ProductList.AddedToCart.View');
import ProductListItemEditView = require('./ProductList.Item.Edit.View');
import ProductListItemModel = require('./ProductList.Item.Model');
import ProductListControlView = require('./ProductList.Control.View');
import ProductListDisplayFullView = require('./ProductList.DisplayFull.View');
import ProductListBulkActionsView = require('./ProductList.BulkActions.View');
import BackboneCompositeView = require('../../Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import ListHeaderView = require('../../ListHeader/JavaScript/ListHeader.View');
import LiveOrderModel = require('../../LiveOrder/JavaScript/LiveOrder.Model');
import Handlebars = require('../../Utilities/JavaScript/Handlebars');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// @class ProductList.Details.View @extends Backbone.View
export = BackboneView.extend({
    template: product_list_details_tpl,

    className: 'ProductListDetailsView',

    attributes: {
        id: 'WishlistDetail',
        class: 'ProductListDetailsView'
    },

    events: {
        // items events
        'click [data-action="add-to-cart"]': 'addItemToCartHandler',
        'click [data-action="add-items-to-cart"]': 'addItemsToCartBulkHandler',

        'click [data-action="delete-items"]': 'deleteItemsHandler',

        'click [data-action="edit-item"]': 'askEditListItem',
        'click [data-action="update-item-quantity"]': 'updateListItemQuantity',
        'click [data-action="update-item-quantity-max"]': 'updateListItemMaxQuantity',
        'click [data-ui-action="show-edit-notes"]': 'showEditNotes',
        'click [data-ui-action="cancel-edit-notes-form"]': 'showViewNotes',
        'click [data-action="add-list-to-cart"]': 'addListToCart_',

        'click [data-action="edit-list"]': 'editListHandler',

        'change [data-action="change-quantity"]': 'updateItemQuantity',
        'keyup [data-action="change-quantity"]': 'updateItemQuantity',
        'submit [data-action="update-quantity-item-list"]': 'updateItemQuantityFormSubmit',
        'click [data-action="product-list-item"]': 'toggleProductListItemHandler'
    },

    sortOptions: [
        {
            value: 'sku',
            name: Utils.translate('Sort by name'),
            selected: true
        },
        {
            value: 'price',
            name: Utils.translate('Sort by price')
        },
        {
            value: 'created',
            name: Utils.translate('Sort by date Added')
        },
        {
            value: 'priority',
            name: Utils.translate('Sort by priority')
        }
    ],

    initialize: function(options) {
        this.options = options;
        this.routerArguments = options.routerArguments;
        this.application = options.application;
        this.cart = LiveOrderModel.getInstance();
        this.displayOptions = this.application.getConfig('productList.templates');
        this.prefix = 'tmpl_';

        this.on('afterCompositeViewRender', function() {
            const self = this;
            const out_of_stock_items = [];
            const items = this.model.get('items');
            const is_single_list = this.application.ProductListModule.Utils.isSingleList();

            items.each(function(item) {
                if (!item.get('item').get('_isPurchasable')) {
                    out_of_stock_items.push(item);
                }

                if (!is_single_list) {
                    self.renderMove(item);
                }
            });

            let warning_message = null;

            if (out_of_stock_items.length === 1) {
                warning_message = Utils.translate(
                    '$(0) of $(1) items in your list is currently not available for purchase. If you decide to add the list to your cart, only available products will be added.',
                    out_of_stock_items.length,
                    items.length
                );
            } else if (out_of_stock_items.length > 1) {
                warning_message = Utils.translate(
                    '$(0) of $(1) items in your list are currently not available for purchase. If you decide to add the list to your cart, only available products will be added.',
                    out_of_stock_items.length,
                    items.length
                );
            }

            if (warning_message) {
                self.showWarningMessage(warning_message);
            }
        });

        BackboneCompositeView.add(this);
    },

    beforeShowContent: function beforeShowContent() {
        this.router_args_id = this.routerArguments[0];
        this.options.params = Utils.parseUrlOptions(this.routerArguments[1]);

        return this._loadProductListDetails();
    },

    showContent: function showContent() {
        this.title = this.model.get('name');
        this.collection = this.model.get('items');
        this.collection.productListId = this.model.get('internalid');
        this.setupListHeader(this.collection);
        this.collection.on('reset', jQuery.proxy(this, 'render'));

        return BackboneView.prototype.showContent.apply(this, arguments);
    },

    // @method setupListHeader @param {Backbone.Collection} collection
    setupListHeader: function(collection) {
        const self = this;

        this.listHeader = new ListHeaderView({
            view: this,
            application: this.application,
            avoidFirstFetch: true,
            headerMarkup: function() {
                const view = new ProductListBulkActionsView({ model: self.model });
                view.render();
                return new Handlebars.SafeString(view.$el.html());
            },

            hideFilterExpandable: function() {
                return this.collection.length < 2;
            },
            selectable: true,
            collection: collection,
            sorts: this.sortOptions
        });
    },

    // @method addListToCart_ add this list to cart handler
    addListToCart_: function() {
        this.addListToCart(this.model);
    },

    // @method addListToCart
    addListToCart: ProductListListsView.prototype.addListToCart,

    // @method addItemToCartHandler Add a particular item into the cart
    addItemToCartHandler: function(e) {
        e.stopPropagation();
        e.preventDefault();

        const self = this;
        const selected_product_list_item_id = self
            .$(e.target)
            .closest('article')
            .data('id');
        const selected_product_list_item = self.model.get('items').findWhere({
            internalid: selected_product_list_item_id.toString()
        });
        const selected_item = selected_product_list_item.get('item');
        const selected_item_internalid = selected_item.internalid;
        const item_detail = selected_product_list_item.getItemForCart(
            selected_item_internalid,
            selected_product_list_item.get('quantity'),
            selected_item.itemoptions_detail,
            selected_product_list_item.getOptionsArray()
        );

        const add_to_cart_promise = this.addItemToCart(item_detail);
        const whole_promise = jQuery
            .when(add_to_cart_promise)
            .then(jQuery.proxy(this, 'showConfirmationHelper', selected_product_list_item));

        if (whole_promise) {
            this.disableElementsOnPromise(
                whole_promise,
                'article[data-item-id="' +
                    selected_item_internalid +
                    '"] a, article[data-item-id="' +
                    selected_item_internalid +
                    '"] button'
            );
        }
    },

    // @method _getSelection @return {items:ProductList.Item.Collection,
    // items_for_cart:Array<Backbone.Model>,button_selector:String}
    _getSelection: function() {
        const items = [];
        const button_selector = [];

        // Filter items for bulk operation
        _.each(this.collection.models, function(pli: any) {
            // irrelevant items: no-op
            if (pli.get('checked') !== true) {
                return;
            }

            items.push(pli);

            const item_internal_id = pli.getItemId();
            button_selector.push(
                'article[data-item-id="' +
                    item_internal_id +
                    '"] a, article[data-item-id="' +
                    item_internal_id +
                    '"] button'
            );
        });
        return {
            items: new ProductListItemCollection(items),
            button_selector: button_selector
        };
    },

    // @method addItemsToCartBulkHandler
    addItemsToCartBulkHandler: function(e) {
        e.preventDefault();

        const self = this;
        const selected_models = this._getSelection();

        // no items selected: no opt
        if (selected_models.items.length < 1) {
            return;
        }

        const button_selector = selected_models.button_selector.join(',');
        // add items to cart
        const add_to_cart_promise = this.cart.addProducts(selected_models.items.models);

        add_to_cart_promise.then(function() {
            self.unselectAll();
            self.showConfirmationHelper();
        });

        this.disableElementsOnPromise(add_to_cart_promise, button_selector);
    },

    // @method deleteItemsHandler
    deleteItemsHandler: function(e) {
        e.preventDefault();

        const self = this;
        const selected_models = this._getSelection();
        const delete_promises = [];

        if (selected_models.items.length < 1) {
            return;
        }

        // there are two collections with the same information this.model and the one on application
        // should remove the item on both
        const app_item_list: any = _.findWhere(
            self.application.ProductListModule.Utils.getProductLists().models,
            { id: self.model.id }
        );

        _.each([].concat(selected_models.items.models), function(item) {
            // fix already used in "deleteListItem"
            item.url = ProductListItemModel.prototype.url;

            app_item_list && app_item_list.get('items').remove(item);

            delete_promises.push(item.destroy().promise());
        });

        jQuery.when.apply(jQuery, delete_promises).then(function() {
            self.render();
            self.showConfirmationMessage(
                Utils.translate('The selected items were removed from your product list')
            );
        });
    },

    // @method selectAll this is called from the ListHeader when you check select all.
    selectAll: function() {
        _.each(this.collection.models, function(item: any) {
            item.set('checked', true);
        });
        this.render();
    },

    // @method unselectAll
    unselectAll: function() {
        _.each(this.collection.models, function(item: any) {
            item.set('checked', false);
        });
        this.render();
    },

    // @method showConfirmationHelper
    showConfirmationHelper: function(selected_item) {
        this.showConfirmationMessage(
            Utils.translate(
                'Good! The items were successfully added to your cart. You can continue to <a href="#" data-touchpoint="viewcart">view cart and checkout</a>'
            )
        );

        // selected item may be undefined
        if (_.isUndefined(selected_item) === true) {
            return;
        }

        this.addedToCartView = new ProductListAddedToCartView({
            application: this.application,
            parentView: this,
            item: selected_item
        });

        this.application.getLayout().showInModal(this.addedToCartView);
    },

    // @method addItemToCart Adds the item to the cart
    addItemToCart: function(item) {
        return this.cart.addItem(item);
    },

    // @method deleteListItem Remove an product list item from the current list
    // @param {ProductList.Item.Model} product_list_item @param {Function} successFunc
    deleteListItem: function(product_list_item, successFunc) {
        this.model.get('items').remove(product_list_item);
        product_list_item.url = ProductListItemModel.prototype.url;

        const promise = product_list_item.destroy();

        promise &&
            successFunc &&
            promise.done(function() {
                successFunc();
            });
    },

    // @method askEditListItem Edit a product list item from the current list
    askEditListItem: function(e) {
        e.stopPropagation();

        const product_list_itemid = this.$(e.target)
            .closest('[data-id]')
            .data('id');
        const selected_item = this.model.get('items').get(product_list_itemid);
        const editView = new ProductListItemEditView({
            application: this.application,
            parentView: this,
            model: selected_item,
            title: Utils.translate('Edit Item'),
            confirm_edit_method: 'editListItemHandler'
        });

        this.application.getLayout().showInModal(editView);
    },

    // @method updateListItemQuantity Updates product list item quantity from the current list
    updateListItemQuantity: function(e) {
        this.updateListItemMinMaxQuantity(e, '_minimumQuantity');
    },

    updateListItemMaxQuantity: function(e) {
        this.updateListItemMinMaxQuantity(e, '_maximumQuantity');
    },
    updateListItemMinMaxQuantity: function(e, minMax) {
        e.preventDefault();

        const self = this;
        const product_list_itemid = this.$(e.target).data('id');
        const selected_pli = this.model
            .get('items')
            .findWhere({ internalid: product_list_itemid.toString() });
        const quantity = selected_pli.get('item').get(minMax);
        const promise = this.updateItemQuantityHelper(selected_pli, quantity);

        promise &&
            promise.done(function() {
                self.render();
            });
    },

    // @method editListItemHandler Product list item edition handler
    editListItemHandler: function(new_attributes) {
        const new_model = new ProductListItemModel(new_attributes);
        const products = this.model.get('items');
        const original_model = products.get(new_attributes.internalid);
        const original_model_index = products.indexOf(original_model);

        this.model.get('items').remove(new_attributes.internalid, { silent: true });
        this.model.get('items').add(new_model, { at: original_model_index });

        this.render();
    },

    // @method getDisplayOption Retrieve the current (if any) items display option
    getDisplayOption: function() {
        const search = (this.options.params && this.options.params.display) || 'list';

        return _(this.displayOptions).findWhere({
            id: search
        });
    },

    // @method renderMove Renders the move control for a product list
    // @param {ProductList.Model} product_list_model
    renderMove: function(product_list_model) {
        const self = this;
        const container = this.$('[data-id="' + product_list_model.id + '"]').find(
            '[data-type="productlist-control-move"]'
        );
        self.application.ProductListModule.Utils.getProductListsPromise().then(() => {
            const control = new ProductListControlView({
                collection: self.getMoveLists(
                    self.application.ProductListModule.Utils.getProductLists(),
                    self.model,
                    product_list_model
                ),
                product: product_list_model,
                application: self.application,
                countedClicks: {},
                moveOptions: {
                    parentView: self,
                    productListItem: product_list_model
                }
            });

            jQuery(container)
                .empty()
                .append(control.$el);
            control.render();
        });
    },

    // @method getMoveLists Filters all lists so it does not include the current list
    // and the lists where the item is already present
    getMoveLists: function(all_lists, current_list, list_item): boolean {
        return all_lists.filtered(function(model) {
            return (
                model.get('internalid') !== current_list.get('internalid') &&
                !model.get('items').find(function(product_item) {
                    // return product_item.get('item').id === list_item.get('item').id;
                    return product_item.isEqual(list_item);
                })
            );
        });
    },

    // @method editListHandler Shows the edit modal view
    editListHandler: function(event) {
        event.preventDefault();
        ProductListListsView.prototype.editList.apply(this, [this.model]);
    },

    // @method getSelectedMenu
    getSelectedMenu: function() {
        return (
            'productlist_' +
            (this.model.get('internalid')
                ? this.model.get('internalid')
                : 'tmpl_' + this.model.get('templateid'))
        );
    },

    // @method getBreadcrumbPages
    getBreadcrumbPages: function() {
        const breadcrumb = [
            {
                text: Utils.translate('Wishlist'),
                href: '/wishlist'
            },
            {
                text: this.model.get('name'),
                href:
                    '/wishlist/' +
                    (this.model.get('internalid')
                        ? this.model.get('internalid')
                        : 'tmpl_' + this.model.get('templateid'))
            }
        ];
        if (this.application.ProductListModule.Utils.isSingleList()) {
            breadcrumb.splice(0, 1); // remove first
        }
        return breadcrumb;
    },

    // @method updateItemQuantityFormSubmit Updates quantity on form submit.
    updateItemQuantityFormSubmit: function(e) {
        e.preventDefault();
        this.updateItemQuantity(e);
    },

    // @method updateItemQuantityHelper Helper function. Used in updateItemQuantity
    // and updateListItemQuantity functions.
    updateItemQuantityHelper: function(selected_item, new_quantity) {
        selected_item.set('quantity', new_quantity);

        const self = this;
        const edit_result = selected_item.save(null, { validate: false });

        if (edit_result) {
            edit_result.done(function(new_attributes) {
                const new_model = new ProductListItemModel(new_attributes);
                self.model.get('items').add(new_model, { merge: true });
                const item_list = self.application.ProductListModule.Utils.getProductLists().findWhere(
                    { id: self.model.id }
                );
                item_list &&
                    item_list
                        .get('items')
                        .get(selected_item.id)
                        .set('quantity', new_quantity);
            });
        }

        return edit_result;
    },

    // @method updateItemQuantity executes on blur of the quantity input. Finds the item in
    // the product list, updates its quantity and saves the list model
    updateItemQuantity: _.debounce(function(e) {
        e.preventDefault();

        const product_list_itemid = this.$(e.target)
            .closest('article')
            .data('id');
        const selected_item = this.model
            .get('items')
            .findWhere({ internalid: product_list_itemid.toString() });
        const options = (<any>jQuery(e.target).closest('form')).serializeObject();
        const $input = jQuery(e.target)
            .closest('form')
            .find('[name="item_quantity"]');
        let new_quantity = parseInt(options.item_quantity, 10);
        const current_quantity = parseInt(selected_item.get('quantity'), 10);
        const minimum_quantity =
            parseInt(selected_item.get('item').get('_minimumQuantity'), 10) || 0;
        const maximum_quantity = parseInt(selected_item.get('item').get('_maximumQuantity'), 10);

        new_quantity =
            new_quantity > 0 && new_quantity > minimum_quantity
                ? new_quantity
                : minimum_quantity || current_quantity;

        new_quantity =
            !!maximum_quantity && new_quantity > maximum_quantity ? maximum_quantity : new_quantity;

        $input.val(new_quantity);

        if (new_quantity === current_quantity) {
            return;
        }

        $input.val(new_quantity).prop('disabled', true);

        const edit_promise = this.updateItemQuantityHelper(selected_item, new_quantity);

        if (!edit_promise) {
            return;
        }

        edit_promise.always(function() {
            $input.prop('disabled', false);
        });
    }, 600),

    // @method toggleProductListItemHandler
    toggleProductListItemHandler: function toggleProductListItemHandler(e) {
        this.toggleProductListItem(
            jQuery(e.target)
                .closest('[data-id]')
                .data('id')
        );
    },

    // @method toggleProductListItem
    toggleProductListItem: function(pli) {
        pli = this.collection.get(pli);

        if (pli) {
            this[pli.get('checked') ? 'unselectProductListItem' : 'selectProductListItem'](pli);
            this.render();
        }
    },

    // @method toggleProductListItem
    selectProductListItem: function(pli) {
        if (pli) {
            pli.set('checked', true);
        }
    },

    // @method unselectProductListItem
    unselectProductListItem: function(pli) {
        if (pli) {
            pli.set('checked', false);
        }
    },

    // @method _loadProductListDetails resolve the Product list details routes that can be of
    // form /wishlist/$(internalid) or
    // /wishlist/tmpl_$(templateid) in the case the record doesn't exist yet (predefined lists)
    // @param  {String} id @param {Object} options
    _loadProductListDetails: function() {
        let id = this.router_args_id;
        const index_of_question = id.indexOf('?');
        let internalid;
        let deferred = jQuery.Deferred();

        if (index_of_question !== -1) {
            internalid = parseInt(id, 10);

            if (!isNaN(internalid)) {
                id = internalid + '';
            }
        }

        if (id.indexOf(this.prefix) === 0) {
            // then this is a predefined template that doesn't exist yet (without internalid)
            const template_id = id.substring(
                this.prefix.length,
                index_of_question !== -1 ? index_of_question : id.length
            );
            const utils = this.application.ProductListModule.Utils;
            const template_product_list = utils
                .getProductLists()
                .findWhere({ templateId: template_id });
            const items = template_product_list.get('items');

            if (_.isArray(items)) {
                template_product_list.set('items', new ProductListItemCollection(items));
            }

            this.model = template_product_list;

            deferred.resolve();
        } else {
            this.model = new ProductListModel();
            this.model.set('internalid', id);

            deferred = this.model.fetch();
        }

        return deferred;
    },

    childViews: {
        ListHeader: function() {
            return this.listHeader;
        },
        'ProductList.DynamicDisplay': function() {
            const displayOption = this.getDisplayOption();
            const rows = parseInt(displayOption.columns, 10) || 3;

            return new BackboneCollectionView({
                childView: ProductListDisplayFullView,
                collection: this.model.get('items').models,
                viewsPerRow: rows,
                childViewOptions: {
                    application: this.application,
                    show_edit_action: true,
                    show_move_action: true
                }
            });
        }
    },

    // @method getContext @return {ProductList.Details.View.Context}
    getContext: function() {
        const items = this.model.get('items');
        const is_type_predefined = this.model.get('typeName') === 'predefined';

        // @class ProductList.Details.View.Context
        return {
            // @property {Boolean} showListHeader
            showListHeader: !(items.length === 0 && is_type_predefined),
            // @property {Boolean} isTypePredefined
            isTypePredefined: is_type_predefined,
            // @property {String} name
            name: this.model.get('name'),
            // @property {Boolean} hasItems
            hasItems: items.length > 0,
            // @property {Integer} itemsLength
            itemsLength: items.length,
            // @property {Boolean} hasOneItem
            hasOneItem: items.length === 1
        };
    }
});
