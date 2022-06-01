/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Subscriptions.AddOn.List.View"/>
// @module Subscriptions

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as backbone_collection_view_row_tpl from 'backbone_collection_view_row.tpl';

import * as subscriptions_addons from 'subscriptions_addons.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import SubscriptionsModel = require('./Subscriptions.Model');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');

import SubscriptionsAddOnView = require('./Subscriptions.AddOn.View');
import AjaxRequestsKiller = require('../../../Commons/AjaxRequestsKiller/JavaScript/AjaxRequestsKiller');

const SubscriptionsAddOnListView = BackboneView.extend({
    template: subscriptions_addons,

    title: Utils.translate('My Subscriptions'),

    page_header: Utils.translate('My Subscriptions'),

    attributes: {
        id: 'Subscriptions',
        class: 'Subscriptions'
    },

    initialize: function(options) {},

    beforeShowContent: function beforeShowContent() {
        if (!this.options.subscription) {
            this.subscription = new SubscriptionsModel({
                internalid: this.options.routerArguments[0]
            });
            const fetch = this.subscription
                .fetch({ killerId: AjaxRequestsKiller.getKillerId() })
                .done(() => {
                    this.collection = this.subscription.get('nonIncludedLinesCollection');
                    this.collection.add(this.subscription.get('optionalSubscriptionLines').models);
                    this.collection = _.sortBy(this.collection.models, (model: any) =>
                        model.getStatusLabel()
                    );
                });

            return fetch;
        }
        this.subscription = this.options.subscription;
        this.collection = this.subscription.get('nonIncludedLinesCollection');
        return jQuery.Deferred().resolve();
    },

    // @method getSelectedMenu @return {String}
    getSelectedMenu: function() {
        return 'subscriptions';
    },
    // @method getBreadcrumbPages
    getBreadcrumbPages: function() {
        return [
            {
                text: this.title,
                href: '/subscriptions-list'
            },
            {
                text: this.subscription.get('name'),
                href: `subscription/${this.subscription.get('internalid')}`
            },
            {
                text: Utils.translate('Add-ons'),
                href: `subscription/${this.subscription.get('internalid')}/addons`
            }
        ];
    },

    childViews: {
        'Facets.Items': function() {
            return new BackboneCollectionView({
                childView: SubscriptionsAddOnView,
                childViewOptions: {
                    application: this.options.application,
                    subscription: this.subscription
                },
                viewsPerRow: Utils.isPhoneDevice() ? 2 : 3,
                collection: this.collection,
                rowTemplate: backbone_collection_view_row_tpl
            });
        }
    },

    // @method getContext @return {Subscriptions.AddOn.List.View.Context}
    getContext: function() {
        // @class Subscriptions.AddOn.List.View.Context
        return {
            //  @property {String} pageHeader
            pageHeader: this.subscription.get('name')
        };
    }
});

export = SubscriptionsAddOnListView;
