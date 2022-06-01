/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="GlobalViews.BackToTop.View"/>

import * as global_views_back_to_top_tpl from 'global_views_back_to_top.tpl';
import * as jQuery from '../../Core/JavaScript/jQuery';

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// @class GlobalViews.BackToTop.View @extends Backbone.View
const GlobalViewsBackToTopView: any = BackboneView.extend({
    template: global_views_back_to_top_tpl,

    events: {
        'click [data-action="back-to-top"]': 'backToTop'
    },

    // @method backToTop
    backToTop: function() {
        jQuery('html, body').animate({ scrollTop: '0px' }, 300);
    }
});

export = GlobalViewsBackToTopView;
