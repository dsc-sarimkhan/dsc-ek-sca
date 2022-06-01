/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// ShoppingUserEnvironment.ServiceController.js
// ----------------
define('ShoppingUserEnvironment.ServiceController', [
    'ServiceController',
    'Configuration',
    'Application',
    'SiteSettings.Model',
    'ExternalPayment.Model',
    'Profile.Model',
    'Utils',
    'underscore',
    'Categories.Model'
], function(
    ServiceController,
    Configuration,
    Application,
    SiteSettingsModel,
    ExternalPaymentModel,
    ProfileModel,
    Utils,
    _,
    CategoriesModel
) {
    return ServiceController.extend({
        name: 'ShoppingUserEnvironment.ServiceController',

        get: function() {
            let Environment;
            let SiteSettings;
            let Profile;
            let productlist_bundle_present;
            let googletagmanager_datalayer;

            productlist_bundle_present = Utils.recordTypeExists('customrecord_ns_pl_productlist');

            Environment = Application.getEnvironment(this.request);
            SiteSettings = SiteSettingsModel.get();
            Profile = ProfileModel.get();

            // GTM START
            googletagmanager_datalayer = require('GoogleTagManager.ServiceController').getDataLayer(
                this.request,
                this.response
            );
            // GTM END

            if (!productlist_bundle_present) {
                console.warn('Product Lists Data not present in Shopping SSP');
            }

            const userEnvironment = {
                ENVIRONMENT: {
                    PROFILE: Profile,
                    permissions: Application.getPermissions(),
                    PRODUCTLIST_ENABLED: productlist_bundle_present,
                    published: {}
                },
                SESSION: {
                    currency: Environment.currentCurrency,
                    language: Environment.currentLanguage,
                    priceLevel: Environment.currentPriceLevel,
                    touchpoints: SiteSettings.touchpoints
                }
            };

            if (Configuration.get().cases) {
                userEnvironment.ENVIRONMENT.CASES_CONFIG = Configuration.get().cases;
            }

            userEnvironment.published = {};
            _.each(Configuration.get().publish, function(i) {
                const res = require(i.model)[i.call]();

                userEnvironment.published[i.key] = res;
            });

            userEnvironment.ENVIRONMENT.GTM_DATALAYER = googletagmanager_datalayer || {};

            userEnvironment.date = new Date().getTime();

            return userEnvironment;
        }
    });
});
