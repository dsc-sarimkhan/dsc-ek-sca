/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Transaction.Line.Views"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as transaction_line_views_selected_option_tpl from 'transaction_line_views_selected_option.tpl';
import * as transaction_line_views_selected_option_color_tpl from 'transaction_line_views_selected_option_color.tpl';

import Configuration = require('../../Utilities/JavaScript/SC.Configuration');

const TransactionLineViews: any = {
    // @method mountToApp Initialize the item options configuration related with transaction lines
    // @return {Void}
    mountToApp: function() {
        const transaction_line_view_options_selected = {
            'transaction_line_views_selected_option.tpl': transaction_line_views_selected_option_tpl,
            'transaction_line_views_selected_option_color.tpl': transaction_line_views_selected_option_color_tpl
        };
        const item_options = Configuration.get('ItemOptions.optionsConfiguration', []);
        const configuration_default_selected_templates = Configuration.get(
            'ItemOptions.defaultTemplates.selectedByType',
            []
        );
        const default_selected_templates = {};
        let default_template_selected = false;

        _.each(item_options, function(item_option: any) {
            if (
                item_option.templateSelected &&
                transaction_line_view_options_selected[item_option.templateSelected]
            ) {
                item_option.templates = item_option.templates || {};
                item_option.templates.selected =
                    transaction_line_view_options_selected[item_option.templateSelected];
            }
        });

        _.each(configuration_default_selected_templates, function(default_selected_template: any) {
            if (transaction_line_view_options_selected[default_selected_template.template]) {
                default_selected_templates[default_selected_template.type] =
                    transaction_line_view_options_selected[default_selected_template.template];
                default_template_selected = true;
            }
        });

        if (default_template_selected) {
            Utils.setPathFromObject(
                Configuration,
                'ItemOptions.defaultTemplates.selectedByType',
                default_selected_templates
            );
        }
    }
};

export = TransactionLineViews;
