/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CMSadapter.Page.Router"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import CMSadapterLandingView = require('./CMSadapter.Landing.View');

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneModel = require('../../../Commons/BackboneExtras/JavaScript/Backbone.Model');

// @module CMSadapter

// @class CMSadapter.Page.Router
function CMSadapterPageRouter(application, collection) {
    this.application = application;
    this.allPages = collection;
    this.enhancedPages = new Backbone.Collection();
    this.initRouter();
}

CMSadapterPageRouter.prototype._addEnhancedPage = function _addEnhancedPage(page) {
    const url = page.get('urlPath') || page.get('url');
    const enhancedPage = this.enhancedPages.find(function(page) {
        return page.get('urlPath') === url || page.get('url') === url;
    });

    if (enhancedPage) {
        this.enhancedPages.remove(enhancedPage);
    }

    this.enhancedPages.add(page);
};

CMSadapterPageRouter.prototype.initRouter = function initRouter() {
    const pageType = this.application.getComponent('PageType');
    const self = this;

    this.allPages.each(function(page) {
        if (page.get('type') === 1) {
            const type = page.get('pageTypeName') || 'cms-landing-page';
            const url = page.get('urlPath') || page.get('url');

            pageType._addPage(page, type, url);
        } else {
            self._addEnhancedPage(page);
        }
    });

    pageType.registerPageType({
        name: 'cms-landing-page',
        view: CMSadapterLandingView,
        defaultTemplate: {
            name: 'cms_landing_page.tpl',
            displayName: 'Landing Pages Default',
            thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                'img/default-layout-cms-landing.png'
            )
        }
    });
};

// @method getPageForFragment
// A handcrafted method for getting the page model given a url.
CMSadapterPageRouter.prototype.getPageForFragment = function getPageForFragment() {
    const pageType = this.application.getComponent('PageType');
    let fragment = Backbone.history.fragment || '/';

    fragment = fragment.split('?')[0] || '/'; // remove options

    let page = pageType._getPage(fragment);

    if (!page) {
        page = this.enhancedPages.find(function(page) {
            return page.get('urlPath') === fragment || page.get('url') === fragment;
        });
    }

    return page;
};

CMSadapterPageRouter.prototype.addLandingRoute = function addLandingRoute(page, _originalUrl) {
    const pageType = this.application.getComponent('PageType');
    const type = page.pageTypeName || 'cms-landing-page';
    const url = page.urlPath || page.url;
    const model = new BackboneModel(page);

    if (model.get('type') === 1) {
        pageType._addPage(model, type, url);

        pageType.registerPageType({
            name: type || 'cms-landing-page',
            routes: [url, url + '?*options']
        });
    } else {
        this._addEnhancedPage(model);
    }
};

export = CMSadapterPageRouter;
