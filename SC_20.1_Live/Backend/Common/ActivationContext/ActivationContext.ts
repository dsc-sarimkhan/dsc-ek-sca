/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import * as NCache from 'N/cache';
import * as NHttp from 'N/http';
import * as NHttps from 'N/https';
import * as NLog from 'N/log';
import * as NUtil from 'N/util';
import { setPathFromObject } from '../SspLibraries/Utils';

// This is the default implementation of this methods.
// This code will be overriden by the activation outcome

export function getExtensionsDefaultValues(domain: string, requestedUrl: string = ''): object {
    const SSP_V2_POSFIX = '_ss2/';
    const CONFIG_MANIFEST_CACHE = 'CONFIG_MANIFEST_CACHE';
    const CONFIG_MANIFEST_CACHE_KEY = CONFIG_MANIFEST_CACHE + '_KEY_';

    const splittedUrl = requestedUrl.split(SSP_V2_POSFIX);

    if (!domain || splittedUrl.length < 2) {
        NLog.debug({
            title: 'ERROR_GETTING_CONFIG_MANIFEST',
            details: `Unable to get the default values manifest with the given data.
             domain: ${domain} and url: ${requestedUrl}`
        });
        return {};
    }

    const url = splittedUrl[0] + `/extensions/configurationManifest-${domain}.json`;

    const configCache = NCache.getCache({
        name: CONFIG_MANIFEST_CACHE,
        scope: NCache.Scope.PRIVATE
    });

    const cachedConfig: string = configCache.get({
        key: CONFIG_MANIFEST_CACHE_KEY + url,
        ttl: 300,
        loader: () => {
            const httpModule = /^https/.test(url) ? NHttps : NHttp;
            const timestamp = '?t=' + Math.floor(Math.random() * 1000);

            const response = httpModule.get({ url: url + timestamp });
            if (response.code !== 200) {
                NLog.debug({
                    title: 'ERROR_GETTING_CONFIG_MANIFEST',
                    details: `The request of ${url} failed with ${response.code}`
                });
                return '{}';
            }
            return response.body;
        }
    });

    const defaultValues = {};
    try {
        const rawDefaultValues = JSON.parse(cachedConfig);
        NUtil.each(rawDefaultValues, entry => {
            NUtil.each(entry.properties, (value, key: string) => {
                if (value.default !== undefined) {
                    setPathFromObject(defaultValues, key, value.default);
                }
            });
        });
    } catch (error) {
        NLog.error({
            title: 'ERROR_LOADING_DEFAULT_VALUES',
            details: 'Error parsing extensions default values'
        });
    }

    return defaultValues;
}

interface AppIncludes {
    templates: string[];
    js: string[];
    css: string[];
    ie: string[];
}

interface AppManifest {
    type: string;
    version: string;
    application: string[];
    extensible_resources: string[];
}

interface EmbEndpoint {
    url: string;
    method: string;
    dataType: string;
    data: { domain: string };
}

export interface ActivationContext {
    isExtended: boolean;
    embEndpointUrl: EmbEndpoint;
    themeAssetsPath: string;
    appIncludes: { [application: string]: AppIncludes };
    appManifest: AppManifest;
}

// This method is overwritten by the backend devtool task
function getExtraData(): {
    appManifest: AppManifest;
    ieFiles: { [application: string]: string[] };
} {
    // Overwrite starts
    return null;
    // Overwrite ends
}

export function getActivationContext(unmanagedResourcesFolderName?: string): ActivationContext {
    const extraData = getExtraData();
    const activationContext: ActivationContext = {
        isExtended: false,
        embEndpointUrl: null,
        themeAssetsPath: '',
        appIncludes: {},
        appManifest: extraData.appManifest
    };

    NUtil.each(activationContext.appManifest.application || [], application => {
        activationContext.appIncludes[application] = {
            templates: [application + '-templates.js'],
            js: ['javascript/' + application + '.js'],
            css: ['css/' + application + '.css'],
            ie: extraData.ieFiles[application]
        };
    });

    function getNonManageResourcesPathPrefix(file: string): string {
        if (activationContext.appManifest.type === 'SCS') {
            if (unmanagedResourcesFolderName) {
                return `site/${unmanagedResourcesFolderName}/${file}`;
            }
            return `default/${file}`;
        }
        return file;
    }

    NUtil.each(activationContext.appIncludes, app => {
        app.templates = app.templates.map(getNonManageResourcesPathPrefix);
        app.css = app.css.map(getNonManageResourcesPathPrefix);

        if (unmanagedResourcesFolderName) {
            app.js.unshift('backward-compatibility-amd-unclean.js');
        }
    });

    NUtil.each(activationContext.appIncludes, app => {
        app.js = app.templates.concat(app.js);
    });

    return activationContext;
}