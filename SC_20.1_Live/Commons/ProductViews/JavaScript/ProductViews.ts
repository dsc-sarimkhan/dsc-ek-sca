/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductViews"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as product_views_option_color_tpl from 'product_views_option_color.tpl';
import * as product_views_option_dropdown_tpl from 'product_views_option_dropdown.tpl';
import * as product_views_option_radio_tpl from 'product_views_option_dropdown.tpl';
import * as product_views_option_text_tpl from 'product_views_option_text.tpl';
import * as product_views_option_textarea_tpl from 'product_views_option_textarea.tpl';
import * as product_views_option_email_tpl from 'product_views_option_email.tpl';
import * as product_views_option_phone_tpl from 'product_views_option_phone.tpl';
import * as product_views_option_url_tpl from 'product_views_option_url.tpl';
import * as product_views_option_float_tpl from 'product_views_option_float.tpl';
import * as product_views_option_integer_tpl from 'product_views_option_integer.tpl';
import * as product_views_option_percent_tpl from 'product_views_option_percent.tpl';
import * as product_views_option_currency_tpl from 'product_views_option_currency.tpl';
import * as product_views_option_password_tpl from 'product_views_option_password.tpl';
import * as product_views_option_timeofday_tpl from 'product_views_option_timeofday.tpl';
import * as product_views_option_datetimetz_tpl from 'product_views_option_datetimetz.tpl';
import * as product_views_option_tile_tpl from 'product_views_option_tile.tpl';
import * as product_views_option_checkbox_tpl from 'product_views_option_checkbox.tpl';
import * as product_views_option_date_tpl from 'product_views_option_date.tpl';
import * as product_views_option_facets_color_tpl from 'product_views_option_facets_color.tpl';
import * as product_views_option_facets_tile_tpl from 'product_views_option_facets_tile.tpl';

import Configuration = require('../../Utilities/JavaScript/SC.Configuration');

// @class ProductViews @extends ApplicationModule
const ProductViews: any = {
    // @method mountToApp Initialize the item options configuration related with product view templates
    // @return {Void}
    mountToApp: function mountToApp() {
        const product_view_options_selector = {
            'product_views_option_color.tpl': product_views_option_color_tpl,
            'product_views_option_dropdown.tpl': product_views_option_dropdown_tpl,
            'product_views_option_radio.tpl': product_views_option_radio_tpl,
            'product_views_option_text.tpl': product_views_option_text_tpl,
            'product_views_option_textarea.tpl': product_views_option_textarea_tpl,
            'product_views_option_email.tpl': product_views_option_email_tpl,
            'product_views_option_phone.tpl': product_views_option_phone_tpl,
            'product_views_option_url.tpl': product_views_option_url_tpl,
            'product_views_option_float.tpl': product_views_option_float_tpl,
            'product_views_option_integer.tpl': product_views_option_integer_tpl,
            'product_views_option_percent.tpl': product_views_option_percent_tpl,
            'product_views_option_currency.tpl': product_views_option_currency_tpl,
            'product_views_option_password.tpl': product_views_option_password_tpl,
            'product_views_option_timeofday.tpl': product_views_option_timeofday_tpl,
            'product_views_option_datetimetz.tpl': product_views_option_datetimetz_tpl,
            'product_views_option_tile.tpl': product_views_option_tile_tpl,
            'product_views_option_checkbox.tpl': product_views_option_checkbox_tpl,
            'product_views_option_date.tpl': product_views_option_date_tpl
        };
        const product_view_option_facet = {
            'product_views_option_facets_color.tpl': product_views_option_facets_color_tpl,
            'product_views_option_facets_tile.tpl': product_views_option_facets_tile_tpl
        };
        const item_options = Configuration.get('ItemOptions.optionsConfiguration', []);
        const configuration_default_selector_templates = Configuration.get(
            'ItemOptions.defaultTemplates.selectorByType',
            []
        );
        const default_selector_templates = {};
        let default_template_selector = false;
        const configuration_default_facet_templates = Configuration.get(
            'ItemOptions.defaultTemplates.facetCellByType',
            []
        );
        const default_facet_templates = {};
        let default_template_facet = false;

        _.each(item_options, function(item_option: any) {
            if (
                item_option.templateFacetCell &&
                product_view_option_facet[item_option.templateFacetCell]
            ) {
                item_option.templates = item_option.templates || {};
                item_option.templates.facetCell =
                    product_view_option_facet[item_option.templateFacetCell];
            }

            if (
                item_option.templateSelector &&
                product_view_options_selector[item_option.templateSelector]
            ) {
                item_option.templates = item_option.templates || {};
                item_option.templates.selector =
                    product_view_options_selector[item_option.templateSelector];
            }
        });

        _.each(configuration_default_selector_templates, function(default_selector_template: any) {
            if (product_view_options_selector[default_selector_template.template]) {
                default_selector_templates[default_selector_template.type] =
                    product_view_options_selector[default_selector_template.template];
                default_template_selector = true;
            }
        });

        if (default_template_selector) {
            Utils.setPathFromObject(
                Configuration,
                'ItemOptions.defaultTemplates.selectorByType',
                default_selector_templates
            );
        }

        _.each(configuration_default_facet_templates, function(default_facet_template: any) {
            if (product_view_option_facet[default_facet_template.template]) {
                default_facet_templates[default_facet_template.type] =
                    product_view_option_facet[default_facet_template.template];
                default_template_facet = true;
            }
        });

        if (default_template_facet) {
            Utils.setPathFromObject(
                Configuration,
                'ItemOptions.defaultTemplates.facetCellByType',
                default_facet_templates
            );
        }
    }
};

export = ProductViews;
