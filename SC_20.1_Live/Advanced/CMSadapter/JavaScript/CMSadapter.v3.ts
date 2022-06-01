/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CMSadapter.v3"/>

import * as _ from 'underscore';
import { CMSAdapterImplThemeCustomizerPreview } from './CMSadapter.Impl.ThemeCustomizerPreview';
import { CMSadapterPageTypes } from './CMSadapter.Impl.PageTypes';

import CMSadapter = require('./CMSadapter');
import CMSadapterImplCore3 = require('./CMSadapter.Impl.Core.v3');
import CMSadapterImplLanding3 = require('./CMSadapter.Impl.Landing.v3');
import CMSadapterImplCategories3 = require('./CMSadapter.Impl.Categories.v3');
import CMSadapterImplCustomContentType = require('./CMSadapter.Impl.CustomContentType');
import CMSadapterImplMerchandising3 = require('./CMSadapter.Impl.Merchandising.v3');
import CMSadapterPluginRecollectCMSSelectors = require('./CMSadapter.Plugin.RecollectCMSSelectors');
import CMSadapterPluginPostRender = require('./CMSadapter.Plugin.PostRender');
import CMSadapterPagePageRouter = require('./CMSadapter.Page.Router');
import CMSadapterPagePageCollection = require('./CMSadapter.Page.Collection');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @module CMSadapter
// @class CMSadapter.v3

// @class CMSadapter responsible of starting both the adapter implementation and cms landing pages router.
// Assumes cms.js is already loaded
// @extend ApplicationModule
export = _.extend({}, CMSadapter, {
    installBackboneViewPlugins: function installBackboneViewPlugins(application) {
        BackboneView.postCompile.install(CMSadapterPluginRecollectCMSSelectors(application));
        BackboneView.postCompile.install(CMSadapterPluginPostRender(application));
        // adds support for CCTs on collection rows template
        BackboneCollectionView.postRowCompile.install(
            CMSadapterPluginRecollectCMSSelectors(application)
        );
        BackboneCollectionView.postRowCompile.install(CMSadapterPluginPostRender(application));
    },

    initAdapterImpls: function initAdapterImpls(application, cmsObject, landingRouter) {
        this.adapterLanding = new CMSadapterImplLanding3(application, cmsObject, landingRouter);
        this.adapterCategories = new CMSadapterImplCategories3(application, cmsObject);
        this.adapterCustomContentTypes = new CMSadapterImplCustomContentType(
            application,
            cmsObject
        );
        this.adapterThemeCustomizerPreview = new CMSAdapterImplThemeCustomizerPreview(
            application,
            cmsObject
        );
        this.adapterMerchandising = new CMSadapterImplMerchandising3(application, cmsObject);
        this.adapterPageTypes = new CMSadapterPageTypes(application, cmsObject);
        // CMSadapterImplCore3 must be the last on been created, constructor triggers the "app:ready" event
        this.adapterCore = new CMSadapterImplCore3(application, cmsObject);
    },

    // @method initPageRoutes Register the landing pages PageType and urls using bootstrapped data.
    initPageRoutes: function initPageRoutes(application) {
        const pages =
            (SC.ENVIRONMENT.CMS && SC.ENVIRONMENT.CMS.pages && SC.ENVIRONMENT.CMS.pages.pages) ||
            [];
        const collection = new CMSadapterPagePageCollection(pages);

        return new CMSadapterPagePageRouter(application, collection);
    }
});
