/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Overview"/>
// @module Overview
// Defines the Overview module (Router)

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import OverviewHomeView = require('./Overview.Home.View');
import MyAccountStandAlone = require('../../MyAccountApplication/JavaScript/MyAccount.Alone');
import OverviewHomeStandaloneView = require('./Overview.Home.Standalone.View');

// @class Overview @extends ApplicationModule
const Overview: any = {
    MenuItems: [
        function(application) {
            if (
                (!Utils.isPhoneDevice() &&
                    application.getConfig('siteSettings.sitetype') === 'STANDARD') ||
                application.getConfig('siteSettings.sitetype') !== 'STANDARD'
            ) {
                return {
                    id: 'home',
                    name: Utils.translate('Overview'),
                    url: 'overview',
                    index: 0
                };
            }
        }
    ],

    mountToApp: function(application) {
        const isStandalone: boolean = application.name === MyAccountStandAlone.getName();
        const pageType = application.getComponent('PageType');

        pageType.registerPageType({
            name: 'MyAccountOverview',
            routes: ['', '?*params', 'overview', 'overview?*params'],
            view: isStandalone ? OverviewHomeStandaloneView : OverviewHomeView,
            defaultTemplate: {
                name: 'overview_home.tpl',
                displayName: 'My Account Overview Default',
                thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                    'img/default-layout-myaccount-overview.png'
                )
            }
        });
    }
};

export = Overview;
