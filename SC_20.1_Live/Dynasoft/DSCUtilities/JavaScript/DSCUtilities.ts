/// <amd-module name="DSCUtilities"/>

import _ = require('underscore');
import ReferenceMap = require('../../../Advanced/StoreLocatorReferenceMapImplementation/JavaScript/ReferenceMap');

export function getURLParam(name): string{
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null) {
      return null;
    }
    return decodeURI(results[1]) || null;
}

export function getPaymentMethods(): any{
  var sortedArray = [
      {name: 'paypal', img:'https://6457383.app.netsuite.com/core/media/media.nl?id=280209&c=6457383&h=5qODZuCnGyGXcf4aNRBT1EaeNUZfXXIjNMMcG2V-5pIYvvuF', class:"paypal"}, 
      {name: 'zip', img:'https://6457383.app.netsuite.com/core/media/media.nl?id=280211&c=6457383&h=xh2NdyrTukjun41jQtuS4xKQ0Ocs-XBTKFzWmbPn4lOGovDe', class:"zip"}, 
      {name: 'afterpay', img:'https://6457383.app.netsuite.com/core/media/media.nl?id=280208&c=6457383&h=Inby8t1DwZ0kiKPjJai1ND55Gt0BAlUxNgK_92-1qb13an8p', class:"afterpay"}, 
      {name: 'visa', img:'https://6457383.app.netsuite.com/core/media/media.nl?id=280210&c=6457383&h=lI5FDsBBfzNUfHlrYQKWi63ivas6DKpT-vO6KWGxnB0mmVqF', class:"visa"}, 
      {name: 'master card', img:'https://6457383.app.netsuite.com/core/media/media.nl?id=280207&c=6457383&h=jW1NzNfBaBZnO1xzysZJP9jEC9ONBPj_T-AMOVL50IgUyi35', class:"master-card"}];
  var paymentMethods = [];
  var nsPaymentMethods = SC.ENVIRONMENT.siteSettings.paymentmethods;
  _.each(sortedArray, function(val){
      let paymentMethod = _.find(nsPaymentMethods, function(nsPaymentMethod: any){
          return nsPaymentMethod.name.toLowerCase().indexOf(val.name) !== -1;
      });
      if(paymentMethod !== undefined){
          paymentMethods.push({
              name: paymentMethod.name, 
              src: val.img,
              class: val.class
          });
      }
  });
  return paymentMethods;
}

export function isPaymentMethodAvailable(paymentMethodName): boolean{
    let paymentMethodAvailable = _.find(SC.ENVIRONMENT.siteSettings.paymentmethods, function(paymentMethod:any){
        return paymentMethod.name.toLowerCase().indexOf(paymentMethodName.toLowerCase()) !== -1;
    })
    return paymentMethodAvailable !== undefined ? true : false;
}

export function validateAddress(zip, city, callback): any{
    const referenceMap = new ReferenceMap();
    referenceMap.load().then(function(){
        const geoCoder = new google.maps.Geocoder(); 

        geoCoder.geocode({ 
            componentRestrictions: { 
                country: 'AU', 
                postalCode: zip,
                locality: city
            }
        }, function (results:any, status:string) {
            var cityNames = [];
            var state = {};
            if(status === 'OK'){
                let addressComponents = results[0].address_components;
                
                if(results[0].postcode_localities){
                    cityNames = results[0].postcode_localities;
                }else{
                    let cityName = _.find(addressComponents, function(addrComponent:any){
                        return addrComponent.types.indexOf("locality") !== -1 ;
                    })
                    cityNames.push(cityName.short_name);
                }

                state = _.find(addressComponents, function(addrComponent:any){
                    return addrComponent.types.indexOf("administrative_area_level_1") !== -1;
                })
            }
            callback(cityNames, state)     
        })
    });

}