/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="StoreLocatorAccessPoints.HeaderLink.View"/>

import * as storelocator_accesspoints_headerlink_tpl from 'storelocator_accesspoints_headerlink.tpl';

import ReferenceConfiguration = require('../../StoreLocatorReferenceMapImplementation/JavaScript/ReferenceMap.Configuration');

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');

// @class StoreLocatorAccessPoints.HeaderLink.View @extend Backbone.View
const StoreLocatorAccessPointsHeaderLinkView: any = BackboneView.extend({
    // @property {Function} template
    template: storelocator_accesspoints_headerlink_tpl,

    // @method getContext
    // @return {StoreLocatorAccessPoints.HeaderLink.View.Context}
    getContext: function() {
        // @class StoreLocatorAccessPoints.HeaderLink.View.Context
        return {
            // @Property {String} title
            title: ReferenceConfiguration.title(),
            // @property {Boolean} hasClass
            hasClass: !!this.options.className,
            // @property {String} className
            className: this.options.className,
            // @property {String} touchpoint
            touchpoint: Configuration.get('siteSettings.isHttpsSupported') ? 'home' : 'storelocator'
        };
        // @class StoreLocatorAccessPoints.HeaderLink.View
    }
});

export = StoreLocatorAccessPointsHeaderLinkView;
