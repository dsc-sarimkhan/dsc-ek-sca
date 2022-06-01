/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Header.Profile.View"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as header_profile_tpl from 'header_profile.tpl';

import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import Configuration = require('../../../Commons/Utilities/JavaScript/SC.Configuration');
import HeaderMenuMyAccountView = require('./Header.Menu.MyAccount.View');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');

// @module Header

// @class Header.Profile.View
export = BackboneView.extend({
    template: header_profile_tpl,

    initialize: function() {
        const self = this;
        BackboneCompositeView.add(this);

        ProfileModel.getPromise().done(function() {
            self.render();
        });

        this.on('afterViewRender', function() {
            Utils.ellipsis('.header-profile-loading-indicator');
        });
    },

    childViews: {
        'Header.Menu.MyAccount': function() {
            return new HeaderMenuMyAccountView(this.options);
        }
    },

    // @method getContext @return {Header.Profile.View.Context}
    getContext: function() {
        const profile = ProfileModel.getInstance();
        const is_loading =
            !Utils.getPathFromObject(Configuration, 'performance.waitForUserProfile', true) &&
            ProfileModel.getPromise().state() !== 'resolved';
        const is_logged_in =
            (profile.get('isLoggedIn') === 'T' ||
                (profile.get('isRecognized') === 'T' &&
                    Configuration.get('header.showRecognizedShopper', true))) &&
            profile.get('isGuest') === 'F';

        // @class Header.Profile.View.Context
        return {
            // @property {Boolean} showExtendedMenu
            showExtendedMenu: !is_loading && is_logged_in,
            // @property {Boolean} showLoginMenu
            showLoginMenu: !is_loading && !is_logged_in,
            // @property {Boolean} showLoadingMenu
            showLoadingMenu: is_loading,
            // @property {Boolean} showMyAccountMenu
            showMyAccountMenu: !!this.options.showMyAccountMenu,
            // @property {String} displayName
            displayName: profile.get('firstname') || profile.get('companyname'),
            // @property {Boolean} showLogin
            showLogin: Configuration.getRegistrationType() !== 'disabled',
            // @property {Boolean} showRegister
            showRegister:
                Configuration.getRegistrationType() === 'optional' ||
                Configuration.getRegistrationType() === 'required'
        };
    }
});
