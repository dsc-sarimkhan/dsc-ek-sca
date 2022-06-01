/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ReturnAuthorization.Form.Item.Actions.View"/>
// @module ReturnAuthorization.Form.Item.Actions.View

import * as _ from 'underscore';

import * as return_authorization_form_item_actions_tpl from 'return_authorization_form_item_actions.tpl';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class ReturnAuthorization.Form.Item.Actions.View @extend Backbone.View
const ReturnAuthorizationFormItemActionsView: any = BackboneView.extend({
    template: return_authorization_form_item_actions_tpl,

    initialize: function() {
        this.reasons = _.sortBy(Configuration.get('returnAuthorization.reasons', []), function(
            reason: any
        ) {
            return reason.order;
        });
    },

    // @method getContext @return ReturnAuthorization.Form.Item.Actions.View.Context
    getContext: function() {
        const current_reason = this.model.get('reason') || {};

        this.reasons = _.each(this.reasons, function(reason: any) {
            reason.isSelected = reason.id === current_reason.id;
        });
        // @class ReturnAuthorization.Form.Item.Actions.View.Context
        return {
            // @property {Model} line
            line: this.model,
            // @property {Boolean} isLineActive
            isLineActive: this.model.get('checked'),
            // @property {Boolean} showReasons
            showReasons: !!this.reasons.length,
            // @property {Boolean} isOtherReasonSelected
            isOtherReasonSelected: !!current_reason.isOther,
            // @property {Array<{isSelected:Boolean,reasonText:String}>} reasons
            reasons: this.reasons,
            // @property {String} textReason
            textReason: this.model.get('textReason'),
            // @property {Boolean} activeLinesLengthGreaterThan1
            activeLinesLengthGreaterThan1: this.options.activeLinesLength > 1
        };
    }
});

export = ReturnAuthorizationFormItemActionsView;
