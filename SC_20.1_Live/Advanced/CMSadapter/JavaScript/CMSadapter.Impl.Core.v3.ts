/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CMSadapter.Impl.Core.v3"/>

import CMSadapterImplCore = require('./CMSadapter.Impl.Core');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');

const CMSadapterImplCore3 = function(application, CMS) {
    CMSadapterImplCore.call(this, application, CMS);
};
CMSadapterImplCore3.prototype = Object.create(CMSadapterImplCore.prototype);

CMSadapterImplCore3.prototype.init = function init() {
    this.CMS.trigger('app:ready');
};

CMSadapterImplCore3.prototype.listenForCMS = function listenForCMS() {
    // CMS listeners - CMS tells us to do something, could fire anytime.
    const self = this;

    self.CMS.on('config:get', function(promise) {
        promise.resolve(self.getSetupOptions());
    });

    self.CMS.on('admin:config:get', function(promise) {
        const config: any = {};

        const pageType = self.application.getComponent('PageType');
        config.page = pageType.getPageTypes();
        pageType._updatePageTypes();

        config.domains = (SC && SC.ENVIRONMENT && SC.ENVIRONMENT.siteSettings && SC.ENVIRONMENT.siteSettings.smtDomains) || [];

        promise.resolve(config);
    });
};

CMSadapterImplCore3.prototype.getSetupOptions = function getSetupOptions() {
    return {
        dontSpamConfigGet: true,
        useSoftNavigation: true,
        esc_to_login_disabled: Configuration.get('cms.escToLoginDisabled', false),
        features: [
            'landingPages',
            'categories',
            'customContentTypes',
            'deCategories',
            'pageTypes',
            'layoutSelector',
            'customerSegmentPreview',
            'themeCustomizerSkinSaver',
            'pageTypeLayoutSelector',
            'cmsMultiLanguage'
        ],
        app_content_override: ['html', 'image', 'text', 'merchzone'],
        currentLocale: SC && SC.ENVIRONMENT && SC.ENVIRONMENT.currentLanguage && SC.ENVIRONMENT.currentLanguage.locale
    };
};

export = CMSadapterImplCore3;
