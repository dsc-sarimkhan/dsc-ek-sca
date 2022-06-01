/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ReorderItems.List.View"/>
import * as _ from 'underscore';
import * as reorder_items_list_tpl from 'reorder_items_list.tpl';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import ListHeaderView = require('../../../Commons/ListHeader/JavaScript/ListHeader.View');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import GlobalViewsPaginationView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Pagination.View');
import GlobalViewsShowingCurrentView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.ShowingCurrent.View');
import GlobalViewsMessageView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Message.View');
import ReorderItemsCollection = require('./ReorderItems.Collection');
import ReorderItemsActionsQuantityView = require('./ReorderItems.Actions.Quantity.View');
import ReorderItemsActionsAddToCartView = require('./ReorderItems.Actions.AddToCart.View');
import Tracker = require('../../../Commons/Tracker/JavaScript/Tracker');
import LiveOrderModel = require('../../../Commons/LiveOrder/JavaScript/LiveOrder.Model');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import TransactionLineViewsCellActionableView = require('../../../Commons/Transaction.Line.Views/JavaScript/Transaction.Line.Views.Cell.Actionable.View');
import ErrorManagement = require('../../../Commons/ErrorManagement/JavaScript/ErrorManagement');
import Handlebars = require('../../../Commons/Utilities/JavaScript/Handlebars');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class ReorderItems.List.View @extends Backbone.View
const ReorderItemsListView: any = BackboneView.extend({
    // @propery {Function} template
    template: reorder_items_list_tpl,
    // @propery {String} className
    className: 'OrderItemReorderListView',
    // @propery {String} title
    title: Utils.translate('Reorder Items'),
    // @propery {String} page_header
    page_header: Utils.translate('Reorder Items'),
    // @propery {Object} attributes
    attributes: {
        id: 'ReorderHistory',
        class: 'OrderItemReorderListView'
    },
    // @propery {Object} events
    events: {
        'click [data-action="add-to-cart"]': 'addToCart',
        'change [name="item_quantity"]': 'updateQuantity'
    },
    // @method initialize
    initialize: function(options) {
        this.application = options.application;
        this.collection = new ReorderItemsCollection();
        let routerOptions;
        if (options.routerArguments && options.routerArguments[0]) {
            routerOptions = Utils.parseUrlOptions(options.routerArguments[0]);
        } else {
            routerOptions = { page: 1 };
        }
        this.options.showCurrentPage = true;

        if (routerOptions.order_id) {
            this.collection.order_id = routerOptions.order_id;
            this.order_id = routerOptions.order_id;
            this.order_number = routerOptions.order_number || 0;
        }

        this.listenCollection();

        // manges sorting and filtering of the collection
        this.listHeader = new ListHeaderView({
            view: this,
            application: options.application,
            collection: this.collection,
            filters: routerOptions.order_id ? null : this.filterOptions,
            sorts: routerOptions.order_id ? this.sortOptionsSingleOrder : this.sortOptions,
            hidePagination: true,
            headerMarkup: routerOptions.order_id ? this.getOrderLink() : ''
        });
        if (this.order_id) {
            this.collection.set({
                order_id: this.order_id
            });
        }
        this.collection.on('reset', this.render, this);
    },

    // @method updateQuantity
    updateQuantity: function(e) {
        const target = jQuery(e.currentTarget);
        const line_id = target.data('line-id');
        const line = this.collection.get(line_id);
        const item = line.get('item');
        const min_quantity = item.get('_minimumQuantity', true) || 1;
        const max_quantity = item.get('_maximumQuantity', true) || null;

        const new_value = parseInt(<any>target.val(), 10);
        if (new_value < min_quantity) {
            target.val(min_quantity);
        }

        if (max_quantity && new_value > max_quantity) {
            target.val(max_quantity);
        }

        line.set('quantity', new_value);
    },

    // @method getOrderLink
    getOrderLink: function() {
        const order_link = jQuery('<a/>')
            .attr('href', '/ordershistory/view/' + this.order_id)
            .html(Utils.translate('Order Number: $(0)', this.order_id))
            .wrap('<div></div>')
            .parent();

        return new Handlebars.SafeString(order_link.html());
    },
    // @method listenCollection
    listenCollection: function() {
        this.setLoading(true);

        this.collection.on({
            request: jQuery.proxy(this, 'setLoading', true),
            reset: jQuery.proxy(this, 'setLoading', false)
        });
    },
    // @method setLoading
    setLoading: function(value) {
        this.isLoading = value;
    },

    // @method getSelectedMenu
    getSelectedMenu: function() {
        return 'reorderitems';
    },
    // @method getBreadcrumbPages
    getBreadcrumbPages: function() {
        const crumbtrail = [
            {
                text: this.title,
                href: '/reorderItems'
            }
        ];

        if (this.order_id && this.order_number) {
            this.title = Utils.translate('Reorder Items from Order #$(0)', this.order_number);
            crumbtrail.push({
                text: Utils.translate('Order #$(0)', this.order_number),
                href: '/reorderItems/order/' + this.order_id
            });
        }

        return crumbtrail;
    },

    // @method trackEventReorder
    trackEventReorder: function(line) {
        line &&
            Tracker.getInstance().trackEvent({
                category: 'My Account - User Interaction',
                action: 'Reorder',
                label: line.generateURL()
            });
    },

    // @method addToCart add to cart an item, the quantity is written by the user on the input and the options are the same that the ordered item in the previous order
    addToCart: function(e) {
        e.preventDefault();

        const self = this;
        const line_id = this.$(e.target).data('line-id');
        const $form = this.$(e.target).closest('[data-type="order-item"]');
        const $quantity = $form.find('input[name=item_quantity]');
        const selected_line = this.collection.get(line_id);
        const $alert_placeholder = $form.find('[data-type=alert-placeholder]');
        const quantity = isNaN(parseInt($quantity.val(), 10)) ? 0 : parseInt($quantity.val(), 10);

        if (quantity) {
            selected_line.set('quantity', quantity);

            // The 'fulfillmentChoice' for reorders must be setted to 'ship'
            if (selected_line.get('fulfillmentChoice')) {
                selected_line.set('fulfillmentChoice', 'ship');
            }

            LiveOrderModel.getInstance()
                .addLine(selected_line)
                .done(function() {
                    self.trackEventReorder(selected_line);

                    $alert_placeholder.show().empty();

                    let message;

                    if (quantity > 1) {
                        message = Utils.translate(
                            '$(0) Items successfully added to <a href="#" data-touchpoint="viewcart">your cart</a><br/>',
                            quantity
                        );
                    } else {
                        message = Utils.translate(
                            'Item successfully added to <a href="#" data-touchpoint="viewcart">your cart</a><br/>'
                        );
                    }

                    message = new GlobalViewsMessageView({
                        message: message,
                        type: 'success',
                        closable: true
                    }).render().$el;

                    $alert_placeholder.html(message);

                    setTimeout(function() {
                        $alert_placeholder.fadeOut(function() {
                            $alert_placeholder.empty();
                        });
                    }, 6000);
                })
                .fail(function(jqXhr) {
                    jqXhr.preventDefault = true;

                    const message = new GlobalViewsMessageView({
                        message: ErrorManagement.parseErrorMessage(
                            jqXhr,
                            self.application.getLayout().errorMessageKeys
                        ),
                        type: 'error',
                        closable: true
                    }).render().$el;

                    $alert_placeholder
                        .show()
                        .empty()
                        .html(message);
                });
        } else {
            const message = new GlobalViewsMessageView({
                message: Utils.translate('The number of items must be positive.'),
                type: 'error',
                closable: true
            }).render().$el;

            $alert_placeholder
                .show()
                .empty()
                .html(message);
        }
    },

    // @method getStringDateFromDaysCount Returns a date substracting the amound of days specified from now
    getStringDateFromDaysCount: function(days_back) {
        const now = new Date();
        return new Date(now.setDate(now.getDate() - days_back));
    },
    // @method {Array} sortOptionsSingleOrder
    sortOptionsSingleOrder: [
        {
            value: 'price',
            name: Utils.translate('By Price'),
            selected: true
        },
        {
            value: 'name',
            name: Utils.translate('By Name')
        }
    ],
    // @method {Array} sortOptions
    sortOptions: [
        {
            value: 'quantity',
            name: Utils.translate('By Frequently Purchased'),
            selected: true
        },
        {
            value: 'date',
            name: Utils.translate('By Most Recently Purchased')
        },
        {
            value: 'price',
            name: Utils.translate('By Price')
        },
        {
            value: 'name',
            name: Utils.translate('By Name')
        }
    ],
    // @method {Array} filterOptions
    filterOptions: [
        {
            value: function() {
                return (
                    Utils.dateToString(this.getStringDateFromDaysCount(15)) +
                    'T' +
                    Utils.dateToString(new Date())
                );
            },
            name: Utils.translate('Show last 15 days'),
            className: 'reorder-items-filter-last-15-days',
            selected: true
        },
        {
            value: function() {
                return (
                    Utils.dateToString(this.getStringDateFromDaysCount(30)) +
                    'T' +
                    Utils.dateToString(new Date())
                );
            },
            name: Utils.translate('Show last 30 days'),
            className: 'reorder-items-filter-last-30-days'
        },
        {
            value: function() {
                return (
                    Utils.dateToString(this.getStringDateFromDaysCount(60)) +
                    'T' +
                    Utils.dateToString(new Date())
                );
            },
            name: Utils.translate('Show last 60 days'),
            className: 'reorder-items-filter-last-60-days'
        },
        {
            value: function() {
                return (
                    Utils.dateToString(this.getStringDateFromDaysCount(90)) +
                    'T' +
                    Utils.dateToString(new Date())
                );
            },
            name: Utils.translate('Show last 90 days'),
            className: 'reorder-items-filter-last-90-days'
        },
        {
            value: function() {
                return (
                    Utils.dateToString(this.getStringDateFromDaysCount(180)) +
                    'T' +
                    Utils.dateToString(new Date())
                );
            },
            name: Utils.translate('Show last 180 days'),
            className: 'reorder-items-filter-last-180-days'
        }
    ],
    // @property {Object} childViews
    childViews: {
        ListHeader: function() {
            return this.listHeader;
        },
        'GlobalViews.Pagination': function() {
            return new GlobalViewsPaginationView(
                _.extend(
                    {
                        totalPages: Math.ceil(
                            this.collection.totalRecordsFound / this.collection.recordsPerPage
                        )
                    },
                    Configuration.defaultPaginationSettings
                )
            );
        },
        'GlobalViews.ShowCurrentPage': function() {
            return new GlobalViewsShowingCurrentView({
                items_per_page: this.collection.recordsPerPage,
                total_items: this.collection.totalRecordsFound,
                total_pages: Math.ceil(
                    this.collection.totalRecordsFound / this.collection.recordsPerPage
                )
            });
        },
        'Reorder.Items': function() {
            const view = new BackboneCollectionView({
                collection: this.collection.filter(function(line) {
                    return line.get('item').get('_id');
                }),
                viewsPerRow: 1,
                childView: TransactionLineViewsCellActionableView,
                childViewOptions: {
                    application: this.application,
                    navigable: true,
                    SummaryView: ReorderItemsActionsQuantityView,
                    ActionsView: ReorderItemsActionsAddToCartView,
                    showComparePrice: true
                }
            });

            this.collection.on('reset', function() {
                view.render();
            });

            return view;
        }
    },
    // @method getContext: function()
    getContext: function() {
        // @class ReorderItems.List.View.Context
        return {
            // @propery {Boolean} isLoading
            isLoading: this.isLoading,
            // @propery {Boolean} showItems
            showItems: !!this.collection.totalRecordsFound,
            // @propery {Boolean} itemsNotFound
            itemsNotFound: !this.collection.totalRecordsFound && !this.isLoading,
            // @propery {String} pageHeader
            pageHeader: this.page_header,
            // @property {Boolean} showPagination
            showPagination: !!(this.collection.totalRecordsFound && this.collection.recordsPerPage),
            // @property {Boolean} showCurrentPage
            showCurrentPage: this.options.showCurrentPage,
            // @property {Boolean} showBackToAccount
            showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD'
        };
    }
});

export = ReorderItemsListView;
