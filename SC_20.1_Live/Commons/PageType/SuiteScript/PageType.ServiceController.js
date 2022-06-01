/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// PageType.ServiceController.js
// ----------------
// Service to get CMS PageTypes
define('PageType.ServiceController', ['ServiceController', 'PageType.Model'], function(
    ServiceController,
    PageTypeModel
) {
    return ServiceController.extend({
        name: 'PageType.ServiceController',

        get: function() {
            return PageTypeModel.getPageTypes();
        }
    });
});
