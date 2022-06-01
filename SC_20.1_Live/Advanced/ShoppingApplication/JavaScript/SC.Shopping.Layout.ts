/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SC.Shopping.Layout"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended.d.ts" />
import '../../../Commons/Utilities/JavaScript/Utils';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import * as shopping_layout_tpl from 'shopping_layout.tpl';

import ApplicationSkeletonLayout = require('../../../Commons/ApplicationSkeleton/JavaScript/ApplicationSkeleton.Layout');

// @class SCA.Shopping.Layout @extends ApplicationSkeleton.Layout
const ShoppingLayout: any = ApplicationSkeletonLayout.extend({
    // @property {Function} template
    template: shopping_layout_tpl,
    // @property {String} className
    className: 'layout-container',

    // @property {Array} breadcrumbPrefix
    breadcrumbPrefix: [
        {
            href: '/',
            'data-touchpoint': 'home',
            'data-hashtag': '#',
            text: Utils.translate('Home')
        }
    ]
});

export = ShoppingLayout;
