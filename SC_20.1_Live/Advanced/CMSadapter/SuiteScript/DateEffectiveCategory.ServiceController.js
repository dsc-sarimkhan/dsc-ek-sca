/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// DateEffectiveCategory.ServiceController.js
// ----------------
// Service to manage categories within SMT
define('DateEffectiveCategory.ServiceController', [
    'ServiceController',
    'Categories.Model',
    'Configuration'
], function (ServiceController, CategoriesModel, Configuration) {
    return ServiceController.extend({
        name: 'DateEffectiveCategory.ServiceController',
        /**
         * Mandatory params:domain, date
         * Optional params: fullurl, menuLevel, pcv_groups, pcv_all_items
         */
        get: function () {
            const menuLevel = this.request.getParameter('menuLevel');
            const pcv_groups = this.request.getParameter('pcv_groups');
            const pcv_all_items = this.request.getParameter('pcv_all_items');
            const date = this.request.getParameter('date');
            const fullurl = this.request.getParameter('fullurl');

            this.controlAccess();

            if (!date && !pcv_groups && !pcv_all_items) {
                throw invalidParameter;
            }

            Configuration.setConfig({
                domain: this.request.getParameter('domain')
            });

            if (fullurl) {
                return CategoriesModel.get(fullurl, date, pcv_groups, pcv_all_items, true);
            }
            if (menuLevel) {
                return CategoriesModel.getCategoryTree(menuLevel, date, pcv_groups, pcv_all_items, true);
            }
        },
        controlAccess: function () {
            let origin =
                this.request.getHeader('Referer') ||
                this.request.getHeader('referer') ||
                this.request.getHeader('Origin') ||
                '';
            const domain = this.request.getParameter('domain');

            origin = origin.match(/(https?:\/\/)?([^/^:]*)\/?/i);
            origin = origin && origin[2];

            if (!domain || !origin || origin !== domain) {
                throw forbiddenError;
            }
        },
        options: function () {
            return {
                get: {
                    jsonp_enabled: true
                }
            };
        }
    });
});
