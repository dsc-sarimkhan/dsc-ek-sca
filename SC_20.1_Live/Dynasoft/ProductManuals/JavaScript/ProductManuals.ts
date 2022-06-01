/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductManuals"/>
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import ProductManualsView = require('./ProductManuals.View');

// @class Home @extends ApplicationModule
export = {
    mountToApp: function(application) {
        const pageType = application.getComponent('PageType');

        pageType.registerPageType({
            name: 'product-manuals',
            routes: ['productmanuals'],
            view: ProductManualsView,
            defaultTemplate: {
                name: 'productmanuals.tpl',
                displayName: 'Product Manuals',
                thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                    'img/default-layout-home.png'
                )
            }
        });
    }
};
