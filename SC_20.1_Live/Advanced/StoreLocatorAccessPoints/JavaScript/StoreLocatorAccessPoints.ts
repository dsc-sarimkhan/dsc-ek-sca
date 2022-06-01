/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="StoreLocatorAccessPoints"/>

import ReferenceConfiguration = require('../../StoreLocatorReferenceMapImplementation/JavaScript/ReferenceMap.Configuration');
import StoreLocatorWizardHeaderLinkView = require('./StoreLocatorAccessPoints.HeaderLink.View');
import HeaderView = require('../../Header/JavaScript/Header.View');
import HeaderMenuView = require('../../Header/JavaScript/Header.Menu.View');

// @class StoreLocatorAccessPoints @extend ApplicationModule
const StoreLocatorAccessPoints: any = {
    // @method mountToApp
    // @param {ApplicationSkeleton} application
    // @return {Void}
    mountToApp: function() {
        if (!ReferenceConfiguration.isEnabled()) {
            return;
        }

        HeaderView.addChildViews &&
            HeaderView.addChildViews({
                StoreLocatorHeaderLink: function wrapperFunction() {
                    return function() {
                        return new StoreLocatorWizardHeaderLinkView({});
                    };
                }
            });

        HeaderMenuView.addChildViews &&
            HeaderMenuView.addChildViews({
                StoreLocatorHeaderLink: function wrapperFunction() {
                    return function() {
                        return new StoreLocatorWizardHeaderLinkView({
                            className: ' '
                        });
                    };
                }
            });
    }
};

export = StoreLocatorAccessPoints;
