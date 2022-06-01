/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Cart.Promocode.List.Item.View"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';

import * as cart_promocode_list_item_tpl from 'cart_promocode_list_item.tpl';

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// @class Cart.Promocode.List.Item.View @extend Backbone.View
export = BackboneView.extend({
    // @property {Function} template
    template: cart_promocode_list_item_tpl,

    // @method getContext
    // @return {Cart.Promocode.List.Item.View.Context}
    getContext: function getContext() {
        let code = this.model.get('code');
        let internalid = this.model.get('internalid');
        const hide_autoapply_promo = !_.isUndefined(this.model.get('isautoapplied'))
            ? this.model.get('applicabilityreason') === 'DISCARDED_BEST_OFFER' ||
              (this.model.get('isautoapplied') &&
                  this.model.get('applicabilitystatus') === 'NOT_APPLIED')
            : false;
        let errormsg = '';

        if (this.options.source === 'item_summary') {
            code = this.model.get('promotion_couponcode');
            internalid = this.model.get('promotion_id');
        }

        if (this.model.get('errormsg')) {
            errormsg = this.model.get('errormsg');
        } else if (this.model.get('applicabilityreason') === 'NO_FREE_GIFTS_ADDED') {
            errormsg = Utils.translate(
                "Sorry, something went wrong. We couldn't add your gift to the order."
            );
        }

        // @class Cart.Promocode.List.Item.View.Context
        return {
            // @property {Boolean} showPromo
            showPromo: !!code && !hide_autoapply_promo,
            // @property {String} code
            code: code,
            // @property {String} internalid
            internalid: internalid,
            // @property {Boolean} isEditable
            isEditable: !this.options.isReadOnly && this.model.get('isautoapplied') === false,
            // @property {Boolean} showDiscountRate
            showDiscountRate: !!this.model.get('discountrate_formatted'),
            // @property {String} discountRate
            discountRate: this.model.get('discountrate_formatted'),
            // @property {Boolean} showWarning
            showWarning:
                this.model.get('isvalid') === false ||
                this.model.get('applicabilitystatus') === 'NOT_APPLIED',
            // @property {String} errorMessage
            errorMessage: errormsg
        };
        // @class Cart.Promocode.List.Item.View
    }
});

// @class Cart.Promocode.List.Item.View.Initialize.Options
// @property {Backbone.Model<{code:String,internalid:String}>} model
// @property {Boolean?} isReadOnly
