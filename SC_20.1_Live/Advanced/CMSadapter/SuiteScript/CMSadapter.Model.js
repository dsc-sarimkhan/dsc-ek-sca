/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CMSadapter
define('CMSadapter.Model', [
    'SC.Model',
    'CMSadapter.Model.v2',
    'CMSadapter.Model.v3',
    'Configuration'
], function(SCModel, CMSadapterModelv2, CMSadapterModelv3, Configuration) {
    // @class CMSadapter.Model Mostly do the job of getting the landing pages of a CMS enabled site so they can be bootstrapped into the application environment.
    // @extends SCModel
    return SCModel.extend({
        name: 'CMSadapter',

        // @method getPages @return {data:Array<CMSPages>}
        getPages: function(baseUrl) {
            const { adapterVersion } = Configuration.get().cms;

            switch (adapterVersion) {
                case '2':
                    return CMSadapterModelv2.getPages(baseUrl);
                    break;
                case '3':
                    return CMSadapterModelv3.getPages();
                    break;
                default:
            }
        },
        getPageTypes: function() {
            return CMSadapterModelv3.getPageTypes();
        }
    });
});
