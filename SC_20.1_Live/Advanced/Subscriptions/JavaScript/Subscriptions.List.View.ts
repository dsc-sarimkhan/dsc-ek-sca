/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Subscriptions.List.View"/>
// @module Subscriptions

import * as _ from 'underscore';
import { Loggers } from '../../../Commons/Loggers/JavaScript/Loggers';

import { SubscriptionsCollection, SubscriptionBillingAccount } from './Subscriptions.Collection';
import * as subscriptions_list_tpl from 'subscriptions_list.tpl';

import ListHeaderView = require('../../../Commons/ListHeader/JavaScript/ListHeader.View');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import RecordViewsView = require('../../RecordViews/JavaScript/RecordViews.View');

import GlobalViewsPaginationView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Pagination.View');

import Handlebars = require('../../../Commons/Utilities/JavaScript/Handlebars');
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import Utils = require('../../../Commons/Utilities/JavaScript/Utils');


import SubscriptionsStatusView = require('./Subscriptions.Status.View');

interface BillingAccount {
    name: string;
    value: string | number;
}

const SubscriptionsListView = BackboneView.extend({
    template: subscriptions_list_tpl,

    title: Utils.translate('My Subscriptions'),

    page_header: Utils.translate('My Subscriptions'),

    attributes: {
        id: 'Subscriptions',
        class: 'Subscriptions'
    },

    initialize: function(options) {
        this.application = options.application;
        this.collection = new SubscriptionsCollection();
        this.collection_billing_accounts = new SubscriptionsCollection();
        this.profileModel = ProfileModel.getInstance();
        this.isPhoneDevice = Utils.isPhoneDevice();

        this.listenCollection();
        this.collection.on('reset', this.showContent, this);

        let page = 1;

        if (options.routerArguments && options.routerArguments[0]) {
            const params = Utils.parseUrlOptions(options.routerArguments[0]);

            if (params.page) {
                page = Number(params.page);
            }
        }
        this.options.page = page;

        this.listHeader = new ListHeaderView({
            view: this,
            application: this.application,
            collection: this.collection,
            hidePagination: true
        });
    },

    beforeShowContent: function beforeShowContent() {
        const promise = jQuery.Deferred();
        const loggersActionId = Loggers.getLogger().start('SUBSCRIPTIONS_LIST');

        this.collection_billing_accounts
            .fetch({
                data: { billingAccounts: true },
                error: function(model, jqXhr) {
                    // this will stop the ErrorManagment module to process this error
                    // as we are taking care of it
                    jqXhr.preventDefault = true;
                }
            })
            .done(function(): void {
                Loggers.getLogger().end(loggersActionId);
            })
            .always(function(): void {
                promise.resolve();
            });

        return promise;
    },

    // @method listenCollection
    listenCollection: function() {
        this.setLoading(true);
        this.collection.on({
            request: jQuery.proxy(this, 'setLoading', true),
            reset: jQuery.proxy(this, 'setLoading', false)
        });
        this.collection.on('reset', this.render, this);
    },

    // @method setLoading @param {Boolean} bool
    setLoading: function(bool) {
        this.isLoading = bool;
    },

    // @method getSelectedMenu @return {String}
    getSelectedMenu: function() {
        return 'subscriptions';
    },
    // @method getBreadcrumbPages
    getBreadcrumbPages: function() {
        return {
            text: this.title,
            href: '/Subscriptions'
        };
    },
    // @property {Array} filterOptions Array of default
    // filter options filters always apply on the original collection
    filterOptions: function(): BillingAccount[] {
        const billing_accounts_filter: BillingAccount[] = [
            {
                value: 'all',
                name: Utils.translate('Show All Billing Accounts')
            }
        ];

        (this.collection_billing_accounts.billingAccounts || []).forEach(
            (billing_account: SubscriptionBillingAccount) => {
                billing_accounts_filter.push({
                    value: billing_account.internalId,
                    name: billing_account.name
                });
            }
        );

        return billing_accounts_filter;
    },

    childViews: {
        'ListHeader.View': function() {
            this.listHeader.filters = this.filterOptions();
            return this.listHeader;
        },
        'Records.Collection': function() {
            const records_collection = new Backbone.Collection(
                this.collection.map(function(subscription) {
                    const model = new Backbone.Model({
                        touchpoint: 'customercenter',
                        title: new Handlebars.SafeString(
                            Utils.translate(
                                '<span class="subscriptionid">$(0)</span>',
                                subscription.get('name')
                            )
                        ),
                        detailsURL: subscription.getTypeUrl(),

                        columns: [
                            {
                                label: Utils.translate('Activation:'),
                                type: 'date',
                                name: 'datecreated',
                                value: subscription.get('startDate')
                            },
                            {
                                label: Utils.translate('Last Bill:'),
                                type: 'date',
                                name: 'lastbill',
                                value: !subscription.get('lastBillDate')
                                    ? '-'
                                    : subscription.get('lastBillDate')
                            },
                            {
                                label: Utils.translate('Next Bill:'),
                                type: 'date',
                                name: 'nextbill',
                                value:
                                    subscription.get('status') === 'ACTIVE' &&
                                    subscription.get('nextBillCycleDate')
                                        ? subscription.get('nextBillCycleDate')
                                        : '-'
                            },
                            {
                                label: Utils.translate('Renewal:'),
                                type: 'date',
                                name: 'renewal',
                                value:
                                    subscription.get('status') === 'ACTIVE' &&
                                    subscription.get('nextRenewalStartDate')
                                        ? subscription.get('nextRenewalStartDate')
                                        : '-'
                            },
                            {
                                type: 'status',
                                name: 'status',
                                compositeKey: 'SubscriptionsStatusView',
                                composite: new SubscriptionsStatusView({
                                    status: subscription.getStatusLabel('status')
                                })
                            }
                        ]
                    });

                    model.id = subscription.get('internalId');

                    return model;
                })
            );

            return new BackboneCollectionView({
                childView: RecordViewsView,
                collection: records_collection,
                viewsPerRow: 1
            });
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
        }
    },

    // @method getContext @return {Subscriptions.List.View.Context}
    getContext: function() {
        // @class Subscriptions.List.View.Context
        return {
            isPhoneDevice: this.isPhoneDevice,
            // @property {String} pageHeader
            pageHeader: this.page_header,
            // @property {Boolean} showNoTermMessage
            hasTerms: !!this.profileModel.get('paymentterms'),
            // @property {Boolean} isThereAnyResult
            isThereAnyResult: !!this.collection.length,
            // @property {Boolean} isLoading
            isLoading: this.isLoading,
            // @property {Boolean} showPagination
            showPagination: !!(
                this.collection.totalRecordsFound &&
                this.collection.recordsPerPage &&
                this.collection.length > 0
            ),
            // @property {Boolean} showCurrentPage
            showCurrentPage: this.options.showCurrentPage,
            // @property {Boolean} showBackToAccount
            showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD'
        };
    }
});

export = SubscriptionsListView;
