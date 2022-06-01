/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ItemRelations" />

import ItemRelationsRelatedView = require('./ItemRelations.Related.View');
import ItemRelationsCorrelatedView = require('./ItemRelations.Correlated.View');
import CartDetailedView = require('../../Cart/JavaScript/Cart.Detailed.View');

const ItemRelations = {
    // @method mountToApp
    // @param {ApplicationSkeleton} application
    // @return {Void}
    mountToApp: function(application) {
        CartDetailedView.addChildViews({
            'Correlated.Items': function wrapperFunction(options) {
                return function() {
                    return new ItemRelationsCorrelatedView({
                        itemsIds: options.model.getItemsIds(),
                        application: application
                    });
                };
            },
            'Related.Items': function wrapperFunction(options) {
                return function() {
                    return new ItemRelationsRelatedView({
                        itemsIds: options.model.getItemsIds(),
                        application: application
                    });
                };
            }
        });
    }
};

export = ItemRelations;
