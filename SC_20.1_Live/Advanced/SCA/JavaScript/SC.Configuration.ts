/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SC.Configuration"/>
import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import * as product_views_option_radio_tpl from 'product_views_option_radio.tpl';
import * as product_views_option_tile_tpl from 'product_views_option_tile.tpl';
import * as product_views_option_text_tpl from 'product_views_option_text.tpl';
import * as product_views_option_color_tpl from 'product_views_option_color.tpl';
import * as product_views_option_dropdown_tpl from 'product_views_option_dropdown.tpl';
import * as product_views_option_facets_color_tpl from 'product_views_option_facets_color.tpl';
import * as product_views_option_facets_tile_tpl from 'product_views_option_facets_tile.tpl';
import * as transaction_line_views_selected_option_tpl from 'transaction_line_views_selected_option.tpl';
import * as transaction_line_views_selected_option_color_tpl from 'transaction_line_views_selected_option_color.tpl';

// @module SC
// @class SC.Configuration
// This class is responsible of creating the front end SC.Configuration object from the properties bootstrapped in SC.CONFIGURATION from backend. Also it does some properties post processing.

const baseConfiguration = SC.CONFIGURATION || {};

baseConfiguration.ItemOptions = baseConfiguration.ItemOptions || {};

baseConfiguration.ItemOptions.defaultTemplates = baseConfiguration.ItemOptions.defaultTemplates || {
    // @class ItemOptions.DefaultTemplates
    // @property {DefaultOptionTemplateSpecification} selectorByType
    // each apply to specific item option types
    selectorByType: {
        select: product_views_option_tile_tpl,
        default: product_views_option_text_tpl
    },
    // for rendering selected options in the shopping cart
    selectedByType: {
        default: transaction_line_views_selected_option_tpl
    },
    facetCellByType: {
        default: product_views_option_facets_color_tpl
    }
};

const item_option_templates = {
    'transaction_line_views_selected_option_color.tpl': transaction_line_views_selected_option_color_tpl,
    'transaction_line_views_selected_option.tpl': transaction_line_views_selected_option_tpl,

    'product_views_option_color.tpl': product_views_option_color_tpl,
    'product_views_option_dropdown.tpl': product_views_option_dropdown_tpl,
    'product_views_option_radio.tpl': product_views_option_radio_tpl,
    'product_views_option_text.tpl': product_views_option_text_tpl,
    'product_views_option_tile.tpl': product_views_option_tile_tpl,

    'product_views_option_facets_color.tpl': product_views_option_facets_color_tpl,
    'product_views_option_facets_tile.tpl': product_views_option_facets_tile_tpl
};

_.each(baseConfiguration.ItemOptions.optionsConfiguration || [], function(item_option: any) {
    if (item_option.templateSelected && item_option_templates[item_option.templateSelected]) {
        item_option.templates = item_option.templates || {};
        item_option.templates.selected = item_option_templates[item_option.templateSelected];
    }

    if (item_option.templateSelector && item_option_templates[item_option.templateSelector]) {
        item_option.templates = item_option.templates || {};
        item_option.templates.selector = item_option_templates[item_option.templateSelector];
    }

    if (item_option.templateFacetCell && item_option_templates[item_option.templateFacetCell]) {
        item_option.templates = item_option.templates || {};
        item_option.templates.facetCell = item_option_templates[item_option.templateFacetCell];
    }
});

