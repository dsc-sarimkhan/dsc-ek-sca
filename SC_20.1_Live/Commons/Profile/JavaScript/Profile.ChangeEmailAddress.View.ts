/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Profile.ChangeEmailAddress.View"/>
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as profile_change_email_tpl from 'profile_change_email.tpl';

import GlobalViewsMessageView = require('../../GlobalViews/JavaScript/GlobalViews.Message.View');

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');
import BackboneFormView = require('../../Backbone.FormView/JavaScript/Backbone.FormView');

// @class Profile.ChangeEmailAddress.View @extends Backbone.View
const ProfileChangeEmailAddress: any = BackboneView.extend({
    template: profile_change_email_tpl,

    page_header: Utils.translate('Change Email'),

    title: Utils.translate('Change Email'),

    events: {
        'submit form': 'saveFormCustom'
    },

    bindings: {
        '[name="current_password"]': 'current_password',
        '[name="new_email"]': 'new_email',
        '[name="confirm_email"]': 'confirm_email'
    },

    initialize: function() {
        BackboneView.prototype.initialize.apply(this, arguments);
        BackboneFormView.add(this);
    },

    saveFormCustom: function() {
        this.new_email = this.$('[name="new_email"]').val();
        BackboneFormView.saveForm.apply(this, arguments);
    },

    showSuccess: function(placeholder) {
        const global_view_message = new GlobalViewsMessageView({
            message:
                Utils.translate('A confirmation email has been sent to <strong>') +
                this.new_email +
                '</strong>',
            type: 'success',
            closable: true
        });

        placeholder.html(global_view_message.render().$el.html());
    }
});

export = ProfileChangeEmailAddress;
