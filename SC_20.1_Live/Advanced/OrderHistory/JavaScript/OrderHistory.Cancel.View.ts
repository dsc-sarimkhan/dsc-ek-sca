/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderHistory.Cancel.View"/>
import * as order_history_cancel_tpl from 'order_history_cancel.tpl';
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class ReturnAuthorization.Cancel.View @extend Backbone.Vie
const OrderHistoryCancelview: any = BackboneView.extend({
    template: order_history_cancel_tpl,

    events: {
        'click [data-action="delete"]': 'confirm'
    },

    initialize: function(options): void {
        this.application = options.application;
    },

    confirm: function(): void {
        const recordTypeParam = { recordtype: 'salesorder' };

        this.model.set('status', 'cancelled', { silent: false });
        this.model.save(recordTypeParam).done(
            (result: any): void => {
                this.model.addToCache(result, recordTypeParam);
            }
        );
    },

    // @method getContext @returns OrderHistory.Cancel.View.Context
    getContext: function(): any {
        // @class OrderHistory.Cancel.View.Context
        return {
            // @property {OrderHistory.Model} model
            model: this.model
        };
    }
});

export = OrderHistoryCancelview;
