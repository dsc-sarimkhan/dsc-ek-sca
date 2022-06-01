/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SocialSharing.Plugins.Facebook"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as jQuery from '../../Core/JavaScript/jQuery';

import Configuration = require('../../Utilities/JavaScript/SC.Configuration');
import UrlHelper = require('../../UrlHelper/JavaScript/UrlHelper');
import SocialSharing = require('./SocialSharing');

// @class SocialSharing.Facebook @extends ApplicationModule
const facebookPlugin: any = {
    shareInFacebookEventListener: function() {
        const url = window.location.href;
        const popup_options_string = this.getPopupOptionsStringFromObject(
            Configuration.get('facebook.popupOptions')
        );
        const target_url =
            'https://www.facebook.com/dialog/share?display=popup&app_id=' +
            Configuration.get('facebook.appId') +
            '&href=' +
            encodeURIComponent(url) +
            '&redirect_uri=' +
            encodeURIComponent(Utils.addParamsToUrl(url, { closeFBPopup: 1 }));

        window.open(target_url, _.uniqueId('window'), popup_options_string);
    },

    mountToApp: function(application) {
        // This will close the popup window after the redirect occurs (after the user shares).
        UrlHelper.addTokenListener('closeFBPopup', function() {
            window.close();
        });

        if (Configuration.get('facebook.enable')) {
            const layout = application.getLayout();

            // This are mostly related to the dom, or to events, so we add them in the layout
            _.extend(layout.events, {
                'click [data-action="share-in-facebook"]': this.shareInFacebookEventListener
            });

            // @class SocialSharing.Facebook.Plugin this plugin is installed in both
            // SocialSharing.afterAppendView and SocialSharing.afterAppendToDom @extends Plugin
            const plugin = {
                name: 'facebookPlugin',
                priority: 10,
                execute: function(application) {
                    const layout = application.getLayout();

                    if (!jQuery('[data-type="like-in-facebook"]').length) {
                        layout.$el
                            .find('[data-type="social-share-icons"]')
                            .append(
                                '<a href="#" class="social-sharing-flyout-content-social-facebook" data-action="share-in-facebook"><i class="social-sharing-flyout-content-social-facebook-icon"></i> <span>Share</span></a>'
                            );
                    }
                }
            };

            SocialSharing.afterAppendView.install(plugin);
            SocialSharing.afterAppendToDom.install(plugin);
        }
    }
};

export = facebookPlugin;
