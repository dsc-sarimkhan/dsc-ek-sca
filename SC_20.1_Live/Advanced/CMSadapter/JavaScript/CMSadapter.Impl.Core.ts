/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CMSadapter.Impl.Core"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

/*
@module CMSadapter
@class CMSadapter.Impl.Core the class that has the core integration using the CMS API.
*/

const AdapterCore = function(application, CMS) {
    this.CMS = CMS;
    this.application = application;
    this.listenForCMS();
    this.init();
};

AdapterCore.prototype.init = jQuery.noop;

AdapterCore.prototype.listenForCMS = jQuery.noop;

AdapterCore.prototype.getSetupOptions = jQuery.noop;

AdapterCore.prototype.getCmsContext = function getCmsContext() {
    const url = (<any>Backbone.history).fragment.split('?')[0];
    const path = Utils.correctURL(url);

    const context = {
        path: path,
        site_id: this.application.getConfig('siteSettings.siteid'),
        page_type: this.application.getLayout().currentView
            ? this.application.getLayout().currentView.el.id
            : ''
    };

    return context;
};

export = AdapterCore;
