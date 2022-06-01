/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Profile.Information.View"/>
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as profile_information_tpl from 'profile_information.tpl';
import * as jQuery from '../../Core/JavaScript/jQuery';

import GlobalViewsMessageView = require('../../GlobalViews/JavaScript/GlobalViews.Message.View');
import Configuration = require('../../../Advanced/SCA/JavaScript/SC.Configuration');
import ProfileModel = require('./Profile.Model');
import ProfileChangeEmailModel = require('./Profile.ChangeEmailAddress.Model');
import ProfileChangeEmailView = require('./Profile.ChangeEmailAddress.View');

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');
import BackboneFormView = require('../../Backbone.FormView/JavaScript/Backbone.FormView');

// @class Profile.Information.View @extends Backbone.View
const ProfileInformationView: any = BackboneView.extend({
    template: profile_information_tpl,
    page_header: Utils.translate('Profile Information'),
    title: Utils.translate('Profile Information'),
    attributes: {
        id: 'ProfileInfo',
        class: 'ProfileInformationView'
    },
    events: {
        'submit form': 'save',
        'change input[data-type="phone"]': 'formatPhone',
        'click [data-action="change-email"]': 'changeEmail'
    },

    bindings: {
        '[name="firstname"]': 'firstname',
        '[name="lastname"]': 'lastname',
        '[name="companyname"]': 'companyname',
        '[name="phone"]': 'phone'
    },

    save: function(e) {
        return this.saveForm(e, this.model);
    },

    initialize: function(options) {
        this.application = options.application;
        this.model = ProfileModel.getInstance();
        BackboneFormView.add(this);
        this.useLayoutError = true;
        this.model.on('save', this.showSuccess, this);
    },

    formatPhone: function(e) {
        const $target = jQuery(e.target);
        $target.val(Utils.formatPhone(<any>$target.val()));
    },

    changeEmail: function() {
        const model = new ProfileChangeEmailModel(this.model.attributes);

        const view = new ProfileChangeEmailView({
            application: this.application,
            model: model
        });

        const self = this;

        model.on('save', function() {
            view.showSuccess(self.$('[data-type="alert-placeholder"]'));
        });

        view.useLayoutError = true;

        this.application.getLayout().showInModal(view);
    },

    showSuccess: function() {
        if (this.$savingForm) {
            const global_view_message = new GlobalViewsMessageView({
                message: Utils.translate('Profile successfully updated!'),
                type: 'success',
                closable: true
            });
            this.showContent();
            this.$('[data-type="alert-placeholder"]').append(
                global_view_message.render().$el.html()
            );
        }
    },

    // @method getSelectedMenu
    getSelectedMenu: function() {
        return 'profileinformation';
    },
    // @method getBreadcrumbPages
    getBreadcrumbPages: function() {
        return {
            text: this.title,
            href: '/profileinformation'
        };
    },
    // @method getContext @return Profile.Information.View.Context
    getContext: function() {
        // @class Profile.Information.View.Context
        return {
            // @property {String} pageHeader
            pageHeader: this.page_header,
            // @property {Boolean} isNotCompany
            isNotCompany: this.model.get('type') !== 'COMPANY',
            // @property {String} phoneFormat
            phoneFormat: Configuration.get('siteSettings.phoneformat'),
            // @property {Boolean} isCompanyAndShowCompanyField
            isCompanyAndShowCompanyField:
                this.model.get('type') === 'COMPANY' ||
                Configuration.get('siteSettings.registration.showcompanyfield') === 'T',
            // @property {Boolean} isCompanyFieldRequired
            isCompanyFieldRequired: Utils.getPathFromObject(
                this,
                'model.validation.companyname.required',
                false
            ),
            // @property {Boolean} isPhoneFieldRequired
            isPhoneFieldRequired: Utils.getPathFromObject(
                this,
                'model.validation.phone.required',
                false
            ),
            // @property {String} firstName
            firstName: this.model.get('firstname') || '',
            // @property {String} lastName
            lastName: this.model.get('lastname') || '',
            // @property {String} companyName
            companyName: this.model.get('companyname') || '',
            // @property {String} email
            email: this.model.get('email') || '',
            // @property {String} phone
            phone: this.model.get('phone') || '',
            // @property {Boolean} showBackToAccount
            showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD'
        };
    }
});

export = ProfileInformationView;
