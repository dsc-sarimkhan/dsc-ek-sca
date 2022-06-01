/// <amd-module name="GoogleMapExtension"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />
import _ = require('underscore');
import ReferenceMap = require('../../../Advanced/StoreLocatorReferenceMapImplementation/JavaScript/ReferenceMap');

export function mountToApp(application): void {

ReferenceMap.prototype.showMap = function showMap(container) {
    // console.log("Custom GoogleMap Call")
    const map_configuration = this.configuration.mapOptions();
    const map_options = {
        center: new google.maps.LatLng(
            map_configuration.centerPosition.latitude,
            map_configuration.centerPosition.longitude
        ),
        zoomControl: true,
        zoom: map_configuration.zoom,
        mapTypeControl: map_configuration.mapTypeControl,
        streetViewControl: map_configuration.streetViewControl,
        mapTypeId: google.maps.MapTypeId[map_configuration.mapTypeId],
        disableDefaultUI: true
    };
  
    const map = new google.maps.Map(container, map_options);
  
    const self = this;
  
    google.maps.event.addListener(map, 'tilt_changed', () => {
        google.maps.event.addListenerOnce(map, 'idle', () => {
            map.setZoom(this.configuration.zoomInDetails());
        });
  
        if (this.points.length) {
            this.fitBounds(map);
        } else if (this.detail_point) {
            this.fitBounds(map);
  
            map.setCenter(map.getCenter());
  
            map.setZoom(this.configuration.zoomInDetails());
        } else {
            this.centerMapToDefault(map);
        }
  
        google.maps.event.trigger(map, 'resize');
    });
  
    this.map = map;
  
    return map;
  };


  ReferenceMap.prototype.showAutoCompleteInput = function showAutoCompleteInput(input) {
    
    const restrictOptions = {
        componentRestrictions: {country: 'aus'}
    };
    const self = this;

    if (input) {
            this.autocomplete =  new google.maps.places.Autocomplete(input, restrictOptions);
            google.maps.event.addListener(this.autocomplete, 'place_changed', function() {
            const temp = self.autocomplete.getPlace();        
            self.trigger('change:place', temp);
            self.autocompleteChange();
           
        });
    }
    

    return this.autocomplete;
};

 ReferenceMap.prototype.autocompleteChange = function autocompleteChange() {



    const place =
        this.autocomplete && this.autocomplete.getPlace();
    if (!place || _.size(place) === 0) {
        console.warn('Autocomplete returned place contains no geometry');
        return;
    }

    if (!place.geometry) {
        console.warn('Autocomplete returned place contains no geometry');
        return;
    }
    // set autocomplete coordinates
    if (place.geometry.location) {
        this.setPosition({
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            address: place.formatted_address,
            viewport: place.geometry.viewport,
            location: place.geometry.location
        });
    }
};


  
}