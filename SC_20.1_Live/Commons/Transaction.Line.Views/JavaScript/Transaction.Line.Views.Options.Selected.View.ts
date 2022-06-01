/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Transaction.Line.Views.Options.Selected.View"/>

import * as transaction_line_views_options_selected_tpl from 'transaction_line_views_options_selected.tpl';

import BackboneCollectionView = require('../../Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');
import TransactionLineViewsOptionView = require('./Transaction.Line.Views.Option.View');

const TransactionLineViewsOptionsSelectedView: any = BackboneView.extend({
    // @property {Function} template
    template: transaction_line_views_options_selected_tpl,

    // @method initialize Override default method to made current view composite
    // @param {ItemOptions.Options.View.initialize} options
    // @return {Void}
    initialize: function() {},

    // @property {ChildViews} childViews
    childViews: {
        'Options.Collection': function() {
            return new BackboneCollectionView({
                collection: this.model.getVisibleOptions(),
                childView: TransactionLineViewsOptionView,
                viewsPerRow: 1,
                childViewOptions: {
                    line: this.model,
                    templateName: 'selected'
                }
            });
        }
    },

    // @method getContext
    // @return {ItemOptions.Options.View.Context}
    getContext: function() {
        // @class ItemOptions.Options.View.Context
        return {
            model: this.model
        };
        // @class ItemOptions.Options.View
    }
});

export = TransactionLineViewsOptionsSelectedView;
