/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CMSadapter"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />
/// <reference path="./CMS.d.ts" />

import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import CMSadapterImplEnhanced = require('./CMSadapter.Impl.Enhanced');
import CMSadapterComponent = require('./CMSadapter.Component');

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

/* global CMS: false */
// @module CMSadapter

// @class CMSadapter responsible of starting both the adapter implementation.
// Assumes cms.js is already loaded
// @extend ApplicationModule
export = {
    mountAdapter: function(application) {
        if (Configuration.get('cms.useCMS')) {
            application.registerComponent(CMSadapterComponent(application));

            const routes = this.initPageRoutes(application);

            this.adapterEnhanced = new CMSadapterImplEnhanced(application, routes);
            this.installBackboneViewPlugins(application);

            if (Configuration.get('cms.adapterVersion') === '2' || SC.isDevelopment) {
                this.loadScript(application, routes);
            } else {
                this.initAdapter(application, routes);
            }
        }

        return this.postMountAdapter(application);
    },

    loadScript: function loadScript(application, routes) {
        const self = this;

        jQuery
            .getScript('/cms/' + Configuration.get('cms.adapterVersion') + '/cms.js')
            .done(function() {
                self.initAdapter(application, routes);
            });
    },

    initAdapter: function initAdapter(application, landingRouter) {
        if (typeof CMS !== 'undefined') {
            this.initAdapterImpls(application, CMS, landingRouter);

            Backbone.trigger('cms:loaded', CMS);
        }
    },

    initPageRoutes: jQuery.noop,

    installBackboneViewPlugins: jQuery.noop,

    initAdapterImpls: jQuery.noop,

    postMountAdapter: jQuery.noop
};
