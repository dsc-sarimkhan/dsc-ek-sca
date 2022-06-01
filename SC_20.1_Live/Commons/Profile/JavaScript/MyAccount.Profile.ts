/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="MyAccount.Profile"/>
import * as Utils from '../../Utilities/JavaScript/Utils';

import * as jQuery from '../../Core/JavaScript/jQuery';

import ProfileModel = require('./Profile.Model');
import ProfileInformationView = require('./Profile.Information.View');
import ProfileEmailPreferencesView = require('./Profile.EmailPreferences.View');
import ProfileUpdatePasswordView = require('./Profile.UpdatePassword.View');

// Profile.js
// -----------------
// Defines the Profile module (Collection, Views, Router)
// As the profile is instanciated in the application (without definining a model)
// the validation is configured here in the mountToApp

const MyAccountProfile: any = {
    mountToApp: function(application) {
        const profile_model_instance = ProfileModel.getInstance();

        if (SC.ENVIRONMENT.PROFILE) {
            profile_model_instance.set(SC.ENVIRONMENT.PROFILE);

            if (
                profile_model_instance.get('isperson') &&
                application.getConfig('siteSettings.registration.companyfieldmandatory') !== 'T'
            ) {
                delete profile_model_instance.validation.companyname;
            }

            if (!profile_model_instance.get('isperson')) {
                delete profile_model_instance.validation.firstname;
            }

            if (
                !profile_model_instance.get('lastname') ||
                !profile_model_instance.get('isperson')
            ) {
                delete profile_model_instance.validation.lastname;
            }

            if (!profile_model_instance.get('phone') && profile_model_instance.validation.phone) {
                profile_model_instance.validation.phone.required = false;
            }

            if (SC.ENVIRONMENT.LIVEPAYMENT) {
                if (SC.ENVIRONMENT.LIVEPAYMENT.balance) {
                    profile_model_instance.set('balance', SC.ENVIRONMENT.LIVEPAYMENT.balance);
                }
                if (SC.ENVIRONMENT.LIVEPAYMENT.balance_formatted) {
                    profile_model_instance.set(
                        'balance_formatted',
                        SC.ENVIRONMENT.LIVEPAYMENT.balance_formatted
                    );
                }
            }
        }
        if (SC.ENVIRONMENT.ADDRESS) {
            profile_model_instance.get('addresses').reset(SC.ENVIRONMENT.ADDRESS);
            delete SC.ENVIRONMENT.ADDRESS;
        } else {
            profile_model_instance.get('addresses').reset([]);
        }

        if (SC.ENVIRONMENT.PAYMENTMETHOD) {
            profile_model_instance.get('paymentmethods').reset(SC.ENVIRONMENT.PAYMENTMETHOD);
            delete SC.ENVIRONMENT.PAYMENTMETHOD;
        } else {
            profile_model_instance.get('paymentmethods').reset([]);
        }

        const Layout = application.getLayout();

        profile_model_instance.on(
            'change:firstname change:lastname change:companyname',
            function() {
                Layout.updateHeader();
            }
        );

        application.getUser = function(...args) {
            const profile_promise = jQuery.Deferred();

            ProfileModel.getPromise()
                .done(function() {
                    profile_promise.resolve(ProfileModel.getInstance());
                })
                .fail(function() {
                    profile_promise.reject.apply(this, args);
                });

            return profile_promise;
        };

        const pageType = application.getComponent('PageType');

        pageType.registerPageType({
            name: 'ProfileInfo',
            routes: ['profileinformation'],
            view: ProfileInformationView,
            defaultTemplate: {
                name: 'profile_information.tpl',
                displayName: 'Profile Default',
                thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                    'img/default-layout-profile.png'
                )
            }
        });
        pageType.registerPageType({
            name: 'EmailPreferences',
            routes: ['emailpreferences'],
            view: ProfileEmailPreferencesView,
            defaultTemplate: {
                name: 'profile_emailpreferences.tpl',
                displayName: 'Profile email preferences default',
                thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                    'img/default-layout-email-preferences.png'
                )
            }
        });
        pageType.registerPageType({
            name: 'PasswordUpdate',
            routes: ['updateyourpassword'],
            view: ProfileUpdatePasswordView,
            defaultTemplate: {
                name: 'profile_update_password.tpl',
                displayName: 'Profile update password default',
                thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                    'img/default-layout-update-password.png'
                )
            }
        });
    }
};

export = MyAccountProfile;
