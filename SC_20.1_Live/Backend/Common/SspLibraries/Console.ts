/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import './../../third_parties/underscore.js';
import Nlog = require('N/log');
// Maximum length for details and title for nlapiLogExecution.
// Actual maxTitleLength is 99, setting to 95 to use the remaining characters to make "pagination" possible.
const maxDetailsLength = 3995;
const maxTitleLength = 95;
const noop = function(content: any, title: string = ''): void {};
const console = {
    log: noop,
    error: noop,
    info: noop,
    warn: noop,
    timeEntries: [],
    trace: function(): void {
        try {
            throw new Error();
        } catch (err) {
            const stack = err.stack
                .replace(/^[^\(]+?[\n$]/gm, '')
                .replace(/^\s+at\s+/gm, '')
                .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
                .split('\n');
            console.log(stack);
        }
    },

    time: function(text: string): void {
        if (typeof text === 'string') {
            console.timeEntries[text] = Date.now();
        }
    },

    timeEnd: function(text: string): number {
        let result = NaN;
        if (typeof console.timeEntries[text] !== 'undefined') {
            result = Date.now() - console.timeEntries[text];
            console.log(text + ':', result + 'ms');
            delete console.timeEntries[text];
        }
        return result;
    }
};

/* Mostly to display the actual UNEXPECTED_ERROR */
function basicClone(value: any): any {
    const type: string = typeof value;
    if (type === 'function') {
        return 'function';
    }
    if (!value || type !== 'object') {
        return value;
    }
    const result = {};
    Object.keys(value).forEach(function(key): void {
        const val = value[key];
        const value_type = typeof val;
        if (value_type === 'string' || value_type === 'number' || value_type === 'boolean') {
            result[key] = val;
        } else {
            result[key] = value_type;
        }
    });
    return result;
}

function stringify(value: any): string {
    if (value && value.toJSON) {
        return value.toJSON();
    }
    return JSON.stringify(basicClone(value));
}

const levels = { log: 'debug', info: 'audit', error: 'emergency', warn: 'error' };

_.each(levels, function(level: string, fn: string): void {
    console[fn] = function(content: any, title: string = ''): void {
        let details: any = typeof content === 'object' ? stringify(content) : content;

        if (details && details.length > maxDetailsLength) {
            details = details.match(new RegExp('.{1,' + maxDetailsLength + '}', 'g'));
        } else {
            details = [details];
        }

        _.each(details, function(detail, key, list): void {
            const newTitle: string =
                list.length > 1
                    ? title.substring(0, maxTitleLength) + '(' + (key + 1) + ')'
                    : title;
            Nlog[level]({
                title: newTitle,
                details: detail
            });
        });
    };
});

export = console;