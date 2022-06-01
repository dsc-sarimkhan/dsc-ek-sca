/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CookieWarningBanner.View"/>
// @module CookieWarningBanner.View

import * as cookie_warning_banner_view_tpl from 'cookie_warning_banner_view.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import Cookies = require('../../../Commons/Utilities/JavaScript/js.cookie');

// @class CookieWarningBanner.View @extend Backbone.View
const CookieWarningBannerView: any = BackboneView.extend({
    template: cookie_warning_banner_view_tpl,

    events: {
        'click [data-action="close-message"]': 'closeMessage'
    },

    // @return {Void}
    initialize: function initialize() {
        BackboneView.prototype.initialize.apply(this, arguments);
    },

    // @method closeMessage Event handle for the close action
    closeMessage: function closeMessage() {
        Cookies.set('isCookieWarningClosed', true, { expires: 365 });
    },

    // @method showBanner Indicate if this current message should be shown or not
    // @return {Boolean}
    showBanner: function showBanner() {
        return (
            Configuration.get('siteSettings.showcookieconsentbanner') === 'T' &&
            !(
                Configuration.get('cookieWarningBanner.saveInCookie', false) &&
                Cookies.get('isCookieWarningClosed')
            )
        );
    },

    // @method getContext
    // @return {CookieWarningBanner.View.Context}
    getContext: function getContext() {
        // @class CookieWarningBanner.View.Context
        return {
            // @property {Boolean} showBanner
            showBanner: this.showBanner(),
            // @property {String} cookieMessage
            cookieMessage: Configuration.get('cookieWarningBanner.message', ''),
            // @property {Boolean} showLink
            showLink: !!Configuration.get('siteSettings.cookiepolicy', false),
            // @property {String} linkHref
            linkHref: Configuration.get('siteSettings.cookiepolicy', false),
            // @property {String} linkContent
            linkContent: Configuration.get('cookieWarningBanner.anchorText', ''),
            // @property {Boolean} showLink
            closable: Configuration.get('cookieWarningBanner.closable', true)
        };
        // @class CookieWarningBanner.View
    }
});

export = CookieWarningBannerView;
