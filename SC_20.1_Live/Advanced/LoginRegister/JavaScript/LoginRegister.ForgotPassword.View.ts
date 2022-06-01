/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="LoginRegister.ForgotPassword.View"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended.d.ts" />
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import * as forgot_password_tpl from 'login_register_forgot_password.tpl';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import LoginRegisterUtils = require('./LoginRegister.Utils');
import AccountForgotPasswordModel = require('../../Account/JavaScript/Account.ForgotPassword.Model');
import GlobalViewsMessageView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Message.View');
import BackboneFormView = require('../../../Commons/Backbone.FormView/JavaScript/Backbone.FormView');
import HeaderSimplifiedView = require('../../Header/JavaScript/Header.Simplified.View');
import FooterSimplifiedView = require('../../Footer/JavaScript/Footer.Simplified.View');

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class LoginRegister.ForgotPassword.View Implements the forgot-password UI @extemd BackboneView
const LoginRegisterForgotPasswordView: any = BackboneView.extend({
    template: forgot_password_tpl,

    attributes: {
        id: 'forgot-password'
    },

    title: Utils.translate('Reset Password'),

    events: {
        'submit form': 'saveForm',
        'click [data-action="sign-in-now"]': 'signInNowClick'
    },

    bindings: {
        '[name="email"]': 'email'
    },

    initialize: function() {
        // @property {Account.ForgotPassword.Model} model
        this.model = new AccountForgotPasswordModel();
        this.model.on('save', _.bind(this.showSuccess, this));

        BackboneFormView.add(this);
    },

    getHeaderView: function() {
        // We've got to disable passwordProtectedSite feature if customer registration is disabled.
        if (
            Configuration.getRegistrationType() !== 'disabled' &&
            SC.ENVIRONMENT.siteSettings.siteloginrequired === 'T'
        ) {
            return HeaderSimplifiedView;
        }
    },

    getFooterView: function() {
        // We've got to disable passwordProtectedSite feature if customer registration is disabled.
        if (
            Configuration.getRegistrationType() !== 'disabled' &&
            SC.ENVIRONMENT.siteSettings.siteloginrequired === 'T'
        ) {
            return FooterSimplifiedView;
        }
    },

    render: function() {
        BackboneView.prototype.render.apply(this, arguments);
        if (this.$containerModal && this.options.application.getConfig('checkoutApp.skipLogin')) {
            this.$('header, h3').remove();
            this.$('[data-action="sign-in-now"]').attr({
                'data-toggle': 'show-in-modal',
                href: 'login'
            });
        }
    },

    // @method showSuccess
    showSuccess: function() {
        SC.ENVIRONMENT.reset_password_confirmation_email = true;
        Backbone.history.navigate('login-register', { trigger: true });
    },

    // @method signInNowClick
    signInNowClick: LoginRegisterUtils.skipLoginCloseModal,

    // @method saveForm override original saveForm method so the skip-login modal is not closed, if any.
    saveForm: function() {
        // we don't want to close the modal, if any, on saveForm
        if (this.$containerModal && this.options.application.getConfig('checkoutApp.skipLogin')) {
            this.inModal = false;
        }
        return BackboneView.prototype.saveForm.apply(this, arguments).done(function() {
            this.inModal = true;
        });
    },

    // @method getcContext @return LoginRegister.ForgotPassword.View.Context
    getContext: function() {
        // @class LoginRegister.ForgotPassword.View.Context
        return {};
    }
});

export = LoginRegisterForgotPasswordView;
