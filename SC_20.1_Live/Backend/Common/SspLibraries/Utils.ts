/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import './../../third_parties/underscore.js';

/**
 *
 * @deprecated
 * Do not create/modify/use this file methods.
 * Use this kind of logic from an specific module such as Configuration, Format, etc.
 * Create a new module if the one that you need does not exist.
 */
export function sanitizeString(text: string): string {
    // Remove any HTML code form the string
    // Could this be related to SC validation?
    return text
        ? text
              .replace(/<br>/g, '\n')
              .replace(/</g, '&lt;')
              .replace(/\>/g, '&gt;')
        : '';
}

export function deepExtend(target: any = {}, source: any = {}): any {
    if (_.isArray(target) || !_.isObject(target)) {
        return source;
    }

    _.each(source, function(value, key): void {
        if (key in target) {
            target[key] = deepExtend(target[key], value);
        } else {
            target[key] = value;
        }
    });

    return target;
}

export function getPathFromObject(object: object, path?: string, default_value?: any): any {
    if (!path) {
        return object;
    }
    if (object) {
        const tokens: string[] = path.split('.');
        let prev: object = object;
        let n = 0;

        while (!_.isUndefined(prev) && n < tokens.length) {
            prev = prev[tokens[n++]];
        }

        if (!_.isUndefined(prev)) {
            return prev;
        }
    }

    return default_value;
}

export function setPathFromObject(object: object, path: string, value: any): void {
    const tokens = path.split('.');
    let prev = object;

    for (let token_idx = 0; token_idx < tokens.length - 1; ++token_idx) {
        const current_token = tokens[token_idx];

        if (_.isUndefined(prev[current_token])) {
            prev[current_token] = {};
        }
        prev = prev[current_token];
    }

    prev[_.last(tokens)] = value;
}