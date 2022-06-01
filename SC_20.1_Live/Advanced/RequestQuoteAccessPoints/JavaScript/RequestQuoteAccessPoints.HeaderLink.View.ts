/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="RequestQuoteAccessPoints.HeaderLink.View"/>

import * as requestquote_accesspoints_headerlink_tpl from 'requestquote_accesspoints_headerlink.tpl';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class RequestQuoteAccessPoints.HeaderLink.View @extend Backbone.View
const RequestQuoteAccessPointsHeaderLinkView: any = BackboneView.extend({
    // @property {Function} template
    template: requestquote_accesspoints_headerlink_tpl,

    // @method getContext
    // @return {RequestQuoteAccessPoints.HeaderLink.View.Context}
    getContext: function() {
        // @class RequestQuoteAccessPoints.HeaderLink.View.Context
        return {
            // @property {Boolean} hasClass
            hasClass: !!this.options.className,
            // @property {String} className
            className: this.options.className,
            // @property {Boolean} showTitle
            showTitle: Configuration.get('quote.showHyperlink'),
            // @property {String} title
            title: Configuration.get('quote.textHyperlink')
        };
        // @class RequestQuoteAccessPoints.HeaderLink.View
    }
});

export = RequestQuoteAccessPointsHeaderLinkView;
