/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Subscriptions.AddOn.View"/>
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as subscriptions_addon_item from 'subscriptions_addon_item_cell.tpl';

import * as Backbone from '../../../Commons/Utilities/JavaScript/backbone.custom';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import UtilitiesResizeImage = require('../../../Commons/Utilities/JavaScript/Utilities.ResizeImage');

import SubscriptionsStatusView = require('./Subscriptions.Status.View');
import SubscriptionsPricingView = require('./Subscriptions.Pricing.View');

const SubscriptionsAddOnView: any = BackboneView.extend({
    template: subscriptions_addon_item,

    title: Utils.translate('My Subscriptions'),

    page_header: Utils.translate('My Subscriptions'),

    events: {
        'click [data-action="add"]': 'addLine'
    },

    initialize: function(options) {
        this.subscription = options.subscription;
    },

    addLine: function(e) {
        e.preventDefault();
        const subscription_id = this.subscription.get('internalid');
        const line_id = this.model.get('internalId');
        Backbone.history.navigate(`subscription-addon-details/${subscription_id}/${line_id}`, {
            trigger: true
        });
    },

    childViews: {
        'Pricing.View': function() {
            return new SubscriptionsPricingView({ model: this.model });
        },
        'Status.View': function() {
            return new SubscriptionsStatusView({ status: this.model.getStatusLabel() });
        }
    },

    getContext: function() {
        const item = this.model.get('item');

        return {
            image: UtilitiesResizeImage(item.get('imageUrl'), 'thumbnail'),
            title: item.get('storeDisplayName') || item.get('itemId') || '',
            item_id: item.get('itemId') || '',
            lineNumber: this.model.get('lineNumber'),
            price: this.model.getDefaultOfferStr(),
            briefDescription: Utils.parseRichText(
                this.model.get('item').get('storedetailedDescription')
            )
        };
    }
});

export = SubscriptionsAddOnView;
