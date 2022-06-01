/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Footer.View"/>

import * as footer_tpl from 'footer.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import GlobalViewsBackToTopView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.BackToTop.View');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class Footer.View @extends BackboneView
const FooterView: any = BackboneView.extend({
    template: footer_tpl,

    initialize: function(options) {
        this.application = options.application;

        BackboneCompositeView.add(this);

        // after appended to DOM, we add the footer height as the content bottom padding, so the footer doesn't go on top of the content
        // wrap it in a setTimeout because if not, calling height() can take >150 ms in slow devices - forces the browser to re-compute the layout.
        this.application.getLayout().on('afterAppendToDom', function() {
            const headerMargin = 25;

            setTimeout(function() {
                const contentHeight: number =
                    jQuery(window).innerHeight() -
                    jQuery('#site-header')[0].offsetHeight -
                    headerMargin -
                    jQuery('#site-footer')[0].offsetHeight;
                jQuery('#main-container').css('min-height', contentHeight);
            }, 10);
        });
    },

    childViews: {
        'Global.BackToTop': function() {
            return new GlobalViewsBackToTopView();
        }
    },

    // @method getContext @return {Footer.View.Context}
    getContext: function() {
        const footerNavigationLinks = Configuration.get('footer.navigationLinks', []);

        // @class Footer.View.Context
        return {
            // @property {Boolean} showLanguages
            showFooterNavigationLinks: !!footerNavigationLinks.length,
            // @property {Array<Object>} footerNavigationLinks - the object contains the properties name:String, href:String
            footerNavigationLinks: footerNavigationLinks
        };
        // @class Footer.View
    }
});

export = FooterView;
