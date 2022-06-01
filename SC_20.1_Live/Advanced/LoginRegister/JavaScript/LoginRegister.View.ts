/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="LoginRegister.View"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended.d.ts" />
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import * as login_register_tpl from 'login_register.tpl';
import * as notifications_tpl from 'notifications.tpl';

import GlobalViewsMessageView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Message.View');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import LoginView = require('./LoginRegister.Login.View');
import RegisterView = require('./LoginRegister.Register.View');
import CheckoutAsGuestView = require('./LoginRegister.CheckoutAsGuest.View');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import HeaderSimplifiedView = require('../../Header/JavaScript/Header.Simplified.View');
import FooterSimplifiedView = require('../../Footer/JavaScript/Footer.Simplified.View');
import Tracker = require('../../../Commons/Tracker/JavaScript/Tracker');

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class LoginRegister.View This class shows both the Login form and the Register at the same time. @extends BackboneView
const LoginRegisterView: any = BackboneView.extend({
    template: login_register_tpl,

    enhancedEcommercePage: true,

    attributes: {
        id: 'LoginRegister.View',
        'data-root-component-id': 'LoginRegister.View'
    },

    title: Utils.translate('Log in | Register'),

    events: {
        // login error message could contain link to registration page
        'click .alert-error a': 'handleErrorLink'
    },

    beforeShowContent: function beforeShowContent() {
        const promise = jQuery.Deferred();
        const profileModel = ProfileModel.getInstance();

        if (profileModel.get('isLoggedIn') === 'T' && profileModel.get('isGuest') === 'F') {
            Backbone.history.navigate('', { trigger: true });

            promise.reject();
        } else {
            promise.resolve();
        }

        return promise;
    },

    initialize: function(options) {
        const { application } = options;
        // To distinguish between when the login is called from the Register header link or the Proceed to Checkout link, we use the origin URL param (is_checking_out)
        // origin=checkout when the checkout link is clicked so we show the guest checkout button.
        const parameters = Utils.parseUrlOptions(location.search);
        const is_checking_out =
            (parameters && parameters.is === 'checkout') ||
            (parameters && parameters.origin === 'checkout') ||
            false;
        const profile_model = ProfileModel.getInstance();

        this.child_view_options = {
            application: application,
            parentView: this,
            timedout: options.timedout
        };

        this.pageTitle = Utils.translate('Log in');

        this.enableLogin = Configuration.getRegistrationType() !== 'disabled';

        this.enableRegister =
            Configuration.getRegistrationType() === 'optional' ||
            Configuration.getRegistrationType() === 'required';

        // we only show the CheckoutAsGuest button in 'checkout' touchpoint. Never in login/register touchpoints.
        this.enableCheckoutAsGuest =
            is_checking_out &&
            profile_model.get('isLoggedIn') === 'F' &&
            (Configuration.getRegistrationType() === 'optional' ||
                Configuration.getRegistrationType() === 'disabled');

        if (!notifications_tpl) {
            if (SC.ENVIRONMENT.email_verification_error) {
                this.message = {
                    text: Utils.translate(
                        'The validation process has failed. Please login into your account and click on the validation link again.'
                    ),
                    type: 'error'
                };
                delete SC.ENVIRONMENT.email_verification_error;
            } else if (SC.ENVIRONMENT.password_reset_invalid_error) {
                this.message = {
                    text: Utils.translate(
                        'Your reset password link is invalid. Request a new one using the Forgot Password link.'
                    ),
                    type: 'error'
                };
                delete SC.ENVIRONMENT.password_reset_invalid_error;
            } else if (SC.ENVIRONMENT.password_reset_expired_error) {
                this.message = {
                    text: Utils.translate(
                        'Your reset password link has expired. Request a new one using the Forgot Password link.'
                    ),
                    type: 'error'
                };
                delete SC.ENVIRONMENT.password_reset_expired_error;
            } else if (SC.ENVIRONMENT.reset_password_confirmation_email) {
                this.message = {
                    text: Utils.translate(
                        'Please check your email and get instructions on how to reset your password.'
                    ),
                    type: 'success'
                };
                delete SC.ENVIRONMENT.reset_password_confirmation_email;
            } else if (SC.ENVIRONMENT.updated_password_confirmation) {
                this.message = {
                    text: Utils.translate('Your password has been reset.'),
                    type: 'success'
                };
                delete SC.ENVIRONMENT.updated_password_confirmation;
            }
        }

        BackboneCompositeView.add(this);

        this.on('afterViewRender', this.trackStep, this);
    },

    trackStep: function() {
        Tracker.getInstance().trackPageviewForCheckoutStep(1);
    },

    // @method handleErrorLink workaround to native netsuite error links. In particular if error contains a link to the register touch-point we want to show the registration form without navigate.
    // @return {Void}
    handleErrorLink: function(e) {
        // if the link contains the register touch-point
        if (~e.target.href.indexOf(Configuration.get('siteSettings.touchpoints.register'))) {
            e.preventDefault();
            this.showRegistrationForm();

            this.childViewInstances.Login.hideError();
        }
    },

    // @method disableButtons
    // @param {Boolean} state
    // @return {LoginRegsiter.View} Current instance of the view
    disableButtons: function(state: boolean) {
        this.getChildViewInstance('Login')
            .$('a, input, button')
            .prop('disabled', state);
        if (this.getChildViewInstance('CheckoutAsGuest')) {
            this.getChildViewInstance('CheckoutAsGuest')
                .$('a, input, button')
                .prop('disabled', state);
        }
        this.getChildViewInstance('Register')
            .$('a, input, button')
            .prop('disabled', state);

        return this;
    },

    // @method showRegistrationForm  make sure the registration form is in the front
    showRegistrationForm: function() {
        // show the form
        this.$('[data-view="Register"]').addClass('in');
        // hide the container of the link to show it
        this.$('[data-view="CheckoutAsGuest"]').removeClass('in');
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

    childViews: {
        Login: function() {
            return new LoginView(this.child_view_options);
        },
        CheckoutAsGuest: function() {
            return new CheckoutAsGuestView(
                _.extend({ hideRegister: !this.enableRegister }, this.child_view_options)
            );
        },
        Register: function() {
            return new RegisterView(this.child_view_options);
        },
        Messages: function() {
            if (this.message) {
                return new GlobalViewsMessageView({
                    message: this.message.text,
                    type: this.message.type || 'error',
                    closable: true
                });
            }
        }
    },

    // @method getContext
    // @return {LoginRegister.View.Context}
    getContext: function() {
        // @class LoginRegister.View.Context
        return {
            // @property {Boolean} showRegister
            showRegister: this.enableRegister,
            // @property {Boolean} showCheckoutAsGuest
            showCheckoutAsGuest: this.enableCheckoutAsGuest,
            // @property {Boolean} showLogin
            showLogin: this.enableLogin,
            // @property {Boolean} showRegisterOrGuest
            showRegisterOrGuest: this.enableRegister || this.enableCheckoutAsGuest
        };
    }
});

export = LoginRegisterView;
