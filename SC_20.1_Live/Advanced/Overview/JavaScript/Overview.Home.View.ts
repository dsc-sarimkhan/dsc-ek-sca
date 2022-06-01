/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Overview.Home.View"/>
// Overview.Home.View.js
// --------------------

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import * as notifications_tpl from 'notifications.tpl';
import * as overview_home_tpl from 'overview_home.tpl';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import GlobalViewsMessageView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Message.View');
import OrderHistoryCollection = require('../../OrderHistory/JavaScript/OrderHistory.Collection');
import OverviewBannerView = require('./Overview.Banner.View');
import OverviewProfileView = require('./Overview.Profile.View');
import OverviewPaymentView = require('./Overview.Payment.View');
import OverviewShippingView = require('./Overview.Shipping.View');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import OrderHistoryListTrackingNumberView = require('../../OrderHistory/JavaScript/OrderHistory.List.Tracking.Number.View');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import RecordViewsView = require('../../RecordViews/JavaScript/RecordViews.View');
import Session = require('../../../Commons/Session/JavaScript/Session');
import Handlebars = require('../../../Commons/Utilities/JavaScript/Handlebars');

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// home page view
const OverviewHomeView: any = BackboneView.extend({
    template: overview_home_tpl,

    title: Utils.translate('Welcome!'),

    attributes: {
        id: 'MyAccountOverview',
        class: 'ProfileHomeView'
    },

    events: {},

    initialize: function(options) {
        this.isSCISIntegrationEnabled = Configuration.get(
            'siteSettings.isSCISIntegrationEnabled',
            false
        );
        this.model = options.model || ProfileModel.getInstance();
        this.collection = options.collection || new OrderHistoryCollection();
        this.application = options.application;

        this.customerSupportURL = Configuration.get('overview.customerSupportURL');

        this.model.on('change', this.showContent, this);

        this.addresses = this.model.get('addresses');

        this.paymentmethods = this.model.get('paymentmethods');

        this.addresses.on('reset destroy change add', this.showContent, this);

        this.paymentmethods.on('reset destroy change add', this.showContent, this);

        if (!notifications_tpl) {
            if (Session.get('email_change_verification', false)) {
                this.email_change_verification = SC.SESSION.email_change_verification;
                delete SC.SESSION.email_change_verification;
            }
        }
    },

    beforeShowContent: function beforeShowContent() {
        const promise = jQuery.Deferred();

        // get latest orders
        this.collection
            .fetch({
                data: {
                    page: 1,
                    order: 1,
                    sort: 'trandate,internalid',
                    results_per_page: Configuration.get('overview.homeRecentOrdersQuantity', 3)
                },
                error: function(model, jqXhr) {
                    // this will stop the ErrorManagment module to process this error
                    // as we are taking care of it
                    jqXhr.preventDefault = true;
                }
            })
            .always(function() {
                promise.resolve();
            });

        return promise;
    },

    // @method getContext @return Overview.Home.View.Context
    getContext: function() {
        const isSCISIntegrationEnabled = Configuration.get(
            'siteSettings.isSCISIntegrationEnabled',
            false
        );

        // @class Overview.Home.View.Context
        return {
            // @property {Boolean} collectionLengthGreaterThan0
            collectionLengthGreaterThan0: this.collection.length > 0,
            // @property {Boolean} hasCustomerSupportURL
            hasCustomerSupportURL: !!this.customerSupportURL,
            // @property {String} customerSupportURL
            customerSupportURL: this.customerSupportURL,
            // @property {String} firstName
            firstName: this.model.get('firstname') || this.model.get('name') || '',
            // @property {Boolean} isSCISIntegrationEnabled
            isSCISIntegrationEnabled: this.isSCISIntegrationEnabled,
            // @property {Boolean} purchasesPermissions
            purchasesPermissions: isSCISIntegrationEnabled
                ? 'transactions.tranFind.1,transactions.tranPurchases.1'
                : 'transactions.tranFind.1,transactions.tranSalesOrd.1'
        };
    },

    childViews: {
        'Overview.Banner': function() {
            return new OverviewBannerView();
        },

        'Overview.Profile': function() {
            return new OverviewProfileView({ model: this.model });
        },

        'Overview.Payment': function() {
            return new OverviewPaymentView({ model: this.defaultPaymentMethod });
        },

        'Overview.Shipping': function() {
            return new OverviewShippingView({ model: this.defaultShippingAddress });
        },
        'Overview.Messages': function() {
            if (this.email_change_verification) {
                return new GlobalViewsMessageView({
                    message:
                        this.email_change_verification === 'true'
                            ? Utils.translate(
                                  'Your email has been changed successfully to <strong>'
                              ) +
                              this.model.get('email') +
                              '</strong>'
                            : this.email_change_verification,
                    type: this.email_change_verification === 'true' ? 'success' : 'error',
                    closable: true
                });
            }
        },
        'Order.History.Results': function() {
            const self = this;
            const records_collection = new Backbone.Collection(
                this.collection.map(function(order) {
                    let dynamic_column;

                    if (self.isSCISIntegrationEnabled) {
                        dynamic_column = {
                            label: Utils.translate('Origin:'),
                            type: 'origin',
                            name: 'origin',
                            value: (<any>_.findWhere(
                                Configuration.get('transactionRecordOriginMapping'),
                                {
                                    origin: order.get('origin')
                                }
                            )).name
                        };
                    } else {
                        dynamic_column = {
                            label: Utils.translate('Status:'),
                            type: 'status',
                            name: 'status',
                            value: order.get('status').name
                        };
                    }

                    const columns = [
                        {
                            label: Utils.translate('Date:'),
                            type: 'date',
                            name: 'date',
                            value: order.get('trandate')
                        },
                        {
                            label: Utils.translate('Amount:'),
                            type: 'currency',
                            name: 'amount',
                            value: order.get('amount_formatted')
                        },
                        {
                            type: 'tracking-number',
                            name: 'trackingNumber',
                            compositeKey: 'OrderHistoryListTrackingNumberView',
                            composite: new OrderHistoryListTrackingNumberView({
                                model: new Backbone.Model({
                                    trackingNumbers: order.get('trackingnumbers')
                                }),
                                showContentOnEmpty: true,
                                contentClass: '',
                                collapseElements: true
                            })
                        }
                    ];

                    columns.splice(2, 0, dynamic_column);

                    const model = new Backbone.Model({
                        title: new Handlebars.SafeString(
                            Utils.translate('<span class="tranid">$(0)</span>', order.get('tranid'))
                        ),
                        touchpoint: 'customercenter',
                        detailsURL:
                            '/purchases/view/' +
                            order.get('recordtype') +
                            '/' +
                            order.get('internalid'),
                        recordType: order.get('recordtype'),
                        id: order.get('internalid'),
                        internalid: order.get('internalid'),
                        trackingNumbers: order.get('trackingnumbers'),
                        columns: columns
                    });

                    return model;
                })
            );

            return new BackboneCollectionView({
                childView: RecordViewsView,
                collection: records_collection,
                viewsPerRow: 1
            });
        }
    },

    destroy: function() {
        this.addresses.off(null, null, this);
        this.paymentmethods.off(null, null, this);

        this.offEventsOfDefaults();

        this._destroy();
    },

    offEventsOfDefaults: function() {
        this.defaultPaymentMethod && this.defaultPaymentMethod.off(null, null, this);
        this.defaultShippingAddress && this.defaultShippingAddress.off(null, null, this);
    },

    getSelectedMenu: function() {
        return 'home';
    },

    getBreadcrumbPages: function() {
        return [];
    },

    showContent: function() {
        // off events of defaults
        this.offEventsOfDefaults();

        // set the defaults
        this.defaultShippingAddress = this.addresses.findWhere({ defaultshipping: 'T' });
        this.defaultPaymentMethod = this.paymentmethods.findWhere({ ccdefault: 'T' });

        // on events of defaults
        this.defaultShippingAddress &&
            this.defaultShippingAddress.on('change', this.showContent, this);
        this.defaultPaymentMethod && this.defaultPaymentMethod.on('change', this.showContent, this);

        this.title = this.model.get('firstname')
            ? Utils.translate('Welcome $(0)!', this.model.get('firstname'))
            : this.title;
        return this.application.getLayout().showContent(this);
    }
});

export = OverviewHomeView;
