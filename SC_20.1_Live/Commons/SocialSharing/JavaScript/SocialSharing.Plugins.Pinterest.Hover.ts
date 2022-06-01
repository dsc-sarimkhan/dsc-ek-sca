/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SocialSharing.Plugins.Pinterest.Hover"/>

import * as _ from 'underscore';
import * as jQuery from '../../Core/JavaScript/jQuery';

import Configuration = require('../../Utilities/JavaScript/SC.Configuration');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// @class SocialSharing.Pinterest.Hover @extends ApplicationModule
const pinterestPluginHover: any = {
    // @method shareInPinterest
    // opens a new window to share the page in Pinterest
    // based on some configuration options
    shareInPinterest: function(url, image, description, popup_options) {
        const popup_options_string = this.getPopupOptionsStringFromObject(
            popup_options || Configuration.get('pinterest.popupOptions')
        );
        const target_url =
            'http://pinterest.com/pin/create/button/?url=' +
            encodeURIComponent(url) +
            '&media=' +
            encodeURIComponent(image) +
            '&description=' +
            encodeURIComponent(description);

        window.open(target_url, _.uniqueId('window'), popup_options_string);
    },

    // @method shareInPinterestHoverEventListener
    // calls shareInPinterestHoverEventListener method passing the configuration options
    shareInPinterestHoverEventListener: function(e) {
        e.preventDefault();

        const image_size = Configuration.get('pinterest.imageSize');
        const metaTagMappingOg = Configuration.get('metaTagMappingOg');
        const url = metaTagMappingOg['og:url'](this);
        let image =
            jQuery('a.bx-pager-link.active')
                .find('img')
                .attr('src') ||
            jQuery('a.bx-pager-link')
                .eq(0)
                .find('img')
                .attr('src'); // selected image
        const title = metaTagMappingOg['og:title'](this);

        if (!image) {
            image = jQuery('.product-details-image-gallery-detailed-image')
                .find('img')
                .attr('src');
        }

        image = this.getApplication().resizeImage(image.split('?')[0], image_size);

        this.shareInPinterest(url, image, title);
    },

    mountToApp: function(application) {
        if (Configuration.get('pinterest.enableHover')) {
            const layout = application.getLayout();

            // This are mostly related to the dom, or to events, so we add them in the layout
            _.extend(layout, {
                shareInPinterest: this.shareInPinterest
            });

            // extend Layout and add event listeners
            _.extend(layout.events, {
                'click [data-action="share-in-pinterest-hover"]': this
                    .shareInPinterestHoverEventListener
            });

            // @class SocialSharing.Pinterest.Plugin @extends Plugin
            BackboneView.postRender.install({
                name: 'pinterestPluginHover',
                priority: 10,
                execute: function($el) {
                    if (!$el.find('[data-action="share-in-pinterest-hover"]').length) {
                        $el.find('[data-type="social-share-icons-hover"]').append(
                            '<a href="#" class="social-sharing-flyout-content-social-pinterest" data-action="share-in-pinterest-hover"><i class="social-sharing-flyout-content-social-pinterest-icon"></i> Pinit</a>'
                        );
                    }
                }
            });
        }
    }
};

export = pinterestPluginHover;
