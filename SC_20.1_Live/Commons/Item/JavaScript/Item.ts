/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Item"/>
import * as _ from 'underscore';

import Configuration = require('../../Utilities/JavaScript/SC.Configuration');

const ItemModule = {
    mountToApp: function(application) {
        // Make of itemOptions color property a object with the color name as
        // the property and the color value as the value of the property.
        const item_options_with_color = _.filter(
            Configuration.get('ItemOptions.optionsConfiguration', []),
            function(item_option_config: any) {
                return !!item_option_config.colors;
            }
        );
        const clean_setting = function(item_option, setting_key) {
            if (item_option && item_option[setting_key] === '') {
                delete item_option[setting_key];
                return true;
            }
            return false;
        };

        _.each(item_options_with_color || [], function(item_option) {
            item_option.colors = application.getLayout().getColorPalette(item_option.colors);
        });

        // Clean empty settings. These values are optional, when you in the NetSuite interface do not specify nothing
        // they come empty, so for those cases we deleted them so when the Item.Model getPossibleOptions method is executed
        // the default values are NOT overwritten with empty.
        _.each(Configuration.get('ItemOptions.optionsConfiguration', []), function(
            item_option_configuration
        ) {
            clean_setting(item_option_configuration, 'colors');
            clean_setting(item_option_configuration, 'label');
            clean_setting(item_option_configuration, 'urlParameterName');
            clean_setting(item_option_configuration, 'index');
        });
    }
};

export = ItemModule;
