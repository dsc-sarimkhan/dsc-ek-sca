/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SC.Environment.Component"/>

/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />
import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import SCBaseComponent = require('../../../Commons/SC/JavaScript/SC.BaseComponent');
import Configuration = require('../../../Commons/Utilities/JavaScript/SC.Configuration');

// Environment component. see APIdocs/JavaScript/EnvironmentComponent.js for documentation
export = {
    /** @param {ComponentContainer} container */
    mountToApp: function(container) {
        container.registerComponent(this.componentGenerator(container));
    },

    componentGenerator: function(container) {
        return SCBaseComponent.extend({
            componentName: 'Environment',

            application: container,

            getConfig: function getConfig(key) {
                return Utils.deepCopy(Utils.getPathFromObject(Configuration, key));
            },

            isPageGenerator: function isPageGenerator() {
                return typeof nsglobal !== 'undefined';
            },

            getSiteSetting: function getSiteSettings(key) {
                return Utils.deepCopy(Utils.getPathFromObject(SC.ENVIRONMENT.siteSettings, key));
            },

            getSession: function getSession() {
                if (this.isPageGenerator()) {
                    return null;
                }

                const data = Utils.deepCopy(SC.SESSION);
                delete data.touchpoints;
                return data;
            },

            setTranslation: function setTranslation(locale, keys) {
                const session = this.getSession();

                if (session && session.language && session.language.locale === locale) {
                    _.each(keys, function(entry: any) {
                        SC.Translations[entry.key] = entry.value;
                    });
                }
            }
        });
    }
};
