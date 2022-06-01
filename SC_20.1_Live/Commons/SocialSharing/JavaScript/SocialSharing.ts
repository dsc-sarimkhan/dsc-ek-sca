/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SocialSharing"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as jQuery from '../../Core/JavaScript/jQuery';

import Configuration = require('../../Utilities/JavaScript/SC.Configuration');
import PluginContainer = require('../../PluginContainer/JavaScript/PluginContainer');
import BrowseView = require('../../Facets/JavaScript/Facets.Browse.View');
import ProductDetailsFullView = require('../../ProductDetails/JavaScript/ProductDetails.Full.View');

// @class SocialSharing Responsible of showing social sharing widgets in a page. It consists on plugin
// containers and each plugin takes care of implementing a particular social network. There are two plugin
// containers one for hooking into afterAppendView and other for afterAppendToDom
// @extends ApplicationModule
const SocialSharing: any = {
    // @method getPopupOptionsStringFromObject
    // {translates: "this", to: ""} to translates=this,to=
    getPopupOptionsStringFromObject: function(popup_options) {
        let popup_options_string = '';

        _.each(popup_options, function(value, name) {
            popup_options_string += ',' + name + '=' + value;
        });

        // the substring is to get rid of the leading coma
        return popup_options_string.substring(1);
    },

    // @method setMetaTagsByConfiguration
    setMetaTagsByConfiguration: function(self, meta_tag_configuration) {
        _.each(meta_tag_configuration, function(fn: Function, name) {
            const content = fn(self);

            jQuery('<meta />', {
                property: name,
                content: content || ''
            }).appendTo(jQuery('head'));
        });
    },

    // @method setLinTagsByConfiguration
    setLinkTagsByConfiguration: function(self, link_tag_configuration) {
        _.each(link_tag_configuration, function(fn: Function, rel) {
            const href = fn(self);

            if (href) {
                jQuery('<link />', {
                    rel: rel,
                    href: href
                }).appendTo(jQuery('head'));
            }
        });
    },

    // @method clearMetaTagsByConfiguration
    clearMetaTagsByConfiguration: function(meta_tag_configuration) {
        let meta_tag;

        _.each(meta_tag_configuration, function(fn, name) {
            meta_tag = jQuery('meta[name="' + name + '"]');
            meta_tag && meta_tag.remove();
        });
    },

    // @method clearLinkTagsByConfiguration
    clearLinkTagsByConfiguration: function(self, link_tag_configuration) {
        let link_tag;

        _.each(link_tag_configuration, function(fn: Function, rel) {
            if (fn(self)) {
                link_tag = jQuery('link[rel="' + rel + '"]');
                link_tag && link_tag.remove();
            }
        });
    },

    // @method setMetaTags Based on the meta tags config
    setMetaTags: function() {
        const self = this;
        const application = this.getApplication();
        const current_view = application.getLayout().currentView;
        const meta_tag_mapping_og = Configuration.metaTagMappingOg;
        const meta_tag_mapping_twitter_product_card =
            Configuration.metaTagMappingTwitterProductCard;
        const meta_tag_mapping_twitter_gallery_card =
            Configuration.metaTagMappingTwitterGalleryCard;
        const link_tag_google_plus_authorship = Configuration.linkTagGooglePlusAuthorship;

        // Clear meta tags if required
        this.clearMetaTagsByConfiguration(meta_tag_mapping_og);
        this.clearMetaTagsByConfiguration(meta_tag_mapping_twitter_product_card);
        this.clearMetaTagsByConfiguration(meta_tag_mapping_twitter_gallery_card);

        if (current_view instanceof ProductDetailsFullView) {
            this.setMetaTagsByConfiguration(self, meta_tag_mapping_og);
            this.setMetaTagsByConfiguration(self, meta_tag_mapping_twitter_product_card);
        } else if (current_view instanceof BrowseView) {
            // Set meta tags for BrowseView
            this.setMetaTagsByConfiguration(self, meta_tag_mapping_twitter_gallery_card);
        }

        // In all pages clear/set Google Plus authorship
        this.clearLinkTagsByConfiguration(self, link_tag_google_plus_authorship);
        this.setLinkTagsByConfiguration(self, link_tag_google_plus_authorship);
    },

    // @property {PluginContainer} afterAppendView
    afterAppendView: new PluginContainer(),

    // @property {PluginContainer} afterAppendToDom
    afterAppendToDom: new PluginContainer(),

    mountToApp: function(application) {
        const self = this;
        const layout = application.getLayout();

        _.extend(layout, {
            getPopupOptionsStringFromObject: this.getPopupOptionsStringFromObject,
            setMetaTags: this.setMetaTags,
            clearLinkTagsByConfiguration: this.clearLinkTagsByConfiguration,
            clearMetaTagsByConfiguration: this.clearMetaTagsByConfiguration,
            setLinkTagsByConfiguration: this.setLinkTagsByConfiguration,
            setMetaTagsByConfiguration: this.setMetaTagsByConfiguration
        });

        layout.on('afterAppendView', function() {
            this.$el.find('[data-type="social-share-icons"]').empty();

            this.setMetaTags();

            if (!Utils.isPageGenerator()) {
                self.afterAppendView.executeAll(application);
            }
        });

        layout.on('afterAppendToDom', function() {
            if (!Utils.isPageGenerator()) {
                self.afterAppendToDom.executeAll(application);
            }
        });
    }
};

export = SocialSharing;
