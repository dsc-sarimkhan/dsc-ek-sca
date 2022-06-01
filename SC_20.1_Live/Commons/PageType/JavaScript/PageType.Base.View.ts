/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PageType.Base.View"/>

import * as Utils from '../../Utilities/JavaScript/Utils';
import * as jQuery from '../../Core/JavaScript/jQuery';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @module PageType

// @class PageType.Base.View @extends Backbone.View
// Base PageType class from where all the PageType Views extend from
export = {
    PageTypeBaseView: BackboneView.extend({
        constructor: function initialize(options) {
            // adapt to a acceptable format for extensibility layer
            options.pageInfo = {
                name: options.pageInfo.get('name'),
                url: options.pageInfo.get('urlPath'),
                header: options.pageInfo.get('page_header'),
                title: options.pageInfo.get('page_title'),
                fields: options.pageInfo.get('fields')
            };
            BackboneView.apply(this, arguments);
            // this method is needed by core to render proper breadcrumb, it should not be overwritten
            this.getBreadcrumbPages = function getBreadcrumbPages() {
                const { pageInfo } = options;
                const { url } = pageInfo;
                const path = Utils.correctURL(url);

                return [{ href: path, text: pageInfo.title || pageInfo.header }];
            };
        },
        // @method beforeShowContent
        // The method 'showContent' will be executed only after the returned promise is resolved
        // @return {jQuery.Deferred}
        beforeShowContent: function beforeShowContent() {
            return jQuery.Deferred().resolve();
        }
    })
};
