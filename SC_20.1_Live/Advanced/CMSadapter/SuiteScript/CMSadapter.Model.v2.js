/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CMSadapter
define('CMSadapter.Model.v2', ['SC.Model', 'SiteSettings.Model'], function(
    SCModel,
    SiteSettingsModel
) {
    // @class CMSadapter.Model Mostly do the job of getting the landing pages of a CMS enabled site so they can be bootstrapped into the application environment.
    // @extends SCModel
    return SCModel.extend({
        name: 'CMSadapterV2',

        // @method getPages @return {data:Array<CMSPages>}
        getPages: function(baseUrl) {
            try {
                const siteSettings = SiteSettingsModel.get();
                const cmsRequestT0 = new Date().getTime();
                const cmsPagesHeader = { Accept: 'application/json' };
                const cmsPagesUrl =
                    baseUrl +
                    '/api/cms/pages?site_id=' +
                    siteSettings.siteid +
                    '&c=' +
                    nlapiGetContext().getCompany() +
                    '&{}';
                const cmsPagesResponse = nlapiRequestURL(cmsPagesUrl, null, cmsPagesHeader);
                const cmsPagesResponseBody = cmsPagesResponse.getBody();
                const data = {};

                if (
                    cmsPagesResponse.getContentType().indexOf('json') !== -1 &&
                    cmsPagesResponse.getCode() === 200
                ) {
                    data.pages = JSON.parse(cmsPagesResponseBody);
                } else {
                    data.error = cmsPagesResponseBody;
                }

                data._debug_requestTime = new Date().getTime() - cmsRequestT0;

                return data;
            } catch (e) {
                return { error: e };
            }
        }
    });
});
