// @module EKHomeBanner
define('EKHomeBanner.ServiceController', ['ServiceController', 'EKHomeBanner.Model'], function(
    ServiceController,
    EKHomeBannerModel
) {
    return ServiceController.extend({
        name: 'EKHomeBanner.ServiceController',
        get: function () {
            return EKHomeBannerModel.list({});
        }
    });
});
