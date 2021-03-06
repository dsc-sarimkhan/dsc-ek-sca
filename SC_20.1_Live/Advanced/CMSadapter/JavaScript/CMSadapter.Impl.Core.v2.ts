/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CMSadapter.Impl.Core.v2"/>

import CMSadapterImplCore = require('./CMSadapter.Impl.Core');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');

/* global CMS: false */
/*

@module CMSadapter
@class CMSadapter.Impl.Core.v2 the class that has the core integration using the CMS API v2.
*/

const CMSadapterImplCore2 = function(application, CMS) {
    CMSadapterImplCore.call(this, application, CMS);
};

CMSadapterImplCore2.prototype = Object.create(CMSadapterImplCore.prototype);

CMSadapterImplCore2.prototype.init = function init() {
    const self = this;

    this.application.getLayout().on('afterAppendView', function() {
        self.CMS.trigger('adapter:page:changed');
    });

    this.CMS.trigger('adapter:ready');
};

CMSadapterImplCore2.prototype.listenForCMS = function listenForCMS() {
    // CMS listeners - CMS tells us to do something, could fire anytime.
    const self = this;

    self.CMS.on('adapter:get:setup', function() {
        const setup = self.getSetupOptions(); // Config values the adapter can give the cms on startup. Currently nothing is used (cms ignores values).

        self.CMS.trigger('adapter:got:setup', setup);
    });

    self.CMS.on('adapter:get:context', function() {
        const context = self.getCmsContext();

        self.CMS.trigger('adapter:got:context', context);
    });
};

CMSadapterImplCore2.prototype.getSetupOptions = function getSetupOptions() {
    return {
        esc_to_login_disabled: Configuration.get('cms.escToLoginDisabled', false),
        features: ['landingPages', 'categories', 'customerSegmentPreview']
    };
};

export = CMSadapterImplCore2;
