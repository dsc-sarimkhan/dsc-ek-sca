/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Subscriptions"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import SubscriptionsListView = require('./Subscriptions.List.View');
import SubscriptionsDetailsView = require('./Subscriptions.Details.View');
import SubscriptionsAddOnCollectionView = require('./Subscriptions.AddOn.List.View');
import SubscriptionsAddOnDetailsView = require('./Subscriptions.AddOn.Details.View');
import SubscriptionsAddOnReviewView = require('./Subscriptions.AddOn.Review.View');

// @class Subscriptions @extends ApplicationModule
const Subscriptions: any = {
    // @property {MenuItem} MenuItems
    MenuItems: [
        function(application) {
            if (this.showFeature()) {
                return {
                    id: 'subscriptions',
                    name: Utils.translate('Subscriptions'),
                    url: 'subscriptions-list',
                    index: 0
                };
            }
        }
    ],

    // @method showFeature
    showFeature: function(): boolean {
        return (
            SC &&
            SC.ENVIRONMENT &&
            SC.ENVIRONMENT.subscriptions &&
            SC.ENVIRONMENT.permissions.lists.listSubscriptions !== 0
        );
    },

    // @method mountToApp
    mountToApp: function(application) {
        if (!this.showFeature()) {
            return;
        }
        const pageType = application.getComponent('PageType');

        pageType.registerPageType({
            name: 'Subscription',
            routes: ['subscriptions-list'],
            view: SubscriptionsListView,
            defaultTemplate: {
                name: 'subscriptions_list.tpl',
                displayName: 'Subscriptions',
                thumbnail: Utils.getAbsoluteUrl('img/default-layout-transaction-list.png')
            }
        });
        pageType.registerPageType({
            name: 'SubscriptionDetail',
            routes: ['subscription/:id'],
            view: SubscriptionsDetailsView,
            defaultTemplate: {
                name: 'subscriptions_details.tpl',
                displayName: 'Subscription details default',
                thumbnail: Utils.getAbsoluteUrl('img/default-layout-purchase-detail.png')
            }
        });
        pageType.registerPageType({
            name: 'SubscriptionsAddOnsMarketPlace',
            routes: ['subscription/:id/addons'],
            view: SubscriptionsAddOnCollectionView,
            defaultTemplate: {
                name: 'subscriptions_addons.tpl',
                displayName: 'Add-Ons MarketPlace',
                thumbnail: Utils.getAbsoluteUrl('img/default-layout-purchase-detail.png')
            }
        });
        pageType.registerPageType({
            name: 'SubscriptionAdOnDetail',
            routes: ['subscription-addon-details/:subscriptionid/:subscriptionlineid'],
            view: SubscriptionsAddOnDetailsView,
            defaultTemplate: {
                name: 'subscriptions_addon_details.tpl',
                displayName: 'Subscription details default',
                thumbnail: Utils.getAbsoluteUrl('img/default-layout-purchase-detail.png')
            }
        });
        pageType.registerPageType({
            name: 'SubscriptionAdOnReview',
            routes: ['subscription-addon-details-review/:subscriptionid/:subscriptionlineid'],
            view: SubscriptionsAddOnReviewView,
            defaultTemplate: {
                name: 'subscriptions_addon_review.tpl',
                displayName: 'Subscription AddOn Review',
                thumbnail: Utils.getAbsoluteUrl('img/default-layout-purchase-detail.png')
            }
        });
    }
};

export = Subscriptions;
