// @module EKConfiguration
define('EKConfiguration.ServiceController', ['ServiceController', 'EKConfiguration.Model'], function(
    ServiceController,
    EKConfigurationModel
) {
    return ServiceController.extend({
        name: 'EKConfiguration.ServiceController',
        
        get: function () {
            var id = this.request.getParameter('internalid');
            var key = this.request.getParameter('key');
            if(key){
                return EKConfigurationModel.getByKey({
                    key: key
                });    
            }

            return EKConfigurationModel.get({
                internalid: id
            });
        }
    });
});
