/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CMSadapter.v2"/>

import * as _ from 'underscore';

import CMSadapter = require('./CMSadapter');
import CMSadapterImplCore2 = require('./CMSadapter.Impl.Core.v2');
import CMSadapterImplLanding2 = require('./CMSadapter.Impl.Landing.v2');
import CMSadapterImplCategories2 = require('./CMSadapter.Impl.Categories.v2');
import CMSadapterImplMerchandising2 = require('./CMSadapter.Impl.Merchandising.v2');
import CMSadapterPagePageRouter = require('./CMSadapter.Page.Router');
import CMSadapterPagePageCollection = require('./CMSadapter.Page.Collection');

// @module CMSadapter
// @class CMSadapter.v2

// @class CMSadapter2 responsible of starting both the adapter implementation and cms landing pages router.
// Assumes cms.js is already loaded
// @extend ApplicationModule
export = _.extend({}, CMSadapter, {
    initAdapterImpls: function initAdapterImpls(application, cmsObject, landingRouter) {
        this.adapterCore = new CMSadapterImplCore2(application, cmsObject);
        this.adapterLanding = new CMSadapterImplLanding2(application, cmsObject, landingRouter);
        this.adapterCategories = new CMSadapterImplCategories2(application, cmsObject);
        this.adapterMerchandising = new CMSadapterImplMerchandising2(application, cmsObject);
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
