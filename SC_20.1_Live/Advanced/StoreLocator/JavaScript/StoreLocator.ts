/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="StoreLocator"/>
// @module StoreLocator

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import ReferenceMap = require('../../StoreLocatorReferenceMapImplementation/JavaScript/ReferenceMap');
import ReferenceConfiguration = require('../../StoreLocatorReferenceMapImplementation/JavaScript/ReferenceMap.Configuration');
import StoreLocatorMainView = require('./StoreLocator.Main.View');
import StoreLocatorDetailsView = require('./StoreLocator.Details.View');
import StoreLocatorListAllView = require('./StoreLocator.List.All.View');
import StoreLocatorUpgradeView = require('./StoreLocator.Upgrade.View');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');

const StoreLocator: any = {
    // @method mountToApp
    // @param {Object} application
    mountToApp: function mountToApp(application) {
        const configurationIcons = [
            'storeLocator.icons.stores',
            'storeLocator.icons.position',
            'storeLocator.icons.autocomplete'
        ];

        _.each(configurationIcons, function(property) {
            if (Utils.getPathFromObject(Configuration, property, '')) {
                Utils.setPathFromObject(
                    Configuration,
                    property,
                    Utils.getAbsoluteUrlOfNonManagedResources(
                        Utils.getPathFromObject(Configuration, property, '')
                    )
                );
            }
        });

        const pageType = application.getComponent('PageType');

        if ((<any>ReferenceConfiguration).isEnabled() && window.location.protocol === 'https:') {
            if (Utils.oldIE(8)) {
                pageType.registerPageType({
                    name: 'StoreLocatorUpgrade',
                    routes: ['stores', 'stores/details/:id', 'stores/all', 'stores/all?:options'],
                    view: StoreLocatorUpgradeView,
                    defaultTemplate: {
                        name: 'store_locator_upgrade.tpl',
                        displayName: 'Browser Upgrade',
                        thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                            '/path/to/store_locator_upgrade_tpl.png'
                        )
                    }
                });
            } else {
                const reference_map = new ReferenceMap();

                pageType.registerPageType({
                    name: 'StoreLocatorMain',
                    routes: ['stores'],
                    view: StoreLocatorMainView,
                    defaultTemplate: {
                        name: 'store_locator_main.tpl',
                        displayName: reference_map.configuration.title(),
                        thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                            'img/default-layout-store-locator.png'
                        )
                    }
                });

                pageType.registerPageType({
                    name: 'StoreLocatorListAll',
                    routes: ['stores/all', 'stores/all?:options'],
                    view: StoreLocatorListAllView,
                    defaultTemplate: {
                        name: 'store_locator_list_all.tpl',
                        displayName: ReferenceConfiguration.title(),
                        thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                            'img/default-layout-store-locator-list.png'
                        )
                    }
                });

                pageType.registerPageType({
                    name: 'StoreLocatorDetails',
                    routes: ['stores/details/:id'],
                    view: StoreLocatorDetailsView,
                    defaultTemplate: {
                        name: 'store_locator_details.tpl',
                        displayName: reference_map.configuration.title(),
                        thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                            'img/default-layout-store-locator-details.png'
                        )
                    }
                });
            }
        }
    }
};

export = StoreLocator;
