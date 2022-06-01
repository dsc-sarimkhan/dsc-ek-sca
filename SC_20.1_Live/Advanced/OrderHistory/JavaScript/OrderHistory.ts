/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderHistory"/>
// Implements the experience of seeing all the customer Orders experience, this is the 'Order History' experience in MyAccount. Includes the Order module (Model, Collection, Views, Router);
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import OrderHistoryListView = require('./OrderHistory.List.View');
import OrderHistoryDetailsView = require('./OrderHistory.Details.View');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');

// @class OrderHistory @extends ApplicationModule
const OrderHistory: any = {
    // @method mountToApp
    mountToApp: function(application) {
        const pageType = application.getComponent('PageType');
        const routes = [
            'purchases',
            'purchases?:options',
            'open-purchases',
            'open-purchases?:options'
        ];
        if (Configuration.get('siteSettings.isSCISIntegrationEnabled', false)) {
            routes.push('instore-purchases');
            routes.push('instore-purchases?:options');
        }
        pageType.registerPageType({
            name: 'PurchaseHistory',
            routes: routes,
            view: OrderHistoryListView,
            defaultTemplate: {
                name: 'order_history_list.tpl',
                displayName: 'Purchase history default',
                thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                    'img/default-layout-transaction-list.png'
                )
            }
        });
        pageType.registerPageType({
            name: 'PurchaseDetail',
            routes: ['purchases/view/:recordtype/:id'],
            view: OrderHistoryDetailsView,
            defaultTemplate: {
                name: 'order_history_details.tpl',
                displayName: 'Purchase history details default',
                thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                    'img/default-layout-purchase-detail.png'
                )
            }
        });
    }
};

export = OrderHistory;
