/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Deposit.Details.DepositApplication.Link.View"/>

import * as deposit_details_deposit_application_link_tpl from 'deposit_details_deposit_application_link.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class Deposit.Details.DepositApplication.Link.View @extend Backbone.View
const DepositDetailsDepositApplicationLinkView: any = BackboneView.extend({
    template: deposit_details_deposit_application_link_tpl,

    events: {
        'click [data-action="go-to-deposit-application"]': 'goToDepositApplication'
    },

    goToDepositApplication: function(e) {
        e.stopPropagation();
    },
    // @method getContext @return Deposit.Details.DepositApplication.Link.View.Context
    getContext: function() {
        // @class Deposit.Details.DepositApplication.Link.View.Context
        return {
            // @property {String} depositApplicationId
            depositApplicationId: this.model.get('depositId'),
            // @property {String} depositApplicationTitle
            depositApplicationDate: this.model.get('depositDate')
        };
    }
});

export = DepositDetailsDepositApplicationLinkView;
