/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="LoginRegister.CheckoutAsGuest.View"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import * as checkout_as_guest_tpl from 'login_register_checkout_as_guest.tpl';

import AccountRegisterAsGuestModel = require('../../Account/JavaScript/Account.RegisterAsGuest.Model');
import Tracker = require('../../../Commons/Tracker/JavaScript/Tracker');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import LiveOrderModel = require('../../../Commons/LiveOrder/JavaScript/LiveOrder.Model');
import BackboneFormView = require('../../../Commons/Backbone.FormView/JavaScript/Backbone.FormView');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class LoginRegister.CheckoutAsGuest.View Implements the checkout-as-guest UI bu showing a checkout-as-guest button
// that when clicked it will first register the current user as guest and then shows the checkout wizard @extend BackboneView
const LoginRegisterCheckoutAsGuestView: any = BackboneView.extend({
    template: checkout_as_guest_tpl,

    attributes: {
        id: 'checkout-as-guest',
        class: 'view checkout-as-guest'
    },

    events: {
        'submit form': 'saveForm'
    },

    bindings: {
        '[name="firstname"]': 'firstname',
        '[name="lastname"]': 'lastname',
        '[name="email"]': 'email'
    },

    initialize: function(options) {
        this.application = options.application;
        this.parentView = options.parentView;
        this.hideRegister = options.hideRegister;
        // @property {Account.RegisterAsGuest.Model} model
        this.model = new AccountRegisterAsGuestModel();
        // on save we redirect the user out of the registration page
        // as we know there hasn't been an error
        this.model.on('save', _.bind(this.redirect, this));

        BackboneFormView.add(this);
    },

    // @method trackEvent responsible of notifying the Tracker that the guest-checkout operation was made
    trackEvent: function(callback: Function) {
        Tracker.getInstance().trackCheckoutAsGuest({
            category: 'Checkout - User Interaction',
            action: 'Checkout As Guest',
            callback: callback
        });
    },

    // @method redirect after the checkout-as-guest operation was successfully made this method is in
    // responsible of navigating to the checkout wizard page. Remember that both login and checkout touchpoints belongs to the same
    // checkout.ssp so we don't need to reload the page.
    redirect: function(context, response) {
        const { application } = this;
        const profile_model = ProfileModel.getInstance();

        this.$('[type="submit"]').attr('disabled', true);

        response.user && profile_model.set(response.user);
        response.cart && LiveOrderModel.getInstance().set(response.cart);
        response.address && profile_model.get('addresses').reset(response.address);
        response.paymentmethod && profile_model.get('paymentmethods').reset(response.paymentmethod);

        // Track Guest Checkout Event
        this.trackEvent(function() {
            // First we track the event of login in as guest, and after that we change the current touch-point form register to checkout
            // this is necessary to the navigation helper and some routers to work properly
            application.Configuration.currentTouchpoint = 'checkout';
            Backbone.history.navigate('', { trigger: true });
        });
    },

    // @method getContext @return {LoginRegister.CheckoutAsGuest.View.Context}
    getContext: function() {
        const url_options = Utils.parseUrlOptions(window.location.search);

        // @class LoginRegister.CheckoutAsGuest.View.Context
        return {
            // @property {Boolean} isRedirect
            isRedirect: !!(url_options.is !== 'checkout' && url_options.origin !== 'checkout'),
            // @property {Boolean} hideRegister
            hideRegister: this.hideRegister,
            // @property {Boolean} hideGuestFirstandLastname
            showGuestFirstandLastname: Configuration.get('forms.loginAsGuest.showName'),
            // @property {Boolean} showEmail
            showGuestEmail: Configuration.get('forms.loginAsGuest.showEmail'),
            // @property {Boolean} expandGuestUserEnabled
            expandGuestUserEnabled:
                Configuration.get('forms.loginAsGuest.showName') ||
                Configuration.get('forms.loginAsGuest.showEmail'),
            // @property {String} buttonCheckoutAsGuestText
            buttonCheckoutAsGuestText: Configuration.get(
                'forms.loginAsGuest.buttonCheckoutAsGuestText'
            )
        };
    }
});

export = LoginRegisterCheckoutAsGuestView;
