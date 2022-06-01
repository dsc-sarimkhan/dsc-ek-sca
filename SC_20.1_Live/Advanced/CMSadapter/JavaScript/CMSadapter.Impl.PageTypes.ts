/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CMSadapter.Impl.PageTypes"/>

interface CmsPageType {
    name: string;
    layout: string;
}

export class CMSadapterPageTypes {
    CMS: any;

    application: any;

    constructor(application, CMS) {
        this.application = application;
        this.CMS = CMS;

        this.listenForCMS();
    }

    listenForCMS() {
        this.CMS.on('pagetype:update', (promise, page: CmsPageType) => {
            const pageTypeComponent = this.application.getComponent('PageType');
            const pageType = pageTypeComponent._getPageType(page.name);
            pageType.set('template', page.layout);
            promise.resolve();
        });
    }
}
