/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CMSadapter.Impl.Categories.v3"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import Categories = require('../../../Commons/Categories/JavaScript/Categories');
import CategoriesCollection = require('../../../Commons/Categories/JavaScript/Categories.Collection');
import CategoriesModel = require('../../../Commons/Categories/JavaScript/Categories.Model');
import FacetsRouter = require('../../../Commons/Facets/JavaScript/Facets.Router');
import FacetsModel = require('../../../Commons/Facets/JavaScript/Facets.Model');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import ItemModel = require('../../../Commons/Item/JavaScript/Item.Model');
import ItemCollection = require('../../../Commons/Item/JavaScript/Item.Collection');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import Url = require('../../../Commons/Utilities/JavaScript/Url');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

/*
@module CMSadapter

@class CMSadapter.Impl.Categories.v3
*/

const CMSadapterImplCategories3 = function(application, CMS) {
    this.CMS = CMS;
    this.application = application;
    this.webStoreUrl = new Url().parse(SC.ENVIRONMENT.baseUrl);
    this.domain = this.webStoreUrl.getNetLocComponets().domain;
    this.currentDate = null;
    this.deEffectiveEndpointUrl = null;
    this.itemEndpointUrl = null;
    this.product = SC.ENVIRONMENT.BuildTimeInf.product === 'SCA' ? 'sca' : 'scs';
    this.listenForCMS();
};

CMSadapterImplCategories3.prototype.listenForCMS = function listenForCMS() {
    // CMS listeners - CMS tells us to do something, could fire anytime.
    const self = this;

    self.CMS.on('categories:navigate', function(promise, data) {
        FacetsModel.prototype.ignoreCache = true;
        CategoriesModel.prototype.ignoreCache = true;

        const url = Utils.correctURL(data.url);

        Backbone.history.navigate(url, { trigger: false });
        // navigate event should not force the reload of all categories information
        // but the app is not subscribed to any event to know when a category was updated
        // so on every navigation the categories info is reloaded
        self.reloadCategories().then(function() {
            promise.resolve();
        });
    });

    self.CMS.on('categories:reload', function(promise) {
        self.setUpEndPoints()
            .then(function() {
                self.reloadCategories()
                    .then(function() {
                        promise.resolve();
                    })
                    .fail(function() {
                        promise.reject();
                    });
            })
            .fail(function() {
                promise.reject();
            });
    });

    self.CMS.on('site:date:changed', function(promise, data) {
        self.setUpEndPoints()
            .then(function() {
                self.currentDate = data.siteDate;
                self.changeServices(); // requires the date to be updated
                // reload the categories
                self.reloadCategories()
                    .then(function() {
                        promise.resolve();
                    })
                    .fail(function() {
                        promise.reject();
                    });
            })
            .fail(function() {
                promise.reject();
            });
    });

    self.CMS.on('preview:segment:apply', function(promise, data) {
        self.setUpEndPoints()
            .then(function() {
                self.pcv_all_items = data.pcv_all_items;
                self.pcv_groups = data.pcv_groups;

                SC.ENVIRONMENT.pcvGroups = self.pcv_groups ? self.pcv_groups.join() : '';
                SC.ENVIRONMENT.pcvAllItems = self.pcv_all_items ? 'T' : 'F';

                self.changeServices();
                // reload the categories
                self.reloadCategories()
                    .then(function() {
                        promise.resolve();
                    })
                    .fail(function() {
                        promise.reject();
                    });
            })
            .fail(function() {
                promise.reject();
            });
    });
};

CMSadapterImplCategories3.prototype.categoriesRefresh = function(menu) {
    Categories.setTopLevelCategoriesUrlComponents(menu);
    // update the router with new urls
    const router = new FacetsRouter(this.application);
    router.addUrl(Categories.getTopLevelCategoriesUrlComponent(), 'categoryLoading');
    Categories.addToNavigationTabs(menu);

    this.refreshPLP();
};

