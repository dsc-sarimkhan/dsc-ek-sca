/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.RegisterEmail"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended.d.ts" />

import * as _ from 'underscore';
import '../../../Commons/Utilities/JavaScript/Utils';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as order_wizard_registeremail_module_tpl from 'order_wizard_registeremail_module.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import WizardModule = require('../../Wizard/JavaScript//Wizard.Module');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

export = WizardModule.extend({
    template: order_wizard_registeremail_module_tpl,

    className: 'OrderWizard.Module.RegisterEmail',

    invalidEmailErrorMessage: {
        errorCode: 'ERR_CHK_INVALID_EMAIL',
        errorMessage: Utils.translate('Invalid email address')
    },

    errors: ['ERR_CHK_INVALID_EMAIL'],

    render: function() {
        if (!this.isActive()) {
            return this.$el.empty();
        }

        this._render();

        if (this.profileModel.get('email') && this.wizard.isPaypalComplete()) {
            this.trigger('ready', true);
        }
    },

    initialize: function() {
        this.profileModel = ProfileModel.getInstance();
        WizardModule.prototype.initialize.apply(this, arguments);
    },

    submit: function() {
        const fake_promise = jQuery.Deferred();
        const self = this;
        const email = this.$('input[name=email]').val();
        const emailsubscribe = this.$('input[name=sign-up-newsletter]').is(':checked') ? 'T' : 'F';

        // if the module is not active or if the module is active and not change the current values we just resolve the promise
        if (
            !this.isActive() ||
            (this.isActive() &&
                this.profileModel.get('email') === email &&
                this.profileModel.get('emailsubscribe') === emailsubscribe)
        ) {
            return this.isValid();
        }

        this.profileModel.set({
            email: email,
            confirm_email: email
        });

        this.isValid().then(
            function() {
                self.profileModel
                    .set({
                        emailsubscribe: emailsubscribe,
                        skipLoginDontUpdateProfile: ['email', 'confirm_email', 'emailsubscribe']
                    })
                    .save()
                    .then(
                        function() {
                            self.profileModel.unset('skipLoginDontUpdateProfile', { silent: true });
                            self.render();
                            fake_promise.resolve();
                        },
                        function(message) {
                            fake_promise.reject(message);
                        }
                    );
            },
            function(message) {
                fake_promise.reject(message);
            }
        );

        return fake_promise;
    },

    isValid: function(): any {
        const promise = jQuery.Deferred();

        if ((<any>Backbone).Validation.patterns.email.test(this.profileModel.get('email'))) {
            return promise.resolve();
        }

        return promise.reject(this.invalidEmailErrorMessage);
    },

    showError: function() {
        this.$('.control-group').removeClass('error');
        this.$('.control-group').addClass('error');
        WizardModule.prototype.showError.apply(this, arguments);
    },

    isActive: function(): boolean {
        return (
            (this.profileModel.get('isGuest') === 'T' ||
                (this.profileModel.get('isGuest') === 'F' &&
                    this.profileModel.get('isLoggedIn') === 'F' &&
                    this.profileModel.get('isRecognized') === 'F')) &&
            (this.wizard.application.getConfig('checkout.skipLogin') ||
                !Configuration.get('forms.loginAsGuest.showEmail'))
        );
    },

    // @method getContext
    // @return {OrderWizard.Module.RegisterEmail.Context}
    getContext: function() {
        // @class OrderWizard.Module.RegisterEmail.Context
        return {
            // @property {String} email
            email: this.profileModel.get('email') || '',
            // @property {Boolean} isEmailSubcribe
            isEmailSubcribe: this.profileModel.get('emailsubscribe') === 'T'
        };
    }
});
