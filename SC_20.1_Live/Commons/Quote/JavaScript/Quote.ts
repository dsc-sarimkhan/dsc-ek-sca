/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Quote"/>
/// <reference path="../../Utilities/JavaScript/UnderscoreExtended.d.ts" />

import * as Utils from '../../Utilities/JavaScript/Utils';

import QuoteListView = require('./Quote.List.View');
import QuoteDetailsView = require('./Quote.Details.View');

const QuoteModule: any = (function() {
    // @method mountToApp
    // @param {ApplicationSkeleton} application
    // @return {QuoteRouter} Returns an instance of the quote router used by the current module
    const mountToApp = function(application) {
        const pageType = application.getComponent('PageType');

        pageType.registerPageType({
            name: 'QuotesHistory',
            routes: ['quotes', 'quotes?:options'],
            view: QuoteListView,
            defaultTemplate: {
                name: 'quote_list.tpl',
                displayName: 'Quotes default',
                thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                    'img/default-layout-transaction-list.png'
                )
            }
        });

        pageType.registerPageType({
            name: 'QuotesDetail',
            routes: ['quotes/:id'],
            view: QuoteDetailsView,
            defaultTemplate: {
                name: 'quote_details.tpl',
                displayName: 'Quotes details default',
                thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                    'img/default-layout-quote-details.png'
                )
            }
        });
    };

    return {
        mountToApp: mountToApp
    };
})();

export = QuoteModule;
