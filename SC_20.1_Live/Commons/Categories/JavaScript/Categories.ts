/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Categories"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />

import * as _ from 'underscore';
import * as jQuery from '../../Core/JavaScript/jQuery';

import CategoriesUtils = require('./Categories.Utils');
import Configuration = require('../../Utilities/JavaScript/SC.Configuration');
import CategoriesModel = require('./Categories.Model');
import ProfileModel = require('../../Profile/JavaScript/Profile.Model');

const Categories = {
    topLevelCategories: [],

    categoriesPromise: new (<any>jQuery).Deferred(),

    makeNavigationTab: function(categories) {
        const result = [];
        const self = this;

        _.each(categories, function(category: any) {
            const href = category.fullurl;
            const tab = {
                href: href,
                text: category.name,
                data: {
                    hashtag: '#' + href,
                    touchpoint: 'home'
                },
                class: 'header-menu-level' + category.level + '-anchor',
                'data-type': 'commercecategory'
            };

            (<any>tab).additionalFields = CategoriesUtils.getAdditionalFields(
                category,
                'categories.menu.fields'
            );

            if (category.categories) {
                (<any>tab).categories = self.makeNavigationTab(category.categories);
            }

            result.push(tab);
        });

        return result;
    },

    addToNavigationTabs: function(categories) {
        if (Configuration.get('categories.addToNavigationTabs')) {
            const self = this;
            const navigationData = Configuration.get('navigationData');
            let index = -1;

            // delete previews categories on the menu
            let lastIndex = navigationData.length;

            while (lastIndex--) {
                if (navigationData[lastIndex]['data-type'] === 'commercecategory') {
                    navigationData.splice(lastIndex, 1);
                }
            }

            for (let i = 0; i < navigationData.length; i++) {
                if (navigationData[i].placeholder === 'Categories') {
                    index = i;

                    break;
                }
            }

            if (index !== -1) {
                const tabs = self.makeNavigationTab(categories);

                // navigationData.splice(index, 1);

                _.each(tabs, function(tab, position) {
                    navigationData.splice(index + position, 0, tab);
                });
            }

            this.application.trigger('Configuration.navigationData');
        }
    },

    getTopLevelCategoriesUrlComponent: function() {
        return this.topLevelCategories;
    },

    setTopLevelCategoriesUrlComponents: function(categories) {
        const self = this;
        _.each(categories, function(category: any) {
            self.topLevelCategories.push(category.fullurl);
        });
    },

    getCategoriesPromise: function() {
        return this.categoriesPromise;
    },

    mountToApp: function(application) {
        if (Configuration.get('categories')) {
            this.application = application;
            const categories = SC.CATEGORIES;

            this.application.waitForPromise(this.categoriesPromise);

            // When PCV is enabled, and you are logged in, you need to
            // replace the cached categories with the specific categories
            // of the logged in user
            if (
                SC.ENVIRONMENT.siteSettings.isPersonalizedCatalogViewsEnabled &&
                !ProfileModel.getInstance().isAnnonymous()
            ) {
                const categoriesFetch = new CategoriesModel().fetch({
                    data: {
                        menuLevel: Configuration.get('categories.menuLevel')
                    },
                    preventDefault: true
                });

                return categoriesFetch
                    .then(model => {
                        SC.CATEGORIES = model;
                        this.setTopLevelCategoriesUrlComponents(model);
                        this.addToNavigationTabs(model);
                    })
                    .catch(() => {
                        console.log('Failed to get Dynamic Categories for logged in user');
                    })
                    .always(() => {
                        this.categoriesPromise.resolve();
                    });
            }

            this.setTopLevelCategoriesUrlComponents(categories);
            this.addToNavigationTabs(categories);
            this.categoriesPromise.resolve();
        }
    }
};

export = Categories;
