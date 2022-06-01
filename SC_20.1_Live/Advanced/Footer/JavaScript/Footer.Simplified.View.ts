/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Footer.Simplified.View"/>

import '../../SCA/JavaScript/SC.Configuration';
import * as footer_simplified_tpl from 'footer_simplified.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import GlobalViewsBackToTopView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.BackToTop.View');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class Footer.Simplified.View @extends Backbone.View
const FooterSimplifiedView = BackboneView.extend({
    // @property {Function} template
    template: footer_simplified_tpl,
    // @method initialize
    initialize: function(options) {
        this.application = options.application;

        BackboneCompositeView.add(this);

        this.application.getLayout().on('afterAppendView', function() {
            // after appended to DOM, we add the footer height as the content bottom padding, so the footer doesn't go on top of the content
            const footer_height = this.$el.find('#site-footer').height();
            if (footer_height) {
                this.$el.find('#content').css('padding-bottom', footer_height);
            }

            // Please note that this solution is taken from this view relative 'Footer.View', and its way to solve sticky footer behavior.
            // Also see the comments there as they apply to here as well.
            setTimeout(function() {
                const headerMargin: number = parseInt(jQuery('#site-header').css('marginBottom'));
                const contentHeight: number =
                    jQuery(window).innerHeight() -
                    jQuery('#site-header')[0].offsetHeight -
                    headerMargin -
                    jQuery('#site-footer')[0].offsetHeight;
                jQuery('#main-container').css('min-height', contentHeight);
            }, 10);
        });
    },
    // @property {Object} childViews
    childViews: {
        'Global.BackToTop': function() {
            return new GlobalViewsBackToTopView();
        }
    }
});

export = FooterSimplifiedView;
