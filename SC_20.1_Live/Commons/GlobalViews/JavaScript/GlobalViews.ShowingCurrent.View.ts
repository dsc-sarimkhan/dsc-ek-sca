/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="GlobalViews.ShowingCurrent.View"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended.d.ts" />

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';

import * as global_views_showing_current_tpl from 'global_views_showing_current.tpl';

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

// @class GlobalViews.ShowingCurrent.View @extends Backbone.View
const GlobalViewsShowingCurrentView: any = BackboneView.extend({
    template: global_views_showing_current_tpl,

    _getCurrentPage: function() {
        const BackboneHistory: any = Backbone.History;
        const url_options = Utils.parseUrlOptions(BackboneHistory.fragment);

        return this._getPageFromUrl(url_options.page);
    },

    // @method getPageFromUrl @param {String} url_value @returns {Number}
    _getPageFromUrl: function(url_value) {
        const page_number = parseInt(url_value, 10);

        return !isNaN(page_number) && page_number > 0 ? page_number : 1;
    },

    // @method getContext @return GlobalViews.ShowingCurrent.View.Content
    getContext: function() {
        this.options.current_page = this._getCurrentPage();

        const lastItem = this.options.current_page * this.options.items_per_page;

        // @class GlobalViews.ShowingCurrent.View.Content
        return {
            // @property {String} orderText
            orderText: this.options.order_id
                ? ' ' +
                  Utils.translate(
                      'for <a href="/ordershistory/view/$(0)">  Order Number: #$(1)</a>',
                      this.options.order_id,
                      this.options.order_number
                  )
                : '',
            // @property {String} extraClass
            extraClass: this.options.extraClass,
            // @property {Number} firstItem
            firstItem: (this.options.current_page - 1) * this.options.items_per_page + 1,
            // @property {Number} lastItem
            lastItem: lastItem > this.options.total_items ? this.options.total_items : lastItem,
            // @property {Number} totalItems
            totalItems: this.options.total_items
        };
    }
});

export = GlobalViewsShowingCurrentView;
