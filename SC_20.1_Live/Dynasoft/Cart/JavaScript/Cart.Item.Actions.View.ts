/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Cart.Item.Actions.View"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as cart_item_actions_tpl from 'cart_item_actions.tpl';

import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import Configuration = require('../../../Commons/Utilities/JavaScript/SC.Configuration');

// @class Cart.Item.Actions.View @extend Backbone.View
export = BackboneView.extend({
    template: cart_item_actions_tpl,

    initialize: function() {
        this.application = this.options.application;
        BackboneCompositeView.add(this);
    },

    // @method getContext @return Cart.Item.Actions.View.Context
    getContext: function() {
        // @class Cart.Item.Actions.View.Context
        return {
            // @property {Model} line
            line: this.model,
            // @property {Item.Model} item
            item: this.model.get('item'),
            // @property {String} editUrl
            editUrl: Utils.addParamsToUrl(this.model.generateURL(), {
                source: 'cart',
                internalid: this.model.get('internalid')
            }),
            // @property {Boolean} isAdvanced
            isAdvanced: Configuration.siteSettings.sitetype !== 'STANDARD',
            // @property {Boolean} showSaveForLateButton
            showSaveForLateButton:
                this.application.ProductListModule &&
                this.application.ProductListModule.Utils.isProductListEnabled() &&
                Configuration.currentTouchpoint === 'home',
            // @property {String} lineId
            lineId: this.model.get('internalid'),
            // @property {Boolean} showQuantity
            showQuantity: this.model.get('item').get('_itemType') === 'GiftCert'
        };
        // @class Cart.Item.Actions.View
    }
});
