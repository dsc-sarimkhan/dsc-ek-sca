/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Overview.Banner.View"/>
// Overview.Banner.View.js
// -----------------------

import * as _ from 'underscore';
import * as overview_banner_tpl from 'overview_banner.tpl';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

const OverviewBannerView: any = BackboneView.extend({
    template: overview_banner_tpl,
    initialize: function() {},
    // @method getContext @returns {Overview.Banner.View.Context}
    getContext: function() {
        const bannersConfig = Configuration.get('overview.homeBanners');
        const banners = _.isArray(bannersConfig) ? bannersConfig : [bannersConfig];
        const random_banner = banners[Math.floor(Math.random() * banners.length)];

        // @class Overview.Banner.View.Context
        return {
            // @property {Boolean} hasBanner
            hasBanner: !!random_banner,
            // @property {Boolean} hasLink
            hasLink: !!(random_banner && random_banner.linkUrl),
            // @property {String} linkUrl
            linkUrl: random_banner && random_banner.linkUrl,
            // @property {String} linkTarget
            linkTarget: random_banner && random_banner.linkTarget,
            // @property {String} imageSource
            imageSource: random_banner && random_banner.imageSource
        };
    }
});

export = OverviewBannerView;
