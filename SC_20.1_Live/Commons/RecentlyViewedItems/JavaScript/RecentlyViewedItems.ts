/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="RecentlyViewedItems"/>

import RecentlyViewedItemsView = require('./RecentlyViewedItems.View');
import CartDetailedView = require('../../Cart/JavaScript/Cart.Detailed.View');

const RecentlyViewedItems: any = {
    // @method mountToApp
    // @param {ApplicationSkeleton} application
    // @return {Void}
    mountToApp: function(application) {
        CartDetailedView.addChildViews({
            'RecentlyViewed.Items': function wrapperFunction() {
                return function() {
                    return new RecentlyViewedItemsView({
                        application: application
                    });
                };
            }
        });
    }
};

export = RecentlyViewedItems;
