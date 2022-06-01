/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductManuals.View"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended.d.ts"/>
import * as _ from 'underscore';
import * as productmanuals_tpl from 'productmanuals.tpl';
import '../../DSCUtilities/JavaScript/jQuery.datatables';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import Url = require('../../../Commons/Utilities/JavaScript/Url');
// @module Home.View @extends Backbone.View
let content = '';
const ProductManualsView: any = BackboneView.extend({
    template: productmanuals_tpl,

    title: Utils.translate('Product Manuals'),

    page_header: Utils.translate('Product Manuals'),

    attributes: {
        id: 'product-manuals',
        class: 'product-manuals'
    },

    events: {
    },

    initialize: function(options) {
        this.application = options.application;

        // get product manuals attachments
        jQuery.ajax({
            url: Utils.getAbsoluteUrl('services/StoreAttachment.Service.ss'),
            type: 'get',
            async: false,
            success: function (data) {
                data = _.map(data, function (attachment) {
                    attachment['file_url'] = location.origin + attachment['file_url'];
                    return attachment;
                });
                content = data.length > 0 ? data : "No Data";
            }
        });

    },
    getSelectedMenu: function() {
        return 'productanuals';
    },
    // @method getBreadcrumbPages
    getBreadcrumbPages: function() {
        return {
            text: this.title,
            href: '/productanuals'
        };
    },

    // @method getContext @return ProductManuals.View.Context
    getContext: function() {
        return {
            content: content
        };
    }
});

export = ProductManualsView;