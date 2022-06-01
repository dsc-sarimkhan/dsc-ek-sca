/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ReturnAuthorization.Cancel.View"/>
// @module ReturnAuthorization

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as return_authorization_cancel_tpl from 'return_authorization_cancel.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class ReturnAuthorization.Cancel.View @extend Backbone.View
const ReturnAuthorizationCancelView: any = BackboneView.extend({
    template: return_authorization_cancel_tpl,

    title: Utils.translate('Cancel Return Request'),

    page_header: Utils.translate('Cancel Return Request'),

    events: {
        'click [data-action="delete"]': 'confirm'
    },

    initialize: function(options) {
        this.application = options.application;
    },

    confirm: function() {
        this.model
            .save({
                status: 'cancelled'
            })
            .then(jQuery.proxy(this, 'dismiss'));
    },

    dismiss: function() {
        this.$containerModal &&
            this.$containerModal
                .removeClass('fade')
                .modal('hide')
                .data('bs.modal', null);
    }
});

export = ReturnAuthorizationCancelView;
