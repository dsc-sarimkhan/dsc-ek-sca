/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Profile.UpdatePassword.View"/>
import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as profile_update_password_tpl from 'profile_update_password.tpl';

import GlobalViewsMessageView = require('../../GlobalViews/JavaScript/GlobalViews.Message.View');
import BackboneFormView = require('../../Backbone.FormView/JavaScript/Backbone.FormView');
import Configuration = require('../../../Advanced/SCA/JavaScript/SC.Configuration');
import ProfileModel = require('./Profile.Model');
import UpdatePasswordModel = require('./Profile.UpdatePassword.Model');

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// @class Profile.UpdatePassword.View @extends Backbone.View
const ProfileUpdatePasswordView: any = BackboneView.extend({
    template: profile_update_password_tpl,

    page_header: Utils.translate('Update Your Password'),

    title: Utils.translate('Update Your Password'),

    attributes: {
        id: 'PasswordUpdate',
        class: 'ProfileUpdateYourPasswordView'
    },

    events: {
        'submit form': 'saveForm',
        'change form:has([data-action="reset"])': 'toggleReset',
        'keyup form:has([data-action="reset"])': 'toggleReset',
        'click [data-action="reset"]': 'resetForm'
    },

    bindings: {
        '[name="current_password"]': 'current_password',
        '[name="password"]': 'password',
        '[name="confirm_password"]': 'confirm_password'
    },

    initialize: function() {
        this.model = new UpdatePasswordModel({});

        // merge the profile model into the UpdatePasswordModel
        this.model.set(ProfileModel.getInstance().attributes);
        this.model.on('saveCompleted', _.bind(this.resetForm, this));
        BackboneFormView.add(this);
        this.useLayoutError = true;
        this.model.on('save', this.showSuccess, this);
    },

    resetForm: function(event) {
        this.model.unset('current_password');
        this.model.unset('password');
        this.model.unset('confirm_password');

        event && event.preventDefault();
    },

    showSuccess: function() {
        if (this.$savingForm) {
            const global_view_message = new GlobalViewsMessageView({
                message: Utils.translate('Password successfully updated!'),
                type: 'success',
                closable: true
            });

            this.$('[data-type="alert-placeholder"]').html(global_view_message.render().$el.html());
        }
    },

    // @method getSelectedMenu
    getSelectedMenu: function() {
        return 'updateyourpassword';
    },
    // @method getBreadcrumbPages
    getBreadcrumbPages: function() {
        return {
            text: this.title,
            href: '/updateyourpassword'
        };
    },

    // @method getContext @return Profile.UpdatePassword.View.Context
    getContext: function() {
        // @class Profile.UpdatePassword.View.Context
        return {
            // @property {String} pageHeader
            pageHeader: this.page_header,
            // @property {Boolean} showBackToAccount
            showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD'
        };
    }
});

export = ProfileUpdatePasswordView;