var Configuration = {
    searchPrefs: {
        // Keyword formatter function will format the text entered by the user in the search box. This default implementation will remove invalid keyword characters like *()+-="
        keywordsFormatter: function(keywords) {
            if (keywords === '||') {
                return '';
            }

            const anyLocationRegex = /[\(\)\[\]\{\~\}\!\"\:\/]{1}/g; // characters that cannot appear at any location
            const beginingRegex = /^[\*\-\+]{1}/g; // characters that cannot appear at the begining
            const replaceWith = ''; // replacement for invalid chars

            return keywords
                .replace(anyLocationRegex, replaceWith)
                .replace(beginingRegex, replaceWith);
        }
    },

    bxSliderDefaults: {
        minSlides: 2,
        slideWidth: 228,
        maxSlides: 5,
        forceStart: true,
        pager: false,
        touchEnabled: true,
        nextText:
            '<a class="item-relations-related-carousel-next"><span class="control-text">' +
            Utils.translate('next') +
            '</span> <i class="carousel-next-arrow"></i></a>',
        prevText:
            '<a class="item-relations-related-carousel-prev"><i class="carousel-prev-arrow"></i> <span class="control-text">' +
            Utils.translate('prev') +
            '</span></a>',
        controls: true,
        preloadImages: 'all'
    },

    siteSettings: (SC && SC.ENVIRONMENT && SC.ENVIRONMENT.siteSettings) || {},

    get: function(path, defaultValue) {
        return Utils.getPathFromObject(this, path, defaultValue);
    },

    getRegistrationType: function(): string {
        // registrationmandatory is 'T' when customer registration is disabled
        if (Configuration.get('siteSettings.registration.registrationmandatory', null) === 'T') {
            // no login, no register, checkout as guest only
            return 'disabled';
        }
        if (Configuration.get('siteSettings.registration.registrationoptional', null) === 'T') {
            // login, register, guest
            return 'optional';
        }
        if (Configuration.get('siteSettings.registration.registrationallowed', null) === 'T') {
            // login, register, no guest
            return 'required';
        }
        // login, no register, no guest
        return 'existing';
    }
};

// Deep extend
jQuery.extend(true, baseConfiguration, Configuration);

// BACKWARDS COMPATIBILITY: all the following is a normalization to the object baseConfiguration to guarantee backguard compatibility with pre montblanc in the sense of configuration property names in application.getConfig('foo')

// fixing some properties for backward compatibility w montblanc:
const imageSizeMapping = {};

_.each(baseConfiguration.imageSizeMapping, function(item: any) {
    imageSizeMapping[item.id] = item.value;
});

baseConfiguration.imageSizeMapping = imageSizeMapping;

const searchApiMasterOptions = {};

_.each(baseConfiguration.searchApiMasterOptions, function(item: any) {
    searchApiMasterOptions[item.id] = {
        fieldset: item.fieldset,
        include: item.include
    };
});

baseConfiguration.searchApiMasterOptions = searchApiMasterOptions;
// social sharing backward compatibility

const addThisOptions = {};

_.each(baseConfiguration.addThis && baseConfiguration.addThis.options, function(item: any) {
    addThisOptions[item.key] = item.value;
});

baseConfiguration.addThis && (baseConfiguration.addThis.options = addThisOptions);

const addThisServicesToShow = {};

_.each(baseConfiguration.addThis && baseConfiguration.addThis.servicesToShow, function(item: any) {
    addThisServicesToShow[item.key] = item.value;
});

baseConfiguration.addThis && (baseConfiguration.addThis.servicesToShow = addThisServicesToShow);

_.each(baseConfiguration.paymentmethods, function(item: any) {
    try {
        if (item.regex) {
            item.regex = new RegExp(item.regex);
        }
    } catch (ex) {}
});

if (baseConfiguration.productReviews && baseConfiguration.productReviews.sortOptions) {
    _.each(baseConfiguration.productReviews.sortOptions, function(sortOptions: any) {
        try {
            sortOptions.params = JSON.parse(sortOptions.params || '{}') || {};
        } catch (ex) {}
    });
}
if (baseConfiguration.productReviews && baseConfiguration.productReviews.filterOptions) {
    _.each(baseConfiguration.productReviews.filterOptions, function(filterOptions: any) {
        try {
            filterOptions.params = JSON.parse(filterOptions.params || '{}') || {};
        } catch (ex) {}
    });
}

// extraTranslations
const currentLocale =
    SC && SC.ENVIRONMENT && SC.ENVIRONMENT.currentLanguage && SC.ENVIRONMENT.currentLanguage.locale;
_.each(baseConfiguration.extraTranslations, function(item: any) {
    if (SC.Translations && item[currentLocale]) {
        SC.Translations[item.key] = item[currentLocale];
    }
});

// navigation data
baseConfiguration.navigationData = baseConfiguration.navigationData || [];

// navigation hierarchy bindings.
_.each(baseConfiguration.navigationData, function(entry: any) {
    if (!entry) {
        return;
    }
    // These 2 ifs were done for backwards compatibility.
    // The correct way of fixing it would have been modifying the navigation.json
    // Replacing dataTouchpoint with data-touchpoint and dataHashtag with data-hashtag.
    // This way when rendering the Header.Menu.View it will pass the entry to
    // Utils.objectToAtrributes and pass the property name filter
    if (entry.dataTouchpoint) {
        entry['data-touchpoint'] = entry.dataTouchpoint;
    }
    if (entry.dataHashtag) {
        entry['data-hashtag'] = entry.dataHashtag;
    }

    if (entry.placeholder) {
        entry.text = '';
    }
    entry.class = 'header-menu-level' + entry.level + '-anchor';

    if (entry.parentId) {
        let parent = _.find(baseConfiguration.navigationData, function(e: any) {
            return e.id === entry.parentId;
        });
        parent = parent || {};
        parent.categories = parent.categories || [];
        parent.categories.push(entry);
    }
    if (entry.classnames) {
        entry.class += ' ' + entry.classnames;
    }
});

// Now, remove  non top level nav entries from the array (root nodes)
// heads up ! we have to re-iterate :( this is the correct way of deleting and iterating an array - not _.each()
for (let i = 0; i < baseConfiguration.navigationData.length; i++) {
    const entry = baseConfiguration.navigationData[i];
    if (!entry || entry.level > 1) {
        baseConfiguration.navigationData.splice(i, 1);
        i--;
    }
}

Utils.setPathFromObject(
    baseConfiguration,
    'forms.address.showAddressLine2',
    Utils.getPathFromObject(baseConfiguration, 'forms.address.showAddressLineTwo', true)
);

export = baseConfiguration;
