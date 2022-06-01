/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ImageLoader"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended.d.ts" />
// This module is responsible of of the lazy loading of images - this is loading only those images that are in the current browser's viewport and start loading
// the other images when the user scrolls into them. In general this module has two parts - first it exposes the function _.printImage() so images with this
// behavior can be easily printed in templates and then it contains the logic of loading the images when the user scrolls the window.
// This module won't affect the Page Generator output code - only browser's

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import BackboneViewRender = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View.render');

const default_height = 200;

const image_urls = {};

const fixImagesForLoader = function(s: string): string {
    return s.replace(/<img([^>]*)src="([^"]+)"([^>]*)/gi, function(
        all,
        textBefore,
        url,
        textAfter
    ) {
        if (image_urls[url]) {
            return all;
        }
        textBefore = textBefore || '';
        textAfter = textAfter || '';
        // do nothing if image contains data-loader="false" attribute
        if (
            (textBefore && textBefore.indexOf('data-loader="false"') !== -1) ||
            (textAfter && textAfter.indexOf('data-loader="false"') !== -1)
        ) {
            return all;
        }
        const params = Utils.parseUrlOptions(url);
        const height = params.resizeh || default_height;
        const style_attrs: string =
            'style="min-height:' + height + 'px;min-width:' + height + 'px"';
        const ret =
            '<img data-image-status="pending" data-src="' +
            url +
            '" ' +
            style_attrs +
            textBefore +
            ' ' +
            textAfter;
        return ret;
    });
};

const isElementInViewport = function($el): boolean {
    if (!$el.is(':visible')) {
        return false;
    }
    const el_rect = {
        left: $el.offset().left,
        top: $el.offset().top,
        bottom: $el.offset().top + $el.height(),
        right: $el.offset().left + $el.width()
    };
    const window_rect = {
        left: jQuery(window).scrollLeft(),
        top: jQuery(window).scrollTop(),
        bottom: jQuery(window).scrollTop() + jQuery(window).height(),
        right: jQuery(window).scrollLeft() + jQuery(window).width()
    };

    return rectangleIntercept(el_rect, window_rect);
};

var rectangleIntercept = function(r1, r2): boolean {
    return !(r1.left > r2.right || r1.right < r2.left || r1.top > r2.bottom || r1.bottom < r2.top);
};

// the main imageloader function resolvePendingImages. It will iterate all images marked with data-image-status="pending" and start loading them.
// If passed parameter onlyIfVisible is true it will load ony those images that are currently visible.
const resolvePendingImages = function(onlyIfVisible: boolean) {
    jQuery('[data-image-status="pending"]').each(function() {
        const $image = jQuery(this);
        if (!onlyIfVisible || isElementInViewport($image)) {
            const src = $image.attr('data-src');
            $image
                .attr({
                    src: $image.attr('data-src')
                })
                .data('image-status', 'done')
                .on('load error', function() {
                    $image.attr({ style: '' });
                    image_urls[src] = true;
                });
        }
    });
};

// @class ImageLoader @extends ApplicationModule
export = {
    mountToApp: function(application) {
        if (!Utils.isPageGenerator()) {
            const handler: any = _.throttle(_(resolvePendingImages).bind(null, true), 200);
            // we listen when the full document is scrolled and check if there is any pending image and load them if they are visible
            jQuery(window).on('resize scroll', handler);

            // when a new view is shown we want to check if it contains any visible pending images and load them
            application.getLayout().on('afterAppendView afterRender', function() {
                resolvePendingImages(true);
            });

            // There may be image markup that are there but in hidden parents that may be shown when user clicks or touch something.
            jQuery('body').on('click touchend', function() {
                resolvePendingImages(false);
            });
        }

        // ADDS RENDER PLUGIN TO HOOK WHEN RENDERING IMAGES
        BackboneViewRender.postCompile.install({
            name: 'imageLoader',
            priority: 40,
            execute: function(tmpl_str) {
                if (!Utils.isPageGenerator()) {
                    tmpl_str = fixImagesForLoader(tmpl_str) || '';
                }

                return tmpl_str;
            }
        });
    },

    // exposing utility methods so we can test them.

    // @method resolvePendingImages
    resolvePendingImages: resolvePendingImages,

    // @method rectangleIntercept @param {Rectangle} r1 @param {Rectangle} r2 @returns {Boolean}
    rectangleIntercept: rectangleIntercept,

    // @method isElementInViewport @param {jQuery|HTMLElement} el @returns {Boolean}
    isElementInViewport: isElementInViewport,

    // @method fixImagesForLoader
    fixImagesForLoader: fixImagesForLoader,

    // @property {Number} default_height
    default_height: default_height
};
