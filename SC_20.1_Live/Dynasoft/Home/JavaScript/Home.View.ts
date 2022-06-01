/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Home.View"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended.d.ts"/>
import * as _ from 'underscore';
import * as home_tpl from 'home.tpl';

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import Tracker = require('../../../Commons/Tracker/JavaScript/Tracker');

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import Configuration = require('../../../Advanced/SCA/JavaScript/SC.Configuration');
import EKConfigurationModel = require('../../EKConfiguration/JavaScript/EKConfiguration.Model');
import EKHomeBannerModel= require('../../EKHomeBanner/JavaScript/EKHomeBanner.Model');
import Url = require('../../../Commons/Utilities/JavaScript/Url');
// @module Home.View @extends Backbone.View
const HomeView: any = BackboneView.extend({
    template: home_tpl,

    title: Utils.translate('Evakool Coolers - The Leading Brand of Portable Icebox Coolers Australia Wide'),

    page_header: Utils.translate('Welcome to the store'),

    attributes: {
        id: 'home-page',
        class: 'home-page'
    },

    events: {
        'click [data-action=slide-carousel]': 'carouselSlide'
    },

    initSlider: function initSlider() {
        Utils.initBxSlider(this.$('[data-slider]'), {
            nextText: '<a class="home-gallery-next-icon"></a>',
            prevText: '<a class="home-gallery-prev-icon"></a>'
        });
    },

    initialize: function() {
        this.windowWidth = jQuery(window).width();
        // this.collection = new EKHomeBannerCollection();
        // this.collection.on('sync', this.showContent, this);
        // console.log('this.collection',this.collection);
        this.options.application.getLayout().on('afterAppendView', this.initSlider, this);

        this.options.application.getLayout().once('afterAppendView', ():void => {
                Tracker.getInstance().trackHomePageview('/' + Backbone.history.fragment);
            },
            this
        );

        const windowResizeHandler = _.throttle(function() {
            if (
                Utils.getDeviceType(this.windowWidth) ===
                Utils.getDeviceType(jQuery(window).width())
            ) {
                return;
            }
            this.showContent();

            Utils.resetViewportWidth();

            this.windowWidth = jQuery(window).width();
        }, 1000);

        this._windowResizeHandler = _.bind(windowResizeHandler, this);

        jQuery(window).on('resize', this._windowResizeHandler);
    },

    destroy: function() {
        BackboneView.prototype.destroy.apply(this, arguments);
        jQuery(window).off('resize', this._windowResizeHandler);
        this.options.application.getLayout().off('afterAppendView', this.initSlider, this);
    },

    render: function(){
        BackboneView.prototype.render.apply(this, arguments);
        
        //added 5 second slide change for banner
        setInterval(function(){
            $("a.home-gallery-next-icon").trigger('click');
        }, 5000);
    },

    // @method getContext @return Home.View.Context
    getContext: function() {
        var ekHomeBannerModel = new EKHomeBannerModel();
        ekHomeBannerModel.fetch({
            async:false
        }).fail(function(response){
            console.log("Error:", response);
        });
        var customCarousel=[];
        const carouselImages = _.map(Configuration.get('home.carouselImages', []), function(
            url: string
        ) {
            return Utils.getAbsoluteUrlOfNonManagedResources(url);
        });

        _.each(ekHomeBannerModel.attributes, function(v,i){
            customCarousel.push({image:v['img_url'], url:v['nav_url']});
        });

        const bottomBannerImages = _.map(Configuration.get('home.bottomBannerImages', []), function(
            url: string
        ) {
            return Utils.getAbsoluteUrlOfNonManagedResources(url);
        });

        return {
            // @class Home.View.Context
            // @property {String} imageResizeId
            imageHomeSize: Utils.getViewportWidth() < 768 ? 'homeslider' : 'main',
            // @property {String} imageHomeSizeBottom
            imageHomeSizeBottom: Utils.getViewportWidth() < 768 ? 'homecell' : 'main',
            // @property {Array} carouselImages
            carouselImages: customCarousel,//carouselImages,
            // @property {Array} bottomBannerImages
            bottomBannerImages: bottomBannerImages
            // @class Home.View
        };
    }
});

export = HomeView;