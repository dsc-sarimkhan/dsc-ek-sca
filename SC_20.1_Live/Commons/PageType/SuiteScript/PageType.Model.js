/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module PageType
define('PageType.Model', ['SC.Model', 'SC.Models.Init'], function(SCModel, ModelsInit) {
    // @class PageType.Model get the info of the PageTypes so they can be bootstrapped into the application environment.
    // @extends SCModel
    return SCModel.extend({
        name: 'PageType',

        // @method getPageTypes @return {data:Array<PageTypes>}
        getPageTypes: function() {
            try {
                const cmsRequestT0 = new Date().getTime();
                const data = {};
                const pageTypes = this.searchPageTypes();
                const domain = ModelsInit.session.getEffectiveShoppingDomain();
                const pageTypesTemplates = this.searchPageTypesTemplates(domain);
                pageTypes.forEach(function(pageType) {
                    if (pageTypesTemplates[pageType.name]) {
                        pageType.template = pageTypesTemplates[pageType.name];
                    }
                });
                data.pageTypes = pageTypes;
                data._debug_requestTime = new Date().getTime() - cmsRequestT0;
                return data;
            } catch (e) {
                return { error: e };
            }
        },
        searchPageTypes: function() {
            const filterExpression = ['inactive', 'is', 'F'];
            const columns = [new nlobjSearchColumn('name'), new nlobjSearchColumn('displayname')];
            const pageTypes = [];
            const result = nlapiSearchRecord('cmspagetype', null, filterExpression, columns);
            if (result) {
                result.forEach(function(cmsPageType) {
                    const pageType = {};
                    pageType.name = cmsPageType.getValue('name');
                    pageType.displayName = cmsPageType.getValue('displayname');
                    pageTypes.push(pageType);
                });
            }
            return pageTypes;
        },
        searchPageTypesTemplates(domainName) {
            const filterExpression = [
                ['cmspagetypedomaindata.domainname', 'is', domainName],
                'and',
                ['inactive', 'is', 'F']
            ];
            const columns = [
                new nlobjSearchColumn('name'),
                new nlobjSearchColumn('template', 'cmspagetypedomaindata')
            ];
            const pageTypes = {};
            const result = nlapiSearchRecord('cmspagetype', null, filterExpression, columns);
            if (result) {
                result.forEach(function(cmsPageType) {
                    const name = cmsPageType.getValue('name');
                    const template = cmsPageType.getValue('template', 'cmspagetypedomaindata');
                    pageTypes[name] = template;
                });
            }
            return pageTypes;
        }
    });
});
