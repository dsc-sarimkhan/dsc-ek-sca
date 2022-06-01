/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SC.Checkout.Layout"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as checkout_layout_tpl from 'checkout_layout.tpl';

import ConfigurationPromise = require('./SC.Checkout.Configuration');
import ApplicationSkeletonLayout = require('../../../Commons/ApplicationSkeleton/JavaScript/ApplicationSkeleton.Layout');

// @class SCA.Checkout.Layout @extend ApplicationSkeletonLayout
const SCCheckoutLayout: any = ApplicationSkeletonLayout.extend({
    // @propery {Function} template
    template: checkout_layout_tpl,

    // @propery {String} className
    className: 'layout-container',
    // @property {Array} breadcrumbPrefix
    breadcrumbPrefix: [
        {
            href: '#',
            'data-touchpoint': 'home',
            'data-hashtag': '#',
            text: Utils.translate('Home')
        },
        {
            href: '#',
            'data-touchpoint': 'checkout',
            'data-hashtag': '#',
            text: Utils.translate('Checkout')
        }
    ]
});

export = SCCheckoutLayout;
