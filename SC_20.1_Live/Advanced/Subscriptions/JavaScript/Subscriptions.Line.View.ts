/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Subscriptions.Line.View"/>

import * as subscriptions_Line_tpl from 'subscriptions_line.tpl';
import * as Backbone from '../../../Commons/Utilities/JavaScript/backbone.custom';

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

import SubscriptionsStatusView = require('./Subscriptions.Status.View');
import SubscriptionsPricingView = require('./Subscriptions.Pricing.View');

const SubscriptionLineView: any = BackboneView.extend({
    template: subscriptions_Line_tpl,

    events: {
        'click [data-action="change"]': 'goToPDP'
    },

    initialize: function(options) {
        this.subscription = options.subscription;
    },

    goToPDP: function() {
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
        StatusView: function() {
            return new SubscriptionsStatusView({ status: this.model.getStatusLabel() });
        }
    },

    // @method getContext @returns {Overview.Banner.View.Context}
    getContext: function() {
        const item = this.model.get('item');
        const name = item.get('storeDisplayName') || item.get('itemId') || '';
        const quantity = this.model.get('quantity') || Utils.translate('N/A');
        const start_date = this.model.get('startDate');
        const charge_type =
            this.model.get('subscriptionLineTypeObj') &&
            this.model.get('subscriptionLineTypeObj').subscriptionlinetypeText;

        return {
            isPhoneDevice: Utils.isPhoneDevice(),
            name: name,
            // @property {Boolean} quantity
            quantity: quantity,
            // @property {Boolean} start_date
            startDate: start_date,
            // @property {String} subscriptionLineNumber
            subscriptionLineNumber: this.model.get('lineNumber'),
            // @property {number} type
            type: charge_type,
            // @property {Boolean} isChargeTypeUsage
            isChargeTypeUsage: charge_type === 'Usage',
            // @property {Boolean} isLineTypeOptional
            isLineTypeOptional: this.model.get('catalogType') === 'OPTIONAL'
        };
    }
});

export = SubscriptionLineView;
