/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Profile.EmailPreferences.View"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as profile_emailpreferences_tpl from 'profile_emailpreferences.tpl';
import * as jQuery from '../../Core/JavaScript/jQuery';

import Configuration = require('../../../Advanced/SCA/JavaScript/SC.Configuration');
import GlobalViewsMessageView = require('../../GlobalViews/JavaScript/GlobalViews.Message.View');
import BackboneFormView = require('../../Backbone.FormView/JavaScript/Backbone.FormView');
import ProfileModel = require('./Profile.Model');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// @class Profile.EmailPreferences.View @extends Backbone.View
const ProfileEmailPreferencesView: any = BackboneView.extend({
    template: profile_emailpreferences_tpl,
    title: Utils.translate('Email Preferences'),
    page_header: Utils.translate('Email Preferences'),
    attributes: {
        id: 'EmailPreferences',
        class: 'ProfileEmailPreferencesView'
    },
    events: {
        'submit form': 'save',
        'change form:has([data-action="reset"])': 'toggleReset',
        'click [data-action="reset"]': 'resetForm',
        'keyup form:has([data-action="reset"])': 'toggleReset',
        'change [data-type="emailsubscribe-checkbox"]': 'emailSubscribeChange'
    },

    initialize: function() {
        this.model = ProfileModel.getInstance();
        BackboneFormView.add(this);
        this.useLayoutError = true;
        this.model.on('save', this.showSuccess, this);
    },

    // @method getSelectedMenu
    getSelectedMenu: function() {
        return 'emailpreferences';
    },
    // @method getBreadcrumbPages
    getBreadcrumbPages: function() {
        return {
            text: this.title,
            href: 'emailpreferences'
        };
    },

    showSuccess: function() {
        if (this.$savingForm) {
            const global_view_message = new GlobalViewsMessageView({
                message: Utils.translate('Email Preferences successfully saved!'),
                type: 'success',
                closable: true
            });

            this.showContent().then(function() {
                this.$('[data-type="alert-placeholder"]').append(
                    global_view_message.render().$el.html()
                );
            });
        }
    },

    save: function(e) {
        e.preventDefault();

        const $target = jQuery(e.target);
        const props = (<any>$target).serializeObject();
        const subscriptions_by_id = {};
        const campaignsubscriptions = this.model.get('campaignsubscriptions');

        // generate an object with the subscriptions and it's corresponding value
        _.each(props, function(val, key: any) {
            if (~key.indexOf('subscription-')) {
                subscriptions_by_id[key.replace('subscription-', '')] = val === 'T';
            }
        });

        _.each(campaignsubscriptions, function(subscription: any) {
            subscription.subscribed = subscriptions_by_id[subscription.internalid];
        });

        const fixed_props = {
            campaignsubscriptions: campaignsubscriptions,
            emailsubscribe: props.emailsubscribe === 'T'
        };

        this.saveForm(e, this.model, fixed_props);
    },

    resetForm: function(e) {
        e.preventDefault();
        this.showContent();
    },

    // if the user doesn't want email notifications we disable all the campaign's checkboxes
    emailSubscribeChange: function(e) {
        const disabled = jQuery(e.target).prop('checked');

        this.$('[data-type="subscription-checkbox"]').prop('disabled', !disabled);
    },

    // @method getContext @return Profile.EmailPreferences.View.Context
    getContext: function() {
        const campaign_subscriptions = this.model.get('campaignsubscriptions') || [];

        // @class Profile.EmailPreferences.View.Context
        return {
            // @property {String} pageHeader
            pageHeader: this.page_header,
            // @property {Array} subscriptions
            subscriptions: campaign_subscriptions,
            // @property {Boolean} isEmailSuscribe
            isEmailSuscribe: this.model.get('emailsubscribe') === 'T',
            // @property {Boolean} campaignSubscriptions
            campaignSubscriptions: !!(
                Configuration.get('siteSettings.campaignsubscriptions') &&
                campaign_subscriptions.length
            ),
            // @property {Boolean} showBackToAccount
            showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD'
        };
    }
});

export = ProfileEmailPreferencesView;
