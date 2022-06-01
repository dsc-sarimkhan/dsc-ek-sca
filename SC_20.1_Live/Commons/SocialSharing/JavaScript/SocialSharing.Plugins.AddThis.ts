/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SocialSharing.Plugins.AddThis"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />

import * as _ from 'underscore';
import * as jQuery from '../../Core/JavaScript/jQuery';

import Configuration = require('../../Utilities/JavaScript/SC.Configuration');
import SocialSharing = require('./SocialSharing');

// @class SocialSharing.AddThis @extends ApplicationModule
const addthisPlugin: any = {
    // @method refreshAddThisElements
    // re-writes the DOM of the AddThis elements
    refreshAddThisElements: function() {
        if (typeof addthis === 'undefined' || !jQuery('[data-type="share-in-add-this"]').length) {
            return;
        }

        const metaTagMappingOg = Configuration.get('metaTagMappingOg');
        let innerHTML = '';

        _.each(Configuration.get('addThis.servicesToShow'), function(name, code) {
            innerHTML += '<a class="addthis_button_' + code + '">' + name + '</a>';
        });

        const share_options = {
            url: metaTagMappingOg['og:url'](this),
            title: metaTagMappingOg['og:title'](this),
            description: metaTagMappingOg['og:description'](this)
        };

        jQuery('[data-type="share-in-add-this"]').each(function() {
            if (this) {
                const $this = jQuery(this);
                $this.html(innerHTML).addClass(Configuration.get('addThis.toolboxClass'));
                addthis.toolbox(this, Configuration.get('addThis.options'), share_options);
            }
        });
    },

    mountToApp: function(application) {
        if (Configuration.get('addThis.enable')) {
            const layout = application.getLayout();

            // This are mostly related to the dom, or to events, so we add them in the layout
            _.extend(layout, {
                refreshAddThisElements: this.refreshAddThisElements,
                addthis_script_loaded: false
            });

            // @class SocialSharing.AddThis.Plugin @extends ApplicationModule
            const plugin = {
                name: 'addthisPlugin',
                priority: 10,
                execute: function(application) {
                    const layout = application.getLayout();

                    if (!jQuery('[data-type="share-in-add-this"]').length) {
                        layout.$el
                            .find('[data-type="social-share-icons"]')
                            .append(
                                '<div href="#" class="add-this-btn" data-type="share-in-add-this"></div>'
                            );
                    }

                    if (jQuery('[data-type="share-in-add-this"]').length) {
                        if (!layout.addthis_script_loaded) {
                            layout.addthis_script_loaded = true;
                            const addthis_script_url =
                                (document.location.protocol === 'https:' ? 'https://' : 'http://') +
                                's7.addthis.com/js/300/addthis_widget.js#domready=1';
                            // avoid on SEO and start addthis library
                            SC.ENVIRONMENT.jsEnvironment === 'browser' &&
                                jQuery.getScript(addthis_script_url, function() {
                                    layout.refreshAddThisElements();
                                });
                        } else {
                            // Then addthis plugins are called
                            layout.refreshAddThisElements();
                        }
                    }
                }
            };

            SocialSharing.afterAppendView.install(plugin);
            SocialSharing.afterAppendToDom.install(plugin);
        }
    }
};

export = addthisPlugin;
