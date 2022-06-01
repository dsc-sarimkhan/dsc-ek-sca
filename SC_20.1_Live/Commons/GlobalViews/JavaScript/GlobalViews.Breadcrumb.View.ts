/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="GlobalViews.Breadcrumb.View"/>

import * as _ from 'underscore';
import * as global_views_breadcrumb_tpl from 'global_views_breadcrumb.tpl';
import { JSONObject } from '../../Utilities/JavaScript/Utils.Interfaces';
import {
    WebPage as JsonldWebPage,
    ListItem as JsonldListItem,
    BreadcrumbList as JsonldBreadcrumbList
} from '../../../node_modules/schema-dts/schema';
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');
import jQuery = require('../../Core/JavaScript/jQuery');
import Configuration = require('../../Utilities/JavaScript/SC.Configuration');

// @class GlobalViews.Breadcrumb.View @extends Backbone.View
const GlobalViewsBreadcrumbView = BackboneView.extend({
    template: global_views_breadcrumb_tpl,

    initialize: function(options): void {
        const opt_pages = options.pages;

        if (_.isUndefined(opt_pages)) {
            this.pages = [];
        } else if (_.isArray(opt_pages)) {
            this.pages = opt_pages;
        } else {
            this.pages = [opt_pages];
        }
    },

    // @method Create JsonLd object with Breadcrumb info
    // @return {JQuery.Deferred<JsonldWebPage>}
    getJsonLd: function getJsonLd(): JQuery.Deferred<JsonldWebPage> {
        if (Configuration.get('structureddatamarkup.type') !== 'JSON-LD' || !this.pages.length) {
            return jQuery.Deferred().resolve(null);
        }
        const jsonLdBreadcrumb: JsonldBreadcrumbList = {
            '@type': 'BreadcrumbList',
            itemListElement: []
        };

        const { origin } = window.location;
        const jsonLditemListElement: JsonldListItem[] = _.map(
            this.pages,
            (element: JSONObject, index: number): JsonldListItem => {
                return {
                    '@type': 'ListItem',
                    name: element.text.toString(),
                    position: index + 1,
                    item: origin + element.href
                };
            }
        );
        jsonLdBreadcrumb.itemListElement = jsonLditemListElement;

        // Get WebPage
        const jsonLd: JsonldWebPage = {
            '@type': 'WebPage',
            breadcrumb: jsonLdBreadcrumb
        };

        // Get Breadcrumb
        return jQuery.Deferred().resolve(jsonLd);
    },

    // @method getContext @return GlobalViews.Breadcrumb.View.Context
    getContext: function getContext(): any {
        _.each(
            this.pages,
            (page: any): void => {
                if (page['data-touchpoint']) {
                    page.hasDataTouchpoint = true;
                }

                if (page['data-hashtag']) {
                    page.hasDataHashtag = true;
                }
            }
        );

        // @class GlobalViews.Breadcrumb.View.Context
        return {
            // @property {Array<Object>} pages
            pages: this.pages
        };
    }
});

export = GlobalViewsBreadcrumbView;
