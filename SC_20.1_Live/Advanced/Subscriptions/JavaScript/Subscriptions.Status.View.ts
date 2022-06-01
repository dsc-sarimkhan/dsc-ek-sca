/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Subscriptions.Status.View"/>

import * as _ from 'underscore';

import * as subscriptions_status_tpl from 'subscriptions_status.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class Subscriptions.Status.View @extends Backbone.View
const SubscriptionsStatusView: any = BackboneView.extend({
    template: subscriptions_status_tpl,

    replaceStatusLabel: function(whatTo: string, forTo: string): string {
        return this.options.status.toLowerCase().replace(whatTo, forTo);
    },

    getContext: function() {
        const has_status =
            !_.isUndefined(this.options.status) && !(this.options.status === 'NOT_INCLUDED');
        return {
            cssClass: this.replaceStatusLabel('_', ' '),
            has_status: has_status,
            status: this.replaceStatusLabel('_', '-')
        };
    }
});

export = SubscriptionsStatusView;
