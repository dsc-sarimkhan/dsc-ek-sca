/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="GoogleMap"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />
// @module StoreLocatorReferenceMapImplementation @class GoogleMap

import * as _ from 'underscore';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import PromiseHandler = require('../../StoreLocatorReferenceMapImplementation/JavaScript/ReferenceMap.Promise.Handler');
import StoreLocatorTooltip = require('../../StoreLocator/JavaScript/StoreLocator.Tooltip.View');
import ReferenceMap = require('../../StoreLocatorReferenceMapImplementation/JavaScript/ReferenceMap');

ReferenceMap.prototype.isInitialized = function isInitialized() {
    return typeof google === 'object' && typeof google.maps === 'object';
};

ReferenceMap.prototype.load = function load() {
    const url = this.configuration.getUrl();
    const handler = PromiseHandler;

    if (!handler.getPromise() && !this.isInitialized()) {
        const promise = jQuery.getScript(url).done(function() {
            ReferenceMap.prototype.initialized = true;
        });
        this.load_promise = promise;
        handler.setPromise(promise);
    }

    return handler.getPromise();
};

ReferenceMap.prototype.showMap = function showMap(container) {
    const map_configuration = this.configuration.mapOptions();
    const map_options = {
        center: new google.maps.LatLng(
            map_configuration.centerPosition.latitude,
            map_configuration.centerPosition.longitude
        ),
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

ReferenceMap.prototype.centerMapToDefault = function centerMapToDefault(map) {
    map = this.map || map;

    if (!map) {
        return;
    }

    map.myPositionMarker && map.myPositionMarker.setMap(null);

    const map_options = this.configuration.mapOptions();

    map.setZoom(map_options.zoom);

    map.setCenter(
        new google.maps.LatLng(
            parseInt(map_options.centerPosition.latitude, 10),
            parseInt(map_options.centerPosition.longitude, 10)
        )
    );
};

ReferenceMap.prototype.getInfoWindow = function getInfoWindow() {
    if (!this.infowindow) {
        this.infowindow = new google.maps.InfoWindow();
    }

    return this.infowindow;
};

ReferenceMap.prototype.getTooltip = function getTooltip(model, index) {
    if (!this.tooltip) {
        this.tooltip = new StoreLocatorTooltip({
            model: model,
            index: index
        });
    } else {
        this.tooltip.index = index;
        this.tooltip.model = model;
    }
    return this.tooltip;
};

ReferenceMap.prototype.showPoint = function showPoint(point, map) {
    map = map || this.map;

    if (!map) {
        return;
    }

    const location = point.get('location');
    const marker = new google.maps.Marker({
        store_id: point.get('internalid'),
        icon: this.configuration.iconOptions('stores'),
        map: map
    });

    marker.setPosition(new google.maps.LatLng(location.latitude, location.longitude));
    marker.setVisible(true);

    marker.addListener(
        'click',
        _.bind(function() {
            this.showInfoWindowOnClick(marker, map);
        }, this)
    );

    return marker;
};

ReferenceMap.prototype.showPointWithoutInfoWindow = function showPointWithoutInfoWindow(
    point,
    map
) {
    map = map || this.map;

    if (!map) {
        return;
    }

    const location = point.get('location');
    const marker = new google.maps.Marker({
        store_id: point.get('internalid'),
        icon: this.configuration.iconOptions('stores'),
        map: map
    });

    marker.setPosition(new google.maps.LatLng(location.latitude, location.longitude));

    marker.setVisible(true);

    this.detail_point = marker;

    return marker;
};

ReferenceMap.prototype.showInfoWindowOnClick = function showInfoWindowOnClick(marker, map) {
    const point = this.collection.find({ id: marker.store_id });
    const index = this.collection.indexOf(point) + 1;

    this.showInfoWindow(marker, point, index, map);
};

ReferenceMap.prototype.showInfoWindow = function showInfoWindow(marker, model, index, map) {
    map = map || this.map;

    if (!map) {
        return;
    }

    const tooltip = this.getTooltip(model, index);
    const info_window = this.getInfoWindow();

    info_window.setContent(tooltip.template(tooltip.getContext()));

    info_window.open(map, marker);
};

ReferenceMap.prototype.showMyPosition = function showMyPosition(position, map) {
    position = position || this.myposition;

    map = map || this.map;

    if (!position || !map) {
        return;
    }

    if (map.myPositionMarker) {
        map.myPositionMarker.setMap(null);
    }

    map.myPositionMarker = new google.maps.Marker({
        icon: this.configuration.iconOptions('position'),
        map: map
    });

    position.location =
        position.location || new google.maps.LatLng(position.latitude, position.longitude);

    map.myPositionMarker.setPosition(position.location);

    map.myPositionMarker.setVisible(true);

    google.maps.event.addListenerOnce(map, 'idle', () => {
        map.setZoom(this.configuration.zoomInDetails());
    });

    if (position.viewport) {
        map.fitBounds(position.viewport);
    } else {
        const map_options = this.configuration.mapOptions();
        map.setCenter(position.location);
        map.setZoom(map_options.zoom);
    }

    return map.myPositionMarker;
};

ReferenceMap.prototype.removePoint = function removePoint(point) {
    point.setMap(null);
};

ReferenceMap.prototype.showAutoCompleteInput = function showAutoCompleteInput(input) {
    const self = this;

    if (input) {
        this.autocomplete = new google.maps.places.SearchBox(input);

        google.maps.event.addListener(this.autocomplete, 'places_changed', function() {
            self.autocompleteChange();

            self.trigger('change:places', self.autocomplete.getPlaces());
        });
    }

    return this.autocomplete;
};

ReferenceMap.prototype.autocompleteChange = function autocompleteChange() {
    const place =
        this.autocomplete && this.autocomplete.getPlaces() && this.autocomplete.getPlaces()[0];

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

ReferenceMap.prototype.fitBounds = function fitBounds(map) {
    map = map || this.map;

    if (!map) {
        return;
    }

    const bounds = new google.maps.LatLngBounds();

    _.each(this.points, function(point: any) {
        const location = point.getPosition();
        bounds.extend(new google.maps.LatLng(location.lat(), location.lng()));
    });

    if (!_.isUndefined(this.myposition.latitude) && !_.isUndefined(this.myposition.longitude)) {
        bounds.extend(new google.maps.LatLng(this.myposition.latitude, this.myposition.longitude));
    }

    if (this.detail_point) {
        bounds.extend(
            new google.maps.LatLng(
                this.detail_point.position.lat(),
                this.detail_point.position.lng()
            )
        );
    }

    map.fitBounds(bounds);
};

ReferenceMap.prototype.getCityGeoCode = function getCityGeoCode() {
    const promise = jQuery.Deferred();
    const geoCoder = new google.maps.Geocoder();
    const position = this.myposition;
    const latlng = { lat: parseFloat(position.latitude), lng: parseFloat(position.longitude) };
    const self = this;

    geoCoder.geocode({ location: latlng }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            const city = _(results).find(function(result) {
                return !_.indexOf(result.types, 'locality');
            });

            if (city) {
                self.myposition.address = city.formatted_address;
            } else {
                self.myposition.address = results[0].formatted_address;
            }

            self.trigger('change:position', self.myposition);

            promise.resolve();
        } else {
            (<any>promise).always();
            console.warn('Geocoder failed due to: ' + status);
        }
    });

    return promise;
};

ReferenceMap.prototype.zoomToPoint = function zoomToPoint(marker, map) {
    map = map || this.map;

    if (!map) {
        return;
    }

    map.setZoom(this.configuration.zoomInDetails());
    map.panTo(marker.position);
};

ReferenceMap.prototype.getDirectionsUrl = function getDirectionsUrl(source, destination) {
    const source_parameter = source ? source.latitude + ',' + source.longitude : 'Current+Location';
    const destination_parameter =
        (destination && destination.latitude) + ',' + (destination && destination.longitude);

    return 'https://maps.google.com?saddr=' + source_parameter + '&daddr=' + destination_parameter;
};
