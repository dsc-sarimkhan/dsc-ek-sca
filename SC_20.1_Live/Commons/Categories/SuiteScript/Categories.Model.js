/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Category.js
// -----------
// Handles the Category tree
define('Categories.Model', [
    'SC.Model',
    'Application',
    'SC.Models.Init',
    'Configuration',
    'underscore',
    'SiteSettings.Model',
    'Utils'
], function(SCModel, Application, ModelsInit, Configuration, _, SiteSettings, Utils) {
    return SCModel.extend({
        name: 'Category',

        categoryColumns: {
            boolean: ['displayinsite', 'isinactive', 'isprimaryurl'],

            sideMenu: {
                sortBy: 'sequencenumber',
                fields: ['name', 'internalid', 'sequencenumber', 'urlfragment', 'displayinsite']
            },

            subCategories: {
                sortBy: 'sequencenumber',
                fields: [
                    'name',
                    'description',
                    'internalid',
                    'sequencenumber',
                    'urlfragment',
                    'thumbnailurl',
                    'displayinsite'
                ]
            },

            category: {
                fields: [
                    'internalid',
                    'name',
                    'description',
                    'pagetitle',
                    'pageheading',
                    'pagebannerurl',
                    'addtohead',
                    'metakeywords',
                    'metadescription',
                    'displayinsite',
                    'urlfragment',

                    'idpath', // needed for breadcrumb
                    'fullurl', // needed for canonical path
                    'isprimaryurl' // needed for canonical path
                ]
            },

            breadcrumb: {
                fields: ['internalid', 'name', 'displayinsite']
            },

            menu: {
                sortBy: 'sequencenumber',
                fields: ['internalid', 'name', 'sequencenumber', 'displayinsite']
            },

            mapping: {
                internalid: 'subcatid',
                name: 'subcatnameoverride',
                description: 'subcatdescoverride',
                pagetitle: 'subcatpagetitleoverride',
                pageheading: 'subcatpageheadingoverride',
                pagebannerurl: 'subcatpagebannerurloverride',
                addtohead: 'subcataddtoheadoverride',
                metakeywords: 'subcatmetakeywordsoverride',
                metadescription: 'subcatmetadescoverride',
                displayinsite: 'subcatdisplayinsiteoverride',
                sequencenumber: 'subcatsequencenumber',
                thumbnailurl: 'subcatthumbnailurloverride',
                urlfragment: 'subcaturlfragmentoverride'
            }
        },

        isPersonalizedCatalogViewsEnabled: SiteSettings.isPersonalizedCatalogViewsEnabled(),

        getColumns: function(element) {
            const config = Configuration.get().categories;

            return _.union(
                this.categoryColumns[element].fields,
                config[element].fields || config[element].additionalFields
            ).join();
        },

        getSortBy: function(element) {
            const config = Configuration.get().categories;

            return config[element].sortBy || this.categoryColumns[element].sortBy;
        },

        getNavigationItemOptionalFields: function() {
            return (
                '&bread_crumb_fields=' +
                this.getColumns('breadcrumb') +
                '&category_fields=' +
                this.getColumns('category') +
                '&side_menu_fields=' +
                this.getColumns('sideMenu') +
                '&subcategory_fields=' +
                this.getColumns('subCategories')
            );
        },

        getCategoryTreeOptionalFields: function() {
            const config = Configuration.get().categories;

            return '&menu_fields=' + this.getColumns('menu');
        },

        getSMTEndpointParameters: function(
            field,
            value,
            as_of_date,
            optional_fields,
            pcv_groups,
            pcv_all_items
        ) {
            const Environment = Application.getEnvironment(request);
            const locale = (
                (Environment && Environment.currentLanguage).locale ||
                ModelsInit.session.getShopperLanguageLocale()
            ).split('_');

            let parameters =
                'currency=' +
                ModelsInit.session.getShopperCurrency().code +
                '&site_id=' +
                ModelsInit.session.getSiteSettings(['siteid']).siteid;
            const use_pcv = this.isPersonalizedCatalogViewsEnabled ? 'T' : 'F';

            parameters +=
                '&c=' +
                nlapiGetContext().getCompany() +
                '&exclude_empty=' +
                Configuration.get('categories.excludeEmptyCategories') +
                '&use_pcv=' +
                use_pcv +
                '&pcv_all_items=' +
                pcv_all_items +
                '&language=' +
                locale[0] +
                '&country=' +
                (locale[1] || '') +
                '&' +
                field +
                '=' +
                value +
                optional_fields;

            // Only in case of SMT call
            if (as_of_date) {
                parameters += '&as_of_date=' + as_of_date;
            }
            if (pcv_groups) {
                parameters += '&pcv_groups=' + pcv_groups;
            }

            return parameters;
        },

        get: function(fullurl, effectiveDate, pcv_groups, pcv_all_items, runAsAdmin) {
            const NAVIGATION_ITEM_ENDPOINT = '/api/navigation/v1/categorynavitems?';

            let category = {};
            const baseUrl = runAsAdmin
                ? request.getURL().match(/(^https?:\/\/[^\/]+)/i)[0]
                : Utils.trim(Configuration.get().cms.baseUrl || '') ||
                  'http://' + Utils.getShoppingDomain();

            const params = this.getSMTEndpointParameters(
                'full_url',
                fullurl,
                effectiveDate,
                this.getNavigationItemOptionalFields(),
                pcv_groups,
                pcv_all_items
            );
            const endpointURL = baseUrl + NAVIGATION_ITEM_ENDPOINT + params;
            const requestHeader = {
                Accept: 'application/json',
                Cookie: Utils.replaceNewLineByASpace(request.getHeader('cookie'))
            };

            const enpointResponse = nlapiRequestURL(endpointURL, null, requestHeader);

            if (enpointResponse.getCode() === 200) {
                const response = JSON.parse(enpointResponse.getBody()).data;
                if (response) {
                    category = response[0];
                } else {
                    throw notFoundError;
                }
            } else {
                throw notFoundError;
            }

            this.sortBy(category.siblings, this.getSortBy('sideMenu'));
            this.sortBy(category.categories, this.getSortBy('subCategories'));

            return category;
        },

        getCategoryTree: function(
            level,
            effectiveDate,
            pcv_groups,
            pcv_all_items,
            runAsAdmin,
            is_annonymous
        ) {
            const CATEGORY_TREE_ENDPOINT = '/api/navigation/v1/categorynavitems/tree?';

            let categoryTree = [];
            const baseUrl = runAsAdmin
                ? request.getURL().match(/(^https?:\/\/[^\/]+)/i)[0]
                : Utils.trim(Configuration.get().cms.baseUrl || '') ||
                  'http://' + Utils.getShoppingDomain();

            const params = this.getSMTEndpointParameters(
                'max_level',
                level,
                effectiveDate,
                this.getCategoryTreeOptionalFields(),
                pcv_groups,
                pcv_all_items
            );
            const endpointURL = baseUrl + CATEGORY_TREE_ENDPOINT + params;
            const requestHeader = {
                Accept: 'application/json'
            };

            if (!is_annonymous) {
                requestHeader.Cookie = Utils.replaceNewLineByASpace(request.getHeader('cookie'));
            }

            const enpointResponse = nlapiRequestURL(endpointURL, null, requestHeader);

            if (enpointResponse.getCode() === 200) {
                categoryTree = JSON.parse(enpointResponse.getBody()).data;
            } else {
                return [];
            }

            this.sortBy(categoryTree, this.getSortBy('menu'));

            return categoryTree;
        },

        sortBy: function(categories, property) {
            if (categories) {
                const self = this;
                property = property || 'sequencenumber';

                _.each(categories, function(category) {
                    self.sortBy(category.categories, property);
                });

                categories.sort(function(a, b) {
                    // This works with Strings, Numbers, and Numbers as Strings. ie: ['a', 'b', 'c'] OR [1, 3, 20] OR ['1', '3', '20']
                    const numberA = Number(a[property]);
                    const numberB = Number(b[property]);

                    if (!isNaN(numberA) && !isNaN(numberB)) {
                        return numberA - numberB;
                    }
                    return (a[property] + '').localeCompare(
                        b[property] + '',
                        {},
                        {
                            numeric: true
                        }
                    );
                });
            }
        }
    });
});
