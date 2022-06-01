/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="QuickOrder.EmptyCart.View"/>

import * as quick_order_empty_cart_tpl from 'quick_order_empty_cart.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class QuickOrder.EmptyCart.View @extend Backbone.View
const QuickOrderEmptyCartView: any = BackboneView.extend({
    // @property {Function} template
    template: quick_order_empty_cart_tpl
});

export = QuickOrderEmptyCartView;
