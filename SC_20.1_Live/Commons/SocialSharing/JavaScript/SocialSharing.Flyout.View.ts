/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SocialSharing.Flyout.View"/>

import * as social_sharing_flyout_tpl from 'social_sharing_flyout.tpl';

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// @class SocialSharing.Flyout.View @extends Backbone.View
const SocialSharingFlyoutView: any = BackboneView.extend({
    template: social_sharing_flyout_tpl,

    // @method getContext @returns {SocialSharing.Flyout.View.Context}
    getContext: function() {
        // @class SocialSharing.Flyout.View.Context
        return {
            // @property {SiteSearch.Model} model
            // model: this.model
        };
    }
});

export = SocialSharingFlyoutView;
