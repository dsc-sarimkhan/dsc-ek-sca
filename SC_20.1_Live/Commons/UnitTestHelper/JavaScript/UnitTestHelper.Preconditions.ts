/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="UnitTestHelper.Preconditions"/>
/* jshint -W020 */

import * as _ from 'underscore';

import * as Utils from '../../Utilities/JavaScript/Utils';

function deepExtend(obj) {
    const isNullItemFn = function(item) {
        return _.isNull(item);
    };
    const parentRE = /#{\s*?_\s*?}/;
    const { slice } = Array.prototype;

    _.each(slice.call(arguments, 1), function(source: any) {
        for (const prop in source) {
            if (
                _.isUndefined(obj[prop]) ||
                _.isFunction(obj[prop]) ||
                _.isNull(source[prop]) ||
                _.isDate(source[prop])
            ) {
                obj[prop] = source[prop];
            } else if (_.isString(source[prop]) && parentRE.test(source[prop])) {
                if (_.isString(obj[prop])) {
                    obj[prop] = source[prop].replace(parentRE, obj[prop]);
                }
            } else if (_.isArray(obj[prop]) || _.isArray(source[prop])) {
                if (!_.isArray(obj[prop]) || !_.isArray(source[prop])) {
                    throw new Error('Trying to combine an array with a non-array (' + prop + ')');
                } else {
                    obj[prop] = _.reject(
                        Utils.deepExtend(_.clone(obj[prop]), source[prop]),
                        isNullItemFn
                    );
                }
            } else if (_.isObject(obj[prop]) || _.isObject(source[prop])) {
                if (!_.isObject(obj[prop]) || !_.isObject(source[prop])) {
                    throw new Error('Trying to combine an object with a non-object (' + prop + ')');
                } else {
                    obj[prop] = Utils.deepExtend(_.clone(obj[prop]), source[prop]);
                }
            } else {
                obj[prop] = source[prop];
            }
        }
    });
    return obj;
}

_.mixin({ deepExtend: deepExtend });

export = {
    setDefaultEnvironment: function() {
        (<any>window).SC = this.deepExtend((<any>window).SC || {}, {
            ENVIRONMENT: {
                siteSettings: {
                    registration: { displaycompanyfield: 'F' },
                    countries: { UY: { isziprequired: 'T' } }
                },
                SENSORS_ENABLED: false
            },
            isPageGenerator: () => false
        });
    },

    // similar to jQuery.extend() for recursively/deep extend. Adapted from https://gist.github.com/kurtmilam/1868955
    deepExtend: deepExtend
};
