/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SocialSharing.Flyout.Hover.View"/>

import * as social_sharing_flyout_hover_tpl from 'social_sharing_flyout_hover.tpl';

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// @class SocialSharing.Flyout.Hover.View @extends Backbone.View
const SocialSharingFlyoutHoverView: any = BackboneView.extend({
    template: social_sharing_flyout_hover_tpl,

    // @method getContext @returns {SocialSharing.Flyout.Hover.View.Context}
    getContext: function() {
        // @class SocialSharing.Flyout.Hover.View.Context
        return {};
    }
});

export = SocialSharingFlyoutHoverView;
