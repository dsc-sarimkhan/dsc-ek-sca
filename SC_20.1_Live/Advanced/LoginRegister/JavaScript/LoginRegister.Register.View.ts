/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="LoginRegister.Register.View"/>

import * as _ from 'underscore';

import * as register_tpl from 'login_register_register.tpl';
import { Loggers } from '../../../Commons/Loggers/JavaScript/Loggers';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import AccountRegisterModel = require('../../Account/JavaScript/Account.Register.Model');
import Tracker = require('../../../Commons/Tracker/JavaScript/Tracker');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import LiveOrderModel = require('../../../Commons/LiveOrder/JavaScript/LiveOrder.Model');
import BackboneFormView = require('../../../Commons/Backbone.FormView/JavaScript/Backbone.FormView');

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class LoginRegister.Register.View @extend BackboneView
const LoginRegisterRegisterView: any = BackboneView.extend({
    template: register_tpl,

    attributes: {
        id: 'register'
    },

    title: Utils.translate('Register'),

    events: {
        'submit form': 'submitForm'
    },

    bindings: {
        '[name="firstname"]': 'firstname',
        '[name="lastname"]': 'lastname',
        '[name="company"]': 'company',
        '[name="email"]': 'email',
        '[name="password"]': 'password',
        '[name="password2"]': 'password2'
    },

    initialize: function(options) {
        this.options = options;
        this.application = options.application;
        this.parentView = options.parentView;

        this.model = options.model || new AccountRegisterModel();
        // on save we redirect the user out of the registration page
        // as we know there hasn't been an error
        this.model.on('save', _.bind(this.redirect, this));

        BackboneFormView.add(this);
    },

    submitForm: function(e, model, props) {
        e.preventDefault();

        const loggers = Loggers.getLogger();
        const actionId = loggers.start('Customer Registration');

        const self = this;
        const data = (<any>jQuery(e.target).closest('form')).serializeObject();

        return this.cancelableTrigger('before:LoginRegister.register', data).then(function() {
            const promise = self.saveForm(e, model, props);

            if (promise) {
                promise.done(() => {
                    loggers.end(actionId, {
                        operationIds: self.model.getOperationIds(),
                        status: 'success'
                    });
                });
            }
        });
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

    // @method trackEvent tracks the 'create-account' event using the global Tracker instance
    // @param {Function} callback
    trackEvent: function(callback: Function) {
        Tracker.getInstance().trackRegister({
            action: 'Checkout - User Interaction',
            category: 'Register',
            callback: callback
        });
    },

    // @method redirect redirects the user after successful account registration taking into account redirect (origin and origin_hash) parameters.
    // @param {Object} response the http response data object result of calling the account-register service.
    redirect: function(_context, response) {
        const self = this;
        return this.cancelableTrigger('after:LoginRegister.register').then(function() {
            const url_options = Utils.parseUrlOptions(window.location.search);
            const { touchpoints } = response;
            const { application } = self;

            if (url_options.is && url_options.is === 'checkout') {
                const profile_model = ProfileModel.getInstance();

                response.user && profile_model.set(response.user);
                response.cart && LiveOrderModel.getInstance().set(response.cart);
                response.address && profile_model.get('addresses').reset(response.address);
                response.paymentmethod &&
                    profile_model.get('paymentmethods').reset(response.paymentmethod);

                // Track Guest Checkout Event
                self.trackEvent(function() {
                    application.Configuration.currentTouchpoint = 'checkout';
                    Backbone.history.navigate('', { trigger: true });
                });
            } else {
                // Track Login Event
                self.trackEvent(function() {
                    // if we know from which touchpoint the user is coming from
                    if (url_options.origin && touchpoints[url_options.origin]) {
                        // we save the url to that touchpoint
                        let url = touchpoints[url_options.origin];
                        // if there is an specific hash
                        if (url_options.origin_hash) {
                            // we add it to the url as a fragment
                            url = Utils.addParamsToUrl(url, { fragment: url_options.origin_hash });
                        }
                        window.location.href = url;
                    } else {
                        // We've got to disable passwordProtectedSite feature if customer registration is disabled.
                        if (
                            Configuration.getRegistrationType() !== 'disabled' &&
                            SC.ENVIRONMENT.siteSettings.siteloginrequired === 'T'
                        ) {
                            window.location.href = touchpoints.home;
                        } else {
                            // otherwise we need to take it to the customer center
                            window.location.href = touchpoints.customercenter;
                        }
                    }
                });
            }
        });
    },

    // @method getContext @return {LoginRegister.Register.View.Context}
    getContext: function() {
        const url_options = Utils.parseUrlOptions(window.location.search);

        // @class LoginRegister.Register.View.Context
        return {
            // @property {Boolean} showCompanyField
            showCompanyField: SC.ENVIRONMENT.siteSettings.registration.showcompanyfield === 'T',
            // @property {Boolean} isCompanyFieldRequire
            isCompanyFieldRequire:
                SC.ENVIRONMENT.siteSettings.registration.companyfieldmandatory === 'T',
            // @property {Boolean} isEmailSubscribeChecked
            isEmailSubscribeChecked:
                this.options.isEmailSubscribeChecked ||
                SC.ENVIRONMENT.siteSettings.defaultSubscriptionStatus,
            // @property {String} siteName
            siteName: SC.ENVIRONMENT.siteSettings.displayname,
            // @property {Boolean} showFormFieldsOnly
            showFormFieldsOnly: this.options.showFormFieldsOnly || false,
            // @property {Boolean} isRedirect
            isRedirect: !!(url_options.is !== 'checkout' && url_options.origin !== 'checkout'),
            // @property {Boolean} hasAutoFocus
            hasAutoFocus: url_options.is === 'register' && Utils.isDesktopDevice()
        };
    }
    // @class LoginRegister.Register.View
});

export = LoginRegisterRegisterView;
