/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Categories.ServiceController.js
// ----------------
// Service to manage categories
define('Categories.ServiceController', ['ServiceController', 'Categories.Model', 'Utils', 'Configuration'], function (
    ServiceController,
    CategoriesModel,
    Utils,
    Configuration
) {
    return ServiceController.extend({
        name: 'Categories.ServiceController',

        options: {
            common: {
                requireLoggedInPPS: true
            }
        },

        get: function () {
            const fullurl = this.request.getParameter('fullurl');
            const pcv_all_items = this.request.getParameter('pcv_all_items');

            if (fullurl) {
                return CategoriesModel.get(fullurl, null, null, pcv_all_items, false);
            }
            const menuLevel = this.request.getParameter('menuLevel');

            if (menuLevel) {
                return CategoriesModel.getCategoryTree(menuLevel, null, null, pcv_all_items, false);
            }
        }
    });
});
