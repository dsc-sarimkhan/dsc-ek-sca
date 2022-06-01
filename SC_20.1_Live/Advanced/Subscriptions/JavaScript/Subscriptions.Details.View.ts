/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Subscriptions.Details.View"/>

import * as _ from 'underscore';
import * as subscriptions_details_tpl from 'subscriptions_details.tpl';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import { Loggers } from '../../../Commons/Loggers/JavaScript/Loggers';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import SubscriptionsModel = require('./Subscriptions.Model');
import SubscriptionLinesView = require('./Subscriptions.Line.View');
import AjaxRequestsKiller = require('../../../Commons/AjaxRequestsKiller/JavaScript/AjaxRequestsKiller');
import GlobalViewsConfirmationView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Confirmation.View');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

import SubscriptionsStatusView = require('./Subscriptions.Status.View');

const SubscriptionsDetailsView: any = BackboneView.extend({
    template: subscriptions_details_tpl,

    title: Utils.translate('My Subscriptions'),

    page_header: Utils.translate('My Subscriptions'),

    events: {
        'click [data-action="goToAddOnsMarket"]': 'goToAddOnsMarket',
        'click [data-action="cancel-subscription"]': 'cancel',
        'click [data-action="reactivate-subscription"]': 'reactivate'
    },

    attributes: {
        id: 'Subscriptions',
        class: 'Subscriptions'
    },

    initialize: function(options) {
        this.application = options.application;
        this.options = options;
    },

    beforeShowContent: function beforeShowContent() {
        this.model = new SubscriptionsModel({ internalid: this.options.routerArguments[0] });
        return this.model.fetch({
            killerId: AjaxRequestsKiller.getKillerId()
        });
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
                text: this.model.get('name'),
                href: `subscription/${this.model.get('internalid')}`
            }
        ];
    },

    goToAddOnsMarket: function() {
        const subscription_id = this.model.get('internalid');
        Backbone.history.navigate(`subscription/${subscription_id}/addons`, {
            trigger: true
        });
    },
    // @property {Object} childViews
    childViews: {
        StatusView: function() {
            return new SubscriptionsStatusView({ status: this.model.getStatusLabel('status') });
        },

        'Optional.Lines.Collection': function() {
            return new BackboneCollectionView({
                childView: SubscriptionLinesView,
                viewsPerRow: 1,
                collection: this.model.get('optionalSubscriptionLines'),
                childViewOptions: _.extend(this.options, {
                    subscription: this.model
                })
            });
        },
        'Required.Lines.Collection': function() {
            return new BackboneCollectionView({
                childView: SubscriptionLinesView,
                viewsPerRow: 1,
                collection: this.model.get('requiredSubscriptionLines'),
                childViewOptions: _.extend(this.options, {
                    subscription: this.model
                })
            });
        }
    },
    cancel: function(e) {
        e.preventDefault();
        const deleteConfirmationView = new GlobalViewsConfirmationView({
            callBack: this._cancelSubscription,
            callBackParameters: {
                context: this
            },
            title: Utils.translate('Suspend Subscription'),
            body: Utils.translate('Are you sure you want to suspend your subscription?'),
            autohide: true
        });
        return this.application.getLayout().showInModal(deleteConfirmationView);
    },
    _cancelSubscription: function(options) {
        options.context.model.destroy().done(function() {
            const componentArea =
                Configuration.get('subscriptions.generalStatusChange') ===
                'Allow Suspending / Resuming'
                    ? 'SUBSCRIPTIONS_PAUSED'
                    : 'SUBSCRIPTIONS_CANCELED';

            const params = {
                componentArea: componentArea
            };
            Loggers.getLogger().info(params);
            Backbone.history.navigate(
                'subscription/' + options.context.model.get('internalid'),
                true
            );
        });
    },
    reactivate: function(e) {
        e.preventDefault();
        const deleteConfirmationView = new GlobalViewsConfirmationView({
            callBack: this._reactivateSubscription,
            callBackParameters: {
                context: this
            },
            title: Utils.translate('Reactivate Subscription'),
            body: Utils.translate('Please, confirm you want to reactivate this subscription'),
            autohide: true
        });
        return this.application.getLayout().showInModal(deleteConfirmationView);
    },
    _reactivateSubscription: function(options) {
        options.context.model.save().done(function() {
            const params = {
                componentArea: 'SUBSCRIPTIONS_RESUMED'
            };
            Loggers.getLogger().info(params);
            Backbone.history.navigate(
                'subscription/' + options.context.model.get('internalid'),
                true
            );
        });
    },
    // @method getContext @return {Subscriptions.Details.View.Context}
    getContext: function() {
        // @class Subscriptions.List.View.Context
        const subscriptionplan_name = this.model.get('name') || '';
        const end_date = this.model.get('endDate') || Utils.translate('N/A');

        return {
            // @property {String} name
            name: subscriptionplan_name,
            // @property {Boolean} isOptionalLinesCountGreaterThan0
            isOptionalLinesCountGreaterThan0:
                this.model.get('optionalSubscriptionLines').length > 0,
            // @property {Boolean} isRequiredLinesCountGreaterThan0
            isRequiredLinesCountGreaterThan0:
                this.model.get('requiredSubscriptionLines').length > 0,
            // @property {Boolean} isNonIncludedLinesCountGreaterThan0
            isNonIncludedLinesCountGreaterThan0:
                this.model.get('nonIncludedLinesCollection').length > 0,
            // @property {String} internalId
            internalId: this.model.get('internalid'),
            // @property {Boolean) hasNextBillCycleDate
            hasNextBillCycleDate: !!this.model.get('nextBillCycleDate'),
            // @property {String} nextBillCycleDate
            nextBillCycleDate: this.model.get('nextBillCycleDate'),
            // @property {Boolean} hasLastBillDate
            hasLastBillDate: !!this.model.get('lastBillDate'),
            // @property {String} lastBillDate
            lastBillDate: this.model.get('lastBillDate'),
            // @property {Boolean} hasStartDate
            hasStartDate: !!this.model.get('startDate'),
            // @property {String} startDate
            startDate: this.model.get('startDate'),
            // @property {String} endDate
            endDate: end_date,
            // @property {Boolean} canBeSuspended
            canBeSuspended: this.model.get('canBeSuspended'),
            // @property {Boolean} canBeReactivated
            canBeReactivated: this.model.get('canBeReactivated'),
            // @property {Boolean} hasNextRenewalStartDate
            hasNextRenewalStartDate: !!this.model.get('nextRenewalStartDate'),
            // @property {String} nextRenewalStartDate
            nextRenewalStartDate: this.model.get('nextRenewalStartDate')
        };
    }
});

export = SubscriptionsDetailsView;
