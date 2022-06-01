/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="GoogleMap.Configuration"/>
// Specific configuration redefinition for Google Maps implementation

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import ReferenceMapConfiguration = require('../../StoreLocatorReferenceMapImplementation/JavaScript/ReferenceMap.Configuration');

ReferenceMapConfiguration.mapOptions = function mapOptions() {
    return Configuration.get('storeLocator.mapOptions');
};

ReferenceMapConfiguration.iconOptions = function iconOptions(attr?) {
    if (attr) {
        return Configuration.get('storeLocator.icons')[attr];
    }
    return Configuration.get('storeLocator.icons');
};

ReferenceMapConfiguration.zoomInDetails = function zoomInDetails() {
    return Configuration.get('storeLocator.zoomInDetails');
};

ReferenceMapConfiguration.title = function title() {
    return Configuration.get('storeLocator.title');
};

ReferenceMapConfiguration.isEnabled = function isEnabled() {
    return Configuration.get('storeLocator.isEnabled');
};

ReferenceMapConfiguration.getUrl = function getUrl() {
    return (
        'https://maps.googleapis.com/maps/api/js?v=3.21&key=' +
        Configuration.get('storeLocator.apiKey') +
        '&signed_in=false&libraries=places'
    );
};

ReferenceMapConfiguration.getApiKey = function getApiKey() {
    return Configuration.get('storeLocator.apiKey');
};

ReferenceMapConfiguration.getExtraData = function getExtraData() {
    return Configuration.get('storeLocator.additionalStoresData');
};

ReferenceMapConfiguration.getRadius = function getRadius() {
    return Configuration.get('storeLocator.radius');
};

ReferenceMapConfiguration.openPopupOnMouseOver = function openPopupOnMouseOver() {
    return Configuration.get('storeLocator.openPopupOnMouseOver');
};

ReferenceMapConfiguration.showLocalizationMap = function showLocalizationMap() {
    return Configuration.get('storeLocator.showLocalizationMap');
};

ReferenceMapConfiguration.showAllStoresRecordsPerPage = function showAllStoresRecordsPerPage() {
    return Configuration.get('storeLocator.showAllStoresRecordsPerPage');
};

export = ReferenceMapConfiguration;
