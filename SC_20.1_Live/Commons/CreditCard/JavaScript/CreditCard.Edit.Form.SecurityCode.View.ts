/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CreditCard.Edit.Form.SecurityCode.View"/>
// @module CreditCard

import '../../Utilities/JavaScript/SC.Configuration';

import * as creditcard_edit_form_securitycode_tpl from 'creditcard_edit_form_securitycode.tpl';

import CreditCardEditFormSecurityCodeTooltipView = require('./CreditCard.Edit.Form.SecurityCode.Tooltip.View');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

const CreditCardEditFormSecurityCodeView: any = BackboneView.extend({
    template: creditcard_edit_form_securitycode_tpl,

    render: function() {
        this._render();

        const ccv_tooltip_view = new CreditCardEditFormSecurityCodeTooltipView();

        ccv_tooltip_view.render();

        const placeholder = this.$el.find('[data-toggle="popover"]');
        placeholder.attr('data-content', ccv_tooltip_view.$el.html());
    },

    // @method getContext @return CreditCard.Edit.Form.SecurityCode.View.Context
    getContext: function() {
        // @class CreditCard.Edit.Form.SecurityCode.View.Context
        return {
            // @property {Boolean} showCreditCardHelp
            showCreditCardHelp: this.options.showCreditCardHelp,
            // @property {String} creditCardHelpTitle
            creditCardHelpTitle: this.options.creditCardHelpTitle,
            // @property {Boolean} showError
            showError: !!this.options.error,
            // @property {String} errorMessage
            errorMessage: this.options.error ? this.options.error.errorMessage : '',
            // @property {Number} value
            value: this.options.value
        };
    }
});

export = CreditCardEditFormSecurityCodeView;
