/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderHistory.ReturnAutorization.View"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as order_history_return_authorization_tpl from 'order_history_return_authorization.tpl';

import TransactionLineViewsCellNavigableView = require('../../../Commons/Transaction.Line.Views/JavaScript/Transaction.Line.Views.Cell.Navigable.View');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class OrderHistory.ReturnAutorization.View @extend Backbone.View
const OrderHistoryReturnAutorizationView: any = BackboneView.extend({
    // @property {Function} template
    template: order_history_return_authorization_tpl,
    // @property {Object} childViews
    childViews: {
        'Items.Collection': function() {
            return new BackboneCollectionView({
                collection: this.model.get('lines'),
                childView: TransactionLineViewsCellNavigableView,
                viewsPerRow: 1,
                childViewOptions: {
                    navigable: this.options.navigable,

                    detail1Title: Utils.translate('Qty:'),
                    detail1: 'quantity',

                    detail3Title: Utils.translate('Amount:'),
                    detail3: 'amount_formatted'
                }
            });
        }
    },

    // @method getContext @return OrderHistory.ReturnAutorization.View.Context
    getContext: function() {
        // @class OrderHistory.ReturnAutorization.View.Context
        return {
            // @property {Model} model
            model: this.model,
            // @property {Boolean} showLink
            showLink: !!this.model.get('tranid')
        };
    }
});

export = OrderHistoryReturnAutorizationView;