CMSadapterImplCategories3.prototype.setUpEndPoints = function() {
    const self = this;
    if (!this.deEffectiveEndpointUrl) {
        const companyPath = '/c.' + SC.ENVIRONMENT.companyId;
        let dateEffectiveCategoryPath = self.webStoreUrl.path;

        if (dateEffectiveCategoryPath.indexOf(companyPath) === -1) {
            dateEffectiveCategoryPath = companyPath + dateEffectiveCategoryPath;
        }

        return jQuery
            .getJSON(Utils.getAbsoluteUrl(
                `SC/CMSAdapter/NS_SC_Environment.ss?n=${SC.ENVIRONMENT.siteSettings.siteid}`,
                true
                )
            )
            .then(function(env) {
                self.deEffectiveEndpointUrl =
                    'https://' +
                    env.backendAccountDomain +
                    dateEffectiveCategoryPath.replace(
                        '{{file}}',
                        'services/DateEffectiveCategory.Service.ss'
                    );
                self.itemEndpointUrl = 'https://' + env.backendAccountDomain + '/api/items';
            });
    }
    return jQuery.Deferred().resolve();
};

CMSadapterImplCategories3.prototype.reloadCategories = function() {
    const self = this;
    const collection = new CategoriesCollection();
    return collection
        .fetch({
            dataType: 'jsonp',
            jsonp: 'jsonp_callback'
        })
        .done(function(menu) {
            self.categoriesRefresh(menu);
        });
};

CMSadapterImplCategories3.prototype.refreshPLP = function() {
    const currentBaseUrl = Backbone.history.getFragment().split('/')[0];
    if (
        currentBaseUrl === Configuration.defaultSearchUrl ||
        _.find(Categories.getTopLevelCategoriesUrlComponent(), function(cat: string) {
            return cat.substring(1) === currentBaseUrl;
        })
    ) {
        // if is a category or shop, reload the page
        Backbone.history.loadUrl(Backbone.history.getFragment());
    }
};

CMSadapterImplCategories3.prototype.changeServices = function() {
    const self = this;
    CategoriesModel.prototype.url = function() {
        const url = Utils.addParamsToUrl(self.deEffectiveEndpointUrl, {
            date: self.currentDate,
            domain: self.domain,
            n: SC.ENVIRONMENT.siteSettings.siteid,
            c: SC.ENVIRONMENT.companyId,
            pcv_groups: self.pcv_groups ? self.pcv_groups.join() : '',
            pcv_all_items: self.pcv_all_items ? 'T' : 'F'
        });
        return url;
    };
    CategoriesModel.prototype.fetch = _.wrap(CategoriesModel.prototype.fetch, function(
        fn,
        options
    ) {
        options = _.extend(options || {}, {
            dataType: 'jsonp',
            jsonp: 'jsonp_callback',
            preventDefault: true
        });
        return fn.call(this, options);
    });

    CategoriesCollection.prototype.url = function() {
        const url = Utils.addParamsToUrl(self.deEffectiveEndpointUrl, {
            menuLevel: Configuration.get('categories.menuLevel'),
            date: self.currentDate,
            domain: self.domain,
            n: SC.ENVIRONMENT.siteSettings.siteid,
            c: SC.ENVIRONMENT.companyId,
            pcv_groups: self.pcv_groups ? self.pcv_groups.join() : '',
            pcv_all_items: self.pcv_all_items ? 'T' : 'F'
        });
        return url;
    };
    ProfileModel.prototype.getSearchApiUrl = function() {
        return self.itemEndpointUrl;
    };
    function wrapItemsApiFetch(modelOrCollection) {
        modelOrCollection.prototype.fetch = _.wrap(modelOrCollection.prototype.fetch, function(
            fn,
            options
        ) {
            options = Utils.deepExtend(options || {}, {
                cache: false,
                data: {
                    as_of_date: self.currentDate,
                    force_avoid_redirect: true
                },
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true
            });
            // The 'true' value prevents jQuery ajax from sending the 'X-SC-Touchpoint' header, it's not supported
            // by CORS request to the items API
            SC.dontSetRequestHeaderTouchpoint = true;
            const fethReturn = fn.call(this, options);
            SC.dontSetRequestHeaderTouchpoint = false;
            return fethReturn;
        });
    }
    wrapItemsApiFetch(ItemModel);
    wrapItemsApiFetch(ItemCollection);
    wrapItemsApiFetch(FacetsModel);
};

export = CMSadapterImplCategories3;
