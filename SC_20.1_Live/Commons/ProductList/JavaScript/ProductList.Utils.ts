/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductList.Utils"/>

import * as _ from 'underscore';
import { MyAccountMenu } from '../../../Advanced/Header/JavaScript/MyAccountMenu';
import './ProductList.CartSaveForLater.View';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as jQuery from '../../Core/JavaScript/jQuery';

import ProductListCollection = require('./ProductList.Collection');
import ProductListModel = require('./ProductList.Model');
import ProductListControlSingleView = require('./ProductList.ControlSingle.View');
import ProductListControlView = require('./ProductList.Control.View');
import ProductListItemModel = require('./ProductList.Item.Model');
import MenuTreeView = require('../../MenuTree/JavaScript/MenuTree.View');

let productListsInstancePromise;
let productListsInstance;

// @class ProductList.Utils an utility class to support the ProductList ApplicationModule.
// It will define shortcut accessors to product lists, render the controls on 'afterAppendView'
// and show and define the MyAccount menu items.
export = class ProductListUtils {
    application;

    // @property {control:String} placeholder this application will render some of
    // its views in existing DOM elements (placeholders)
    placeholder = { control: '[data-type="product-lists-control"]' };

    private entryId: string;

    public constructor(app) {
        this.application = app;
    }

    // @method getProductListsPromise Loads Product Lists collection model
    // singleton @return {jQuery.Deferred}
    public getProductListsPromise() {
        if (SC.ENVIRONMENT.PRODUCTLIST_ENABLED) {
            if (!productListsInstancePromise) {
                productListsInstancePromise = jQuery.Deferred();
                productListsInstance = new ProductListCollection();
                productListsInstance.application = this.application;

                productListsInstance.fetch({ cache: false }).done(function(jsonCollection) {
                    productListsInstance.reset(jsonCollection);
                    productListsInstancePromise.resolve(productListsInstance);
                });
            }
        } else {
            productListsInstancePromise = jQuery
                .Deferred()
                .reject('The Product List feature is not enabled in this account');
        }
        return productListsInstancePromise;
    }

    private static buildSubMenuEntry(productlist, entryId) {
        return {
            entryId: entryId,
            id:
                'productlist_' +
                (productlist.get('internalid') || 'tmpl_' + productlist.get('templateId')),
            url:
                'wishlist/' +
                (productlist.get('internalid') || 'tmpl_' + productlist.get('templateId')),
            name:
                (productlist.get('name') === 'My list'
                    ? Utils.translate('My list')
                    : productlist.get('name')) +
                ' (' +
                productlist.get('items').length +
                ')',
            index: 2
        };
    }

    public updateProductListMenu() {
        const utils = this;
        const product_lists = utils.getProductLists();
        const menu = MyAccountMenu.getInstance();
        function buildNewEntry() {
            const actual_object = {
                id: 'productlists',
                name: Utils.translate('Wishlist'),
                url: '',
                // Index of the menu item for menu order
                index: 2
            };
            return actual_object;
        }
        function buildSingleListNewEntry() {
            const the_single_list = product_lists.at(0);
            const actual_object = {
                id:
                    'productlist_' +
                    (the_single_list.get('internalid')
                        ? the_single_list.get('internalid')
                        : 'tmpl_' + the_single_list.get('templateId')),
                name: the_single_list.get('name'),
                url:
                    'wishlist/' +
                    (the_single_list.get('internalid')
                        ? the_single_list.get('internalid')
                        : 'tmpl_' + the_single_list.get('templateId')),
                // Index of the menu item for menu order
                index: 2
            };
            return actual_object;
        }
        if (!utils.isProductListEnabled()) {
            menu.removeEntry('product_list_dummy');
        } else {
            const newMenuEntry = utils.isSingleList() ? buildSingleListNewEntry() : buildNewEntry();
            this.entryId = newMenuEntry.id;
            menu.replaceEntry('product_list_dummy', {
                id: newMenuEntry.id,
                name: newMenuEntry.name,
                index: newMenuEntry.index,
                url: newMenuEntry.url
            });
            if (!utils.isSingleList()) {
                menu.addSubEntry({
                    entryId: newMenuEntry.id,
                    id: 'productlist_all',
                    name: Utils.translate('All my lists'),
                    url: 'wishlist',
                    index: 1
                });
                // Then add all the lists
                product_lists.each(function(productlist) {
                    menu.addSubEntry(
                        ProductListUtils.buildSubMenuEntry(productlist, newMenuEntry.id)
                    );
                });
            }
        }
        _.each(product_lists.models, (list: any) => {
            list.get('items').on('add remove', () => {
                const subMenuEntry = ProductListUtils.buildSubMenuEntry(list, this.entryId);
                MyAccountMenu.getInstance().replaceSubEntry(subMenuEntry.id, subMenuEntry);
                MenuTreeView.getInstance().updateMenuItemsUI();
            });
        });
        MenuTreeView.getInstance().updateMenuItemsUI();
        product_lists.on('add', model => {
            MyAccountMenu.getInstance().addSubEntry(
                ProductListUtils.buildSubMenuEntry(model, this.entryId)
            );
            MenuTreeView.getInstance().updateMenuItemsUI();
        });
        product_lists.on('remove', model => {
            MyAccountMenu.getInstance().removeSubEntry(
                ProductListUtils.buildSubMenuEntry(model, this.entryId).id
            );
            MenuTreeView.getInstance().updateMenuItemsUI();
        });
    }

    // @method productListsPromiseDone method to be called once the product lists are
    // loaded to show the MyAccount's menu item
    private productListsPromiseDone() {
        const layout = this.application.getLayout();
        if (this.application.ProductListModule.Utils.isSingleList()) {
            // Update header profile link for single product list...
            const the_single_list = this.application.ProductListModule.Utils.getProductLists().at(
                0
            );
            const product_list_menu_item = layout.$('.header-profile-single-productlist');

            if (the_single_list && product_list_menu_item) {
                const product_list_hashtag =
                    '#wishlist/' +
                    (the_single_list.get('internalid')
                        ? the_single_list.get('internalid')
                        : 'tmpl_' + the_single_list.get('templateId'));

                product_list_menu_item.text(the_single_list.get('name'));
                product_list_menu_item.attr('data-hashtag', product_list_hashtag);
            }
        }
    }

    // @method profileModelPromiseDone method to be executed once the user
    // profile has loaded. We need this to start working with product lists.
    public profileModelPromiseDone() {
        const utils = this.application.ProductListModule.Utils;
        // if Product Lists are not enabled, return...
        if (!utils.isProductListEnabled()) {
            return;
        }

        const layout = this.application.getLayout();

        // rendering product lists
        utils.renderProductLists();

        layout.on('afterAppendView', function(view) {
            utils.renderProductLists(view);
        });

        layout.on('afterAppendToDom', function() {
            utils.renderProductLists();
        });

        // Put this code block outside afterAppendView to avoid infinite loop!
        utils.getProductListsPromise().done(() => utils.productListsPromiseDone());

        ProductListItemModel.prototype.keyMapping = this.application.getConfig(
            'itemKeyMapping',
            {}
        );
        ProductListItemModel.prototype.itemOptionsConfig = this.application.getConfig(
            'itemOptions',
            []
        );
    }

    // @method getProductLists @return {ProductList.Collection}
    public getProductLists() {
        if (!productListsInstance) {
            productListsInstance = new ProductListCollection();
            productListsInstance.application = this.application;
        }

        return productListsInstance;
    }

    // @method getProductList obtain a single ProductList with all its item's data
    // @return {ProductList.Model}
    public getProductList(id) {
        const productList = new ProductListModel();

        productList.set('internalid', id);

        return productList.fetch();
    }

    // @method getSavedForLaterProductList obtain a single Saved for Later ProductList with
    // all its item's data @return {jQuery.Deferred}
    getSavedForLaterProductList() {
        const productList = new ProductListModel();

        productList.set('internalid', 'later');

        return productList.fetch();
    }

    getRequestAQuoteProductList() {
        const productList = new ProductListModel();

        productList.set('internalid', 'quote');

        return productList.fetch();
    }

    // @method isProductListEnabled is the Product-List functionality available for this
    // application? @return {Boolean}
    isProductListEnabled(): boolean {
        return SC.ENVIRONMENT.PRODUCTLIST_ENABLED && !SC.ENVIRONMENT.standalone;
    }

    // @method isSingleList are we in the single-list modality ? @return {Boolean}
    isSingleList(): boolean {
        return (
            !this.application.getConfig('productList.additionEnabled', false) &&
            _.filter(this.application.getConfig('productList.listTemplates', []), function(
                pl: any
            ) {
                return !pl.typeName || (pl.typeName !== 'later' && pl.typeName !== 'quote');
            }).length === 1
        );
    }

    // @method renderProductLists render all product-lists related widgets
    // @param {Backbone.View} view
    renderProductLists(view) {
        if (!this.application.ProductListModule.Utils.isProductListEnabled()) {
            return;
        }

        this.application.ProductListModule.Utils.renderControl(view);
    }

    // @method internalGetProductId Gets the internal product id for a store item
    // considering it could be a matrix child.	// @param {Item.Model} product
    // @return {String}
    internalGetProductId(product): string {
        // If its matrix its expected that only 1 item is selected, not more than one nor 0
        if (product.getPosibleOptions().length) {
            const selected_options = product.getSelectedMatrixChilds();

            if (selected_options.length === 1) {
                return selected_options[0].get('internalid') + '';
            }
        }

        return product.get('_id') + '';
    }

    // @method renderControl renders the control used in shopping pdp and quickview
    // @param {Backbone.View} view
    renderControl(view_) {
        const utils = this.application.ProductListModule.Utils;
        jQuery(this.placeholder.control).each(function() {
            const view = view_ || (<any>this).application.getLayout().currentView;
            const is_single_list_mode = utils.isSingleList();
            const $container = jQuery(this);
            const product_lists_promise = utils.getProductListsPromise();

            product_lists_promise.done(function() {
                // this control needs a reference to the StoreItem model !
                if (view && view.model && view.model.getPosibleOptions) {
                    let control = null;

                    if (is_single_list_mode) {
                        control = new ProductListControlSingleView({
                            collection: utils.getProductLists(),
                            product: view.model,
                            application: this.application
                        });
                    } else {
                        view.countedClicks = {};

                        control = new ProductListControlView({
                            collection: utils.getProductLists(),
                            product: view.model,
                            application: this.application,
                            isDisabledWishlistButton: !!jQuery(utils.placeholder.control).data(
                                'disabledbutton'
                            ),
                            countedClicks: view.countedClicks
                        });
                    }

                    $container.empty().append(control.$el);
                    control.render();
                }
            });

            if (product_lists_promise.state() === 'pending') {
                $container
                    .empty()
                    .append(
                        '<button class="product-list-control-button-wishlist">' +
                            (is_single_list_mode
                                ? Utils.translate('Loading List...')
                                : Utils.translate('Loading Lists...')) +
                            '</button>'
                    );
            }
        });
    }
};
