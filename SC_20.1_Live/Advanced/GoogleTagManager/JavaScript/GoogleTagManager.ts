/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="GoogleTagManager"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />
/// <reference path="./WindowExtended.d.ts" />

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import Tracker = require('../../../Commons/Tracker/JavaScript/Tracker');
import GoogleTagManagerNavigationHelper = require('./GoogleTagManager.NavigationHelper.Plugins.Standard');
import GoogleTagManagerModel = require('./GoogleTagManager.Model');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import Cookies = require('../../../Commons/Utilities/JavaScript/js.cookie');

// @module GoogleTagManager
// jshint laxcomma:true
// @class GoogleTagManager @extends ApplicationModule Loads Google Tag Manager scripts

const win: any = window;
const GoogleTagManager: any = {
    tracking_product_list: false,
    data_layer_loaded: false,
    data_layer_loading: false,
    // @method doCallback Indicates if this module does a callback after some particular events
    // @return {Boolean}
    // ie: when you do a log-in, we need to track that event before we navigate to the new
    // page, otherwise the track of the event could be aborted. We have a special case in
    // which this doesn't work, for exampmle, if a browser extension blocks the Analytics
    // tracking but not GTM, the log-in callback is never excecuted
    doCallback: function() {
        return !!win.google_tag_manager;
    },

    // @method trackPageview
    // @param {String} url
    // @return {GoogleTagManager}
    trackPageview: function(url) {
        if (_.isString(url)) {
            const eventName = 'pageView';
            const eventData = {
                event: eventName,
                data: {
                    page: url
                }
            };

            // Triggers a Backbone.Event so others can subscribe to this event and add/replace
            // data before is send it to Google Tag Manager
            Tracker.trigger(eventName, eventData, url);
            this.pushData(eventData);
        }

        return this;
    },

    // @method trackHomePageview
    // @param {String} url
    // @return {GoogleTagManager}
    trackHomePageview: function(url) {
        if (_.isString(url)) {
            const eventName = 'homeView';
            const eventData = {
                event: eventName,
                data: {
                    page: url
                }
            };

            // Triggers a Backbone.Event so others can subscribe to this event and add/replace
            // data before is send it to Google Tag Manager
            Tracker.trigger(eventName, eventData, url);
            this.pushData(eventData);
        }

        return this;
    },

    // @method trackPageviewForCart
    // @param {String} url
    // @return {GoogleTagManager}
    trackPageviewForCart: function(data) {
        if (_.isString(data.url)) {
            const eventName = 'cartView';
            const eventData = {
                event: eventName,
                data: {
                    page: data.url,
                    currencyCode: SC.ENVIRONMENT.currencyCodeSpecifiedOnUrl,
                    total: data.total || '',
                    items: []
                }
            };

            if (data.items && data.items.length) {
                data.items.each(function(item) {
                    eventData.data.items.push({
                        sku: item.get('item').get('itemid'),
                        id: item.get('item').get('itemid'),
                        title: item.get('item').get('displayname'),
                        price: item.get('rate_formatted'),
                        quantity: item.get('quantity'),
                        image:
                            (item.get('item').get('itemimages_detail').urls &&
                                item.get('item').get('itemimages_detail').urls.length &&
                                item.get('item').get('itemimages_detail').urls[0].url) ||
                            ''
                    });
                });
            }

            // Triggers a Backbone.Event so others can subscribe to this event and add/replace data
            // before is send it to Google Tag Manager
            Tracker.trigger(eventName, eventData, data.url);
            this.pushData(eventData);
        }

        return this;
    },

    // @method trackPageviewForCheckoutStep
    // @param {Number} step
    // @return {GoogleTagManager}
    trackPageviewForCheckoutStep: function(step) {
        const eventName = 'checkoutView';
        const eventData = {
            event: eventName,
            ecommerce: {
                checkout: {
                    actionField: { step: step }
                }
            }
        };

        // Triggers a Backbone.Event so others can subscribe to this event and add/replace data
        // before is send it to Google Tag Manager
        Tracker.trigger(eventName, eventData);
        this.pushData(eventData);

        return this;
    },

    // @method trackNonEcomemercePageView
    // @param {String} url
    // @return {GoogleTagManager}
    trackNonEcomemercePageView: function(url) {
        if (_.isString(url)) {
            const eventName = 'nonEcommercePageView';
            const eventData = {
                event: eventName,
                data: {
                    page: url
                }
            };

            // Triggers a Backbone.Event so others can subscribe to this event and add/replace data
            // before is send it to Google Tag Manager
            Tracker.trigger(eventName, eventData, url);
            this.pushData(eventData);
        }

        return this;
    },

    // @method trackEvent Track this actions: guest-checkout, sign-in, create-account, Reorder,
    // add-to-cart, place-order, wishlist, proceed-to-checkout, payment-selection
    // @param {TrackEvent} event
    // @return {GoogleTagManager}
    trackEvent: function(event) {
        if (event && event.category && event.action) {
            const eventName = event.name || 'action';
            const eventData = {
                event: eventName,
                data: {
                    category: event.category,
                    action: event.action,
                    label: event.page || '/' + (<any>Backbone.history).fragment,
                    value: event.value || ''
                },
                eventCallback: event.callback
            };

            // Triggers a Backbone.Event so others can subscribe to this event and add/replace data
            // before is send it to Google Tag Manager
            Tracker.trigger(eventName, eventData, event);
            this.pushData(eventData);
        }

        return this;
    },

    // @method trackProceedToCheckout
    // @return {Void}
    trackProceedToCheckout: function(callback) {
        const event = {
            name: 'proceedToCheckout',
            category: 'Checkout - User Interaction',
            action: 'Proceed To Checkout',
            callback: callback
        };
        this.trackEvent(event);
    },

    // @method trackLogin
    // @return {Void}
    trackLogin: function(event) {
        const eventData = {
            name: 'login',
            category: event.category,
            action: event.action,
            callback: event.callback
        };
        this.trackEvent(eventData);
    },

    // @method trackCheckoutAsGuest
    // @return {Void}
    trackCheckoutAsGuest: function(event) {
        const eventData = {
            name: 'checkoutAsGuest',
            category: event.category,
            action: event.action,
            callback: event.callback
        };
        this.trackEvent(eventData);
    },

    // @method trackSelectedPayment
    // @param {String} payment
    // @return {Void}
    trackSelectedPayment: function(payment) {
        const event = {
            name: 'selectPayment',
            category: 'Checkout - User Interaction',
            action: 'Select Payment Method',
            value: payment
        };
        this.trackEvent(event);
    },

    // @method trackRegister
    // @return {Void}
    trackRegister: function(event) {
        const eventData = {
            name: 'register',
            category: event.category,
            action: event.action,
            callback: event.callback
        };
        this.trackEvent(eventData);
    },

    // @method trackAddToCart
    // @param {Transaction.Line.Model} line
    // @return {GoogleTagManager}
    trackAddToCart: function(line) {
        if (line) {
            const selected_options = line.get('options').filter(function(option) {
                return option.get('value') && option.get('value').label;
            });

            const item = line.get('item');
            const eventName = 'addToCart';
            const eventData = {
                event: eventName,
                ecommerce: {
                    currencyCode: SC.ENVIRONMENT.currencyCodeSpecifiedOnUrl,
                    add: {
                        products: [
                            {
                                sku: item.get('itemid'),
                                id: item.get('itemid'),
                                name: item.get('_name'),
                                price: item.get('_priceDetails').onlinecustomerprice,
                                variant: _.map(selected_options, function(option: any) {
                                    return option.get('value').label;
                                }).join(', '),
                                category: this.getCategory(),
                                quantity: line.get('quantity')
                            }
                        ]
                    }
                }
            };
            // Triggers a Backbone.Event so others can subscribe to this event and add/replace
            // data before is send it to Google Tag Manager
            Tracker.trigger(eventName, eventData, line);
            this.pushData(eventData);
        }
        return this;
    },

    trackCartUpdate: function(items) {
        if (items.length) {
            const eventName = 'cartItemsUpdate';
            const eventData = {
                event: eventName,
                data: {
                    items: []
                }
            };
            items.each(function(line: any) {
                const item = line.get('item');
                eventData.data.items.push({
                    name: item.get('_name'),
                    sku: item.get('itemid'),
                    id: item.get('itemid'),
                    price: line.get('rate'),
                    amount: line.get('amount'),
                    variant: _.map(line.get('options').toJSON(), function(option: any) {
                        return !!option.value && option.value.label;
                    }).join(', '),
                    quantity: line.get('quantity')
                });
            });
            // Triggers a Backbone.Event so others can subscribe to this event and add/replace
            // data before is send it to Google Tag Manager
            Tracker.trigger(eventName, eventData, items);
            this.pushData(eventData);
        }
        return this;
    },
    // @method trackAddToWishlist
    // @param {Transaction.Line.Model} line
    // @return {GoogleTagManager}
    trackAddToWishlist: function(line) {
        if (line) {
            const item = line.get('item');
            const eventName = 'addToWishlist';
            const eventData = {
                event: eventName,
                data: {
                    action: 'Add To Wishlist',
                    currencyCode: SC.ENVIRONMENT.currencyCodeSpecifiedOnUrl,
                    sku: item.get('itemid'),
                    id: item.get('itemid'),
                    name: item.get('_name'),
                    price: item.get('_priceDetails').onlinecustomerprice,
                    category: 'Shopping - User Interaction',
                    item_category: this.getCategory()
                }
            };
            // Triggers a Backbone.Event so others can subscribe to this event and add/replace
            // data before is send it to Google Tag Manager
            Tracker.trigger(eventName, eventData, line);
            this.pushData(eventData);
        }
        return this;
    },

    // @method trackTransaction
    // https://support.google.com/tagmanager/answer/6106097?hl=en
    // @param {Tracker.Transaction.Model} @extends Backbone.Model transaction
    // @class Tracker.Transaction.Model
    // @property {String} confirmationNumber
    // @property {Number} subTotal
    // @property {Number} total
    // @property {Number} taxTotal
    // @property {Number} shippingCost
    // @property {Number} handlingCost
    // @property {Array<{Tracker.Transaction.Items.Model}>} products
    // @class Tracker.Transaction.Line.Model
    // @property {String} sku
    // @property {String} name
    // @property {String} category
    // @property {Number} rate
    // @property {Number} quantity
    // @property {String} variant
    // @class Tracker.Transaction.Model
    // @class GoogleTagManager
    // @return {GoogleTagManager}
    trackTransaction: function(transaction) {
        const self = this;
        const eventName = 'transaction';
        const eventData = {
            event: eventName,
            ecommerce: {
                purchase: {
                    actionField: {
                        id: transaction.get('confirmationNumber'),
                        affiliation: '',
                        revenue:
                            transaction.get('subTotal') +
                            transaction.get('taxTotal') +
                            transaction.get('shippingCost') +
                            transaction.get('handlingCost'),
                        currency: SC.ENVIRONMENT.currencyCodeSpecifiedOnUrl,
                        subtotal: transaction.get('subTotal'),
                        tax: transaction.get('taxTotal'),
                        shipping: transaction.get('shippingCost') + transaction.get('handlingCost'),
                        coupon: []
                    },
                    products: []
                }
            }
        };

        _.each(transaction.get('promocodes'), function(promo: any) {
            eventData.ecommerce.purchase.actionField.coupon.push(promo.code);
        });

        transaction.get('products').each(function(product) {
            const result = self.findCategoryAndListInDataLayer(product);

            eventData.ecommerce.purchase.products.push({
                name: product.get('name'),
                sku: product.get('id'),
                id: product.get('id'),
                price: product.get('rate'),
                category: result ? result.category || '' : '',
                variant: product.get('options'),
                quantity: product.get('quantity')
            });
        });

        // Triggers a Backbone.Event so others can subscribe to this event and add/replace data before is send it to Google Tag Manager
        Tracker.trigger(eventName, eventData, transaction);
        this.pushData(eventData);

        return this;
    },

    findCategoryAndListInDataLayer: function(product) {
        if (SC.ENVIRONMENT.GTM_DATALAYER && SC.ENVIRONMENT.GTM_DATALAYER.events) {
            const dataLayer = SC.ENVIRONMENT.GTM_DATALAYER.events;
            const productSku =
                (product.get('item') && product.get('item').get('_sku')) || product.get('id');
            if (productSku) {
                const productClick = _.find(dataLayer, function(obj: any) {
                    return (
                        obj.event === 'productClick' &&
                        obj.ecommerce &&
                        obj.ecommerce.click &&
                        obj.ecommerce.click.products &&
                        productSku.indexOf(obj.ecommerce.click.products[0].id) === 0
                    );
                });

                return {
                    category:
                        (productClick && productClick.ecommerce.click.products[0].category) || '',
                    list: (productClick && productClick.ecommerce.click.actionField.list) || ''
                };
            }
        }
    },

    // @method trackProductList
    // @param {Backbone.Collection} items
    // @param {String} listName
    // @return {GoogleTagManager}
    trackProductList: function(items, listName) {
        return this.trackProductListGeneric('productList', items, listName);
    },

    // @method trackProductListEvent
    // @param {Backbone.Collection} items
    // @param {String} listName
    // @return {GoogleTagManager}
    trackProductListEvent: function(items, listName) {
        return this.trackProductListGeneric('productListEvent', items, listName);
    },

    // @method trackProductListGeneric
    // @param eventName string
    // @param {Backbone.Collection} items
    // @param {String} listName
    // @return {GoogleTagManager}
    trackProductListGeneric: function(eventName, items, listName) {
        if (this.tracking_product_list) {
            this.resetTracker();
        }

        this.tracking_product_list = true;
        const self = this;
        const eventData = {
            event: eventName,
            ecommerce: {
                currencyCode: SC.ENVIRONMENT.currencyCodeSpecifiedOnUrl,
                impressions: []
            },
            page: this.getCategory(),
            list: listName,
            label: listName
        };

        _.each(items.models, function(item: any, index) {
            // We set this properties in the item so we can print them on the html, to later be read them by the trackProductClick event
            item.set('track_productlist_position', index + 1);
            item.set('track_productlist_category', self.getCategory());
            item.set('track_productlist_list', listName);

            eventData.ecommerce.impressions.push({
                name: item.get('_name'),
                sku: item.get('_sku', true),
                id: item.get('_sku', true),
                price: (item.get('_price') && item.get('_price').toFixed(2)) || 0.0,
                list: item.get('track_productlist_list'),
                position: item.get('track_productlist_position'),
                category: item.get('track_productlist_category')
            });
        });

        // Triggers a Backbone.Event so others can subscribe to this event and add/replace data before is send it to Google Tag Manager
        Tracker.trigger(eventName, eventData, items);
        this.pushData(eventData);

        this.resetTracker();

        this.tracking_product_list = false;

        return this;
    },

    // @method trackSearchResults
    // @param {Backbone.Collection} items
    // @param {String} keyword
    // @return {GoogleTagManager}
    trackSearchResults: function(items, keyword) {
        const self = this;
        const eventData = {
            event: 'searchResults',
            data: {
                currencyCode: SC.ENVIRONMENT.currencyCodeSpecifiedOnUrl,
                page: this.getCategory(),
                list: 'searchResults',
                label: 'searchResults',
                items: [],
                keywords: keyword
            }
        };

        _.each(items.models, function(item: any, index) {
            eventData.data.items.push({
                name: item.get('_name'),
                sku: item.get('_sku', true),
                id: item.get('_sku', true),
                price: (item.get('_price') && item.get('_price').toFixed(2)) || 0.0,
                list: 'searchResults',
                position: index + 1,
                category: self.getCategory()
            });
        });

        // Triggers a Backbone.Event so others can subscribe to this event and add/replace data before is send it to Google Tag Manager
        Tracker.trigger('searchResults', eventData, items);
        this.pushData(eventData);

        return this;
    },

    // @method trackProductClick
    // @param {Object} item
    // @return {GoogleTagManager}
    trackProductClick: function(item) {
        const eventName = 'productClick';
        const eventData = {
            event: eventName,
            ecommerce: {
                click: {
                    actionField: { list: item.get('list') },
                    products: [
                        {
                            name: item.get('name'),
                            price: item.get('price'),
                            sku: item.get('sku', true),
                            id: item.get('sku', true),
                            category: item.get('category'),
                            position: item.get('position')
                        }
                    ]
                }
            }
        };

        // We set this item in this Tracker to later be read it by the trackProductView event
        this.item = item;
        // Triggers a Backbone.Event so others can subscribe to this event and add/replace data before is send it to Google Tag Manager
        this.pushData(eventData);
        Tracker.trigger(eventName, eventData, item);

        return this;
    },

    // @method trackProductView
    // @param {Product.Model} product
    // @return {GoogleTagManager}
    trackProductView: function(product) {
        const item = product.getItem();

        if (this.item && this.item.get('itemId') === item.get('_id')) {
            item.set('category', this.item.get('category'), { silent: true });
            item.set('list', this.item.get('list'), { silent: true });
        }

        const eventName = 'productView';
        const selected_options = product.get('options').filter(function(option) {
            return option.get('value') && option.get('value').label;
        });
        const price = product.getPrice();
        const result = this.findCategoryAndListInDataLayer(product);
        const eventData = {
            event: eventName,
            ecommerce: {
                detail: {
                    actionField: {
                        list: item.get('list') || (result ? result.list : '')
                    },
                    products: [
                        {
                            name: item.get('_name'),
                            sku: product.getSku(),
                            id: product.getSku(),
                            category: item.get('category') || (result ? result.category : ''), // as we do not support categories this is just the url
                            variant: _.map(selected_options, function(option: any) {
                                return option.get('value').label;
                            }).join(', '),
                            price: (price.price ? price.price : 0).toFixed(2)
                        }
                    ]
                }
            },
            page: this.getCategory()
        };

        this.item = null;

        // Triggers a Backbone.Event so others can subscribe to this event and add/replace data before is send it to Google Tag Manager
        Tracker.trigger(eventName, eventData, item);
        this.pushData(eventData);

        return this;
    },

    // @method resetTracker Cleans all dataLayer values
    // @return {Void}
    resetTracker: function() {
        if (win.google_tag_manager) {
            win.google_tag_manager[this.configuration.id].dataLayer.reset();
        } else {
            win[this.configuration.dataLayerName].push({
                event: 'dataLayerReset',
                data: undefined,
                eventCallback: undefined
            });
        }
    },

    // @method pushData
    // @param {Object} data
    // @return {Void}
    pushData: function(data) {
        const data_layer = win[this.configuration.dataLayerName];

        this.win = win;

        this.debouncedData = this.debouncedData || [];

        data_layer.push(data);
        this.debouncedData.push(data);

        if (!this.data_layer_loaded) {
            this.loadDataLayerRecord(win);
        } else {
            if (!this.saveEvent) {
                this.saveEvent = _.debounce(
                    _.bind(function() {
                        this.model.saveEvent(this.debouncedData);
                        this.debouncedData = null;
                    }, this),
                    200
                );
            }
            this.saveEvent();
        }
    },

    // @method getCategory
    // @return {String}
    getCategory: function() {
        const options = Utils.parseUrlOptions((<any>Backbone.history).fragment);
        const page = options.page || '';

        return '/' + (<any>Backbone.history).fragment.split('?')[0] + (page ? '?page=' + page : '');
    },

    // @method addCrossDomainParameters
    // [Decorating HTML Links](https://developers.google.com/analytics/devgiddes/collection/analyticsjs/cross-domain#decoratelinks)
    // @param {string} url
    // @return {String} url
    addCrossDomainParameters: function(url) {
        // We only need to add the parameters if the URL we are trying to go
        // is not a sub domain of the tracking domain
        if (_.isString(url)) {
            win.ga(function(tracker) {
                win.linker = win.linker || new win.gaplugins.Linker(tracker || win.ga.getAll()[0]);
                const track_url = win.linker.decorate(url);

                // This validation is due to Tracking Blockers overriding the default analytics methods
                if (typeof track_url === 'string') {
                    url = track_url;
                }
            });
        }

        return url;
    },

    // @method loadScript
    // @return {jQuery.Promise|Void}
    loadScript: function() {
        return jQuery.getScript(
            '//www.googletagmanager.com/gtm.js?id=' +
                this.configuration.id +
                '&l=' +
                this.configuration.dataLayerName
        );
    },

    loadDataLayerRecord: function(win) {
        if (!this.data_layer_loading && !this.data_layer_loaded) {
            const self = this;
            let gid = win.ga && win.ga.getAll && win.ga.getAll()[0].get('_gid');

            this.data_layer_loading = true;

            if (!gid && Cookies.get('_gid')) {
                gid = Cookies.get('_gid')
                    .split('.')
                    .slice(2, 4)
                    .join('.');
            }

            if (gid) {
                this.model
                    .getDataLayer({
                        id: gid,
                        events: win[this.configuration.dataLayerName]
                    })
                    .done(function() {
                        self.data_layer_loaded = true;
                    });
            } else {
                this.data_layer_loading = false;
            }
        }
    },
    // @method mountToApp
    // @param {ApplicationSkeleton} application
    // @return {Void}
    mountToApp: function(application) {
        this.configuration = Configuration.get('tracking.googleTagManager');

        if (!this.configuration || !this.configuration.id || SC.isPageGenerator()) return;

        this.configuration.dataLayerName = this.configuration.dataLayerName || 'dataLayer';

        win[this.configuration.dataLayerName] = [];

        const layout = application.getLayout();

        // Install Standard Navigation Plugins
        layout.mouseDown.install({
            name: 'googleTagManagerStandardNavigation',
            priority: 20,
            execute: function(e) {
                return GoogleTagManagerNavigationHelper.mouseDownNavigation(layout, e);
            }
        });

        this.model = new GoogleTagManagerModel();

        win[this.configuration.dataLayerName].push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js'
        });

        // Please keep this statement here or the first pageView on site load
        // will not be triggered (ApplicationSkeleton.Layout._showContent)
        Tracker.getInstance().trackers.push(GoogleTagManager);

        // the analytics script is only loaded if we are on a browser
        application.getLayout().once('afterAppendView', function() {
            GoogleTagManager.loadScript().fail(function(jqXhr) {
                jqXhr.preventDefault = true;
                console.warn('Google Tag Manager was unable to load');
            });
        });
    }
};

export = GoogleTagManager;
