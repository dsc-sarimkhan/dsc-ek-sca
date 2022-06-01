/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="LoginRegister.ResetPassword.View"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended.d.ts" />
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import * as reset_password_tpl from 'login_register_reset_password.tpl';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import AccountResetPasswordModel = require('../../Account/JavaScript/Account.ResetPassword.Model');
import GlobalViewsMessageView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Message.View');
import BackboneFormView = require('../../../Commons/Backbone.FormView/JavaScript/Backbone.FormView');
import HeaderSimplifiedView = require('../../Header/JavaScript/Header.Simplified.View');

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class LoginRegister.ResetPassword.View implements the reset-password experience UI @extend BackboneView
const LoginRegisterResetPasswordView: any = BackboneView.extend({
    template: reset_password_tpl,

    attributes: {
        id: 'reset-password'
    },

    title: Utils.translate('Reset Password'),

    events: {
        'submit form': 'saveForm'
    },

    bindings: {
        '[name="password"]': 'password',
        '[name="confirm_password"]': 'confirm_password'
    },

    initialize: function() {
        this.model = new AccountResetPasswordModel();
        this.model.set('params', { cb: Utils.parseUrlOptions(location.search).cb });
        this.model.on('save', _.bind(this.showSuccess, this));

        BackboneFormView.add(this);
    },

    // @method showSuccess
    showSuccess: function() {
        SC.ENVIRONMENT.updated_password_confirmation = true;
        Backbone.history.navigate('login-register', { trigger: true });
    },

    getHeaderView: function() {
        // We've got to disable passwordProtectedSite feature if customer registration is disabled.
        if (
            Configuration.getRegistrationType() !== 'disabled' &&
            SC.ENVIRONMENT.siteSettings.siteloginrequired === 'T'
        ) {
            return HeaderSimplifiedView;
        }
    }
});

export = LoginRegisterResetPasswordView;
