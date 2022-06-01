/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CookieWarningBanner"/>
// @module CookieWarningBanner
// Handles the display of the banner to be displayed warning the customers about the site's use of cookies

import HeaderView = require('../../Header/JavaScript/Header.View');
import CookieWarningBannerView = require('./CookieWarningBanner.View');

// @class CookieWarningBanner
// @extends ApplicationModule
const CookieWarningBanner: any = {
    mountToApp: function(application) {
        // Set the request a quote link on the Desktop header
        HeaderView.addChildViews({
            'Message.Placeholder': function wrapperFunction() {
                return function() {
                    return new CookieWarningBannerView({ application: application });
                };
            }
        });
    }
};

export = CookieWarningBanner;
