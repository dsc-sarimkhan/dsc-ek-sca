/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Subscriptions.AddOn.Review.View"/>
import * as subscriptions_addon_review from 'subscriptions_addon_review.tpl';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import { Loggers } from '../../../Commons/Loggers/JavaScript/Loggers';


import SubscriptionModel = require('./Subscriptions.Model');
import SummaryView = require('./Subscriptions.AddOn.Summary.View');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

const SubscriptionsAddOnReviewView: any = BackboneView.extend({
    template: subscriptions_addon_review,

    events: {
        'click [data-action="submit"]': 'submit'
    },

    title: Utils.translate('Add Subscription Review'),

    page_header: Utils.translate('Add Subscription Review'),

    initialize: function(options) {
        this.subscription = options.subscription;
        this.model = options.model;
    },

    childViews: {
        'Summary.View': function() {
            return new SummaryView({
                model: this.model
            });
        }
    },

    submit: function(e) {
        e.preventDefault();
        const updatedModel = new SubscriptionModel();
        updatedModel.set('internalid', this.subscription.get('internalid'));
        updatedModel.set('quantity', this.model.get('quantity'));
        updatedModel.set('lineNumber', this.model.get('lineNumber'));

        const isOptionalAddOn = this.subscription.hasAddOnByLineNumber(
            updatedModel.get('lineNumber')
        );
        const qtyDifference = this.model.has('initialQuantity')
            ? this.model.get('quantity') - this.model.get('initialQuantity')
            : 0;

        updatedModel.save().done(() => {
            if (qtyDifference !== 0) {
                Loggers.getLogger().info({
                    componentArea: 'SUBSCRIPTIONS_QTY_CHANGED',
                    lineType: this.model.get('chargeType'),
                    qtyChange: qtyDifference > 0 ? 'INCREASED' : 'DECREASED'
                });
            } else if (!isOptionalAddOn) {
                Loggers.getLogger().info({
                    componentArea: 'SUBSCRIPTIONS_ADDON_ADDED',
                    lineType: this.model.get('chargeType')
                });
            }

            Backbone.history.navigate('subscription/' + this.subscription.get('internalid'), true);
        });
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

    getContext: function() {
        const item = this.model.get('item');

        return {
            itemName: item.get('itemId'),
            itemQuantity: this.model.get('quantity'),
            itemPrice: this.model.get('recurringAmount_formatted'),
            itemImage: item.get('imageUrl'),
            itemDescription: item.get('storedetailedDescription'),
            showInfoMessage: this.model.get('isProrated') === true
        };
    }
});

export = SubscriptionsAddOnReviewView;
