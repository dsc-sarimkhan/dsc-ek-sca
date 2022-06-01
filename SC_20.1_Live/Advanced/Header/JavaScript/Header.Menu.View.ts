/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Header.Menu.View"/>

/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />
import './jQuery.sidebarMenu';
import * as header_menu from 'header_menu.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import Configuration = require('../../../Commons/Utilities/JavaScript/SC.Configuration');
import HeaderProfileView = require('./Header.Profile.View');
import HeaderMenuMyAccountView = require('./Header.Menu.MyAccount.View');
import GlobalViewsHostSelectorView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.HostSelector.View');
import GlobalViewsCurrencySelectorView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.CurrencySelector.View');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @module Header

// @class Header.Menu.View @extends BackboneView
export = BackboneView.extend({
    template: header_menu,

    events: {
        'mouseenter [data-toggle="categories-menu"]': 'menuOpen',
        'mouseleave [data-toggle="categories-menu"]': 'menuClose',
        'click [data-toggle="categories-menu"]': 'menuClose'
    },

    menuOpen: function(e) {
        jQuery(e.currentTarget).addClass('open');
    },

    menuClose: function(e) {
        jQuery(e.currentTarget).removeClass('open');
    },

    initialize: function() {
        const self = this;
        BackboneCompositeView.add(this);

        this.application = this.options.application;
        this.application.on('Configuration.navigationData', this.render, this);

        ProfileModel.getPromise().done(function() {
            self.render();
        });
    },

    childViews: {
        'Header.Profile': function() {
            return new HeaderProfileView({
                showMyAccountMenu: false,
                application: this.application
            });
        },
        'Header.Menu.MyAccount': function() {
            return new HeaderMenuMyAccountView(this.options);
        },
        'Global.HostSelector': function() {
            return new GlobalViewsHostSelectorView();
        },
        'Global.CurrencySelector': function() {
            return new GlobalViewsCurrencySelectorView();
        }
    },

    render: function() {
        BackboneView.prototype.render.apply(this, arguments);
        this.$('[data-type="header-sidebar-menu"]').sidebarMenu();
    },

    // @method getContext
    // @return {Header.Sidebar.View.Context}
    getContext: function() {
        const profile = ProfileModel.getInstance();
        const is_loading =
            !Configuration.get('performance.waitForUserProfile', true) &&
            ProfileModel.getPromise().state() !== 'resolved';
        const is_loged_in = profile.get('isLoggedIn') === 'T' && profile.get('isGuest') === 'F';
        const environment = SC.ENVIRONMENT;
        const show_languages = environment.availableHosts && environment.availableHosts.length > 1;
        const show_currencies =
            environment.availableCurrencies &&
            environment.availableCurrencies.length > 1 &&
            !Configuration.get('header.notShowCurrencySelector');

        // @class Header.Sidebar.View.Context
        return {
            isStandalone: this.application.isStandalone,
            // @property {Array<NavigationData>} navigationItems
            categories: Configuration.navigationData || [],
            // @property {Boolean} showExtendedMenu
            showExtendedMenu: !is_loading && is_loged_in,
            // @property {Boolean} showLanguages
            showLanguages: show_languages,
            // @property {Boolean} showCurrencies
            showCurrencies: show_currencies
        };
    }
});
