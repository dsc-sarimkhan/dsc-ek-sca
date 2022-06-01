/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope Public
 */

import * as search from 'N/search';
import * as record from 'N/record';
import { Dictionary } from 'underscore';

/**
 *
 * @deprecated
 * Do not create/modify/use this file methods.
 * Use this kind of logic from an specific module such as Search, ActiveRecord, Auth, etc.
 * Create a new module if the one that you need does not exist.
 */
export = {
    getFieldsAsObject(
        rec: record.Record,
        values?: Dictionary<string>,
        texts?: Dictionary<string>,
        texts_and_values?: Dictionary<string>,
        sublist_name?: string
    ) {
        const obj = {};

        if (sublist_name) {
            _.each(values, function(value: string, key: string) {
                obj[key] = rec.getCurrentSublistValue({
                    sublistId: sublist_name,
                    fieldId: value
                });
            });
            _.each(texts, function(value: string, key: string) {
                obj[key] = rec.getCurrentSublistText({
                    sublistId: sublist_name,
                    fieldId: value
                });
            });
            _.each(texts_and_values, function(value: string, key: string) {
                obj[key] = {};
                obj[key][value.concat('Value')] = rec.getCurrentSublistValue({
                    sublistId: sublist_name,
                    fieldId: value
                });
                obj[key][value.concat('Text')] = rec.getCurrentSublistText({
                    sublistId: sublist_name,
                    fieldId: value
                });
            });
        } else {
            _.each(values, function(value: string, key: string) {
                obj[key] = rec.getValue({ fieldId: value });
            });
            _.each(texts, function(value: string, key: string) {
                obj[key] = rec.getText({ fieldId: value });
            });
            _.each(texts_and_values, function(value: string, key: string) {
                obj[key] = {};
                obj[key][value.concat('Value')] = rec.getValue({
                    fieldId: value
                });
                obj[key][value.concat('Text')] = rec.getText({
                    fieldId: value
                });
            });
        }
        return obj;
    },

    iterateSublist(rec: record.Record, sublist_name: string, fn: (number) => any) {
        const lines_length = rec.getLineCount({
            sublistId: sublist_name
        });

        for (let line = 0; line < lines_length; line++) {
            rec.selectLine({
                sublistId: sublist_name,
                line: line
            });

            var result = fn(line);
            if (result === false) {
                break;
            }
        }
    },

    iterateAllSearchResults(type, columns, filters, page, fn) {
        const paged = !!page
            ? {
                  pageSize: 20
              }
            : {};
        const paged_search = search
            .create({
                type: type,
                columns: columns,
                filters: filters
            })
            .runPaged(paged);

        if (paged_search.count == 0) return;

        if (!!page) {
            const my_page = paged_search.fetch({ index: page - 1 });
            my_page.data.forEach(fn);

            return my_page.pagedData.count;
        } else {
            paged_search.pageRanges.forEach(function(pageRange) {
                const my_page = paged_search.fetch({ index: pageRange.index });
                my_page.data.forEach(fn);
            });
        }
    }
};