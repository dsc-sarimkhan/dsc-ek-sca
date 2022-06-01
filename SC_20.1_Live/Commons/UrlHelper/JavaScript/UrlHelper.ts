/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="UrlHelper"/>

import * as _ from 'underscore';

import * as Utils from '../../Utilities/JavaScript/Utils';

// @class UrlHelper Keeps track of the URL, triggering custom events to specific parameters.
// Provides methods to add, get and remove parameters from the url.
// Extends Utils and add this methods to underscore.
// As an application module, when mounted to the application will listen to onAfterAppendView
// and will update itself with the new url @extends ApplicationModule
const UrlHelper: any = {
    // @property {String} url
    url: '',
    // @property {Object} listeners
    listeners: {},
    // @property {Object} parameters
    parameters: {},

    // @method setUrl @param {String} url
    setUrl: function(url: string) {
        this.url = url;
        this.parameters = {};

        // for each of the listeners
        _.each(this.listeners, (fn, token) => {
            const parameter_value = this.getParameterValue(token);

            // if the key (token) is in the url
            if (parameter_value) {
                // we trigger the function
                const value = _.isFunction(fn) ? fn(parameter_value) : fn;

                // if there is a value, we store it in our parameters object
                if (value) {
                    if (_.isBoolean(value)) {
                        this.parameters[token] = parameter_value;
                    } else {
                        this.parameters[token] = value;
                    }
                }
            }
        });
    },

    // @method addTokenListener @param {String} token @param {Function} fn
    addTokenListener: function(token, fn) {
        this.listeners[token] = fn;
    },

    // @method getParameters @return {Object}
    getParameters: function() {
        return this.parameters;
    },

    // @method getParameterValue @param {String} parameter @return {String}
    getParameterValue: function(parameter) {
        const value = this.url.match(parameter + '{1}\\={1}(.*?[^&#]*)');

        if (value && value[1]) {
            return value[1];
        }
        return '';
    },

    // @method clearValues
    clearValues: function() {
        this.url = '';
        this.listeners = {};
        this.parameters = {};
    },

    // @module Utils @class Utils
    // @method fixUrl added by UrlHelper @param {String} url
    fixUrl: function(url: string): string {
        if (!new RegExp('^http').test(url)) {
            const parameters = UrlHelper.getParameters();
            let charValue = '';
            let value;

            // for each of the parameters in the helper
            _.each(parameters, function(i, parameter) {
                value = url.match(new RegExp(parameter + '{1}\\={1}(.*?[^&]*)'));

                // if the parameter is not in the url
                if (!value) {
                    charValue = ~url.indexOf('?') ? '&' : '?';
                    // we append it
                    url += charValue + parameter + '=' + parameters[parameter];
                }
            });
        }

        return url;
    },

    // @method setUrlParameter changes the value of a parameter in the url
    // @param {String} url @param {String} parameter @param {String} new_value
    setUrlParameter: function(url: string, parameter, new_value): string {
        const value = url.match(new RegExp(parameter + '{1}\\={1}(.*?[^(&|#)]*)'));
        let charValue = '';

        if (value) {
            return url.replace(value[0], parameter + '=' + new_value);
        }
        charValue = ~url.indexOf('?') ? '&' : '?';
        return url + charValue + parameter + '=' + new_value;
    },

    // @method removeUrlParameter @param {String} url @param {String} parameter
    removeUrlParameter: function(url: string, parameter): string {
        let base_url = url.split('?')[0];
        let param;
        let parameters_list = [];
        const query = url.indexOf('?') !== -1 ? url.split('?')[1] : '';

        if (query) {
            parameters_list = query.split('&');

            for (let i = parameters_list.length - 1; i >= 0; i -= 1) {
                param = parameters_list[i].split('=')[0];

                if (param === parameter) {
                    parameters_list.splice(i, 1);
                }
            }

            base_url = base_url + '?' + parameters_list.join('&');
        }
        return base_url;
    },

    removeUrlParameters: function(url: string, parameters): string {
        _.each(parameters, parameter => {
            url = this.removeUrlParameter(url, parameter);
        });

        return url;
    }
};

_.mixin(Utils);

export = _.extend(UrlHelper, {
    mountToApp: function(Application) {
        Application.getLayout().on('afterAppendView', () => {
            // Every time afterAppendView is called, we set the url to the helper
            this.setUrl(window.location.href);
        });
    }
});
