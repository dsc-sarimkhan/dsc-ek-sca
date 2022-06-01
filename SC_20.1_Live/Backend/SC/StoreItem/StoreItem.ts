/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import '../../third_parties/underscore.js';
// @ts-ignore
import * as NrecordView from 'N/commerce/recordView'; // TODO: update NrecordView d.ts and remove ts-ignore
import * as log from 'N/log';
import { Configuration } from '../Libraries/Configuration/Configuration';
import { invalidItemsFieldsAdvancedName } from '../../Common/Controller/RequestErrors';

export interface ItemToPreload {
    internalid: string;
    itemtype: string;
    itemfields?: string[];
}

type ItemView<
    T = {
        itemid: string;
        itemoptions_detail: string;
        matrix_parent: ItemView;
        itemtype: string;
        internalid: string;
    }
> = { [K in keyof T]: any };

interface ItemViewDictionary {
    [id: string]: ItemView;
}

export class StoreItem {
    private items: ItemViewDictionary = {};

    private configuration = Configuration.getInstance();

    private fields = this.configuration.get('fieldKeys.itemsFieldsStandardKeys') || [];

    private static instance: StoreItem;

    private constructor() {}

    public static getInstance(): StoreItem {
        if (!this.instance) {
            this.instance = new StoreItem();
        }
        return this.instance;
    }

    private addItem(id: string, item: ItemView, fields: string[]): void {
        this.items[this.getItemKey(id, fields)] = item;
    }

    private getItem(id: string, fields: string[]): ItemView {
        return this.items[this.getItemKey(id, fields)];
    }

    // eslint-disable-next-line class-methods-use-this
    private getItemKey(id: string, fields?: string[]): string {
        return `${id}--${(fields || []).sort().join('--')}`;
    }

    private getItemFieldValues(
        items: { [id: string]: ItemToPreload },
        fields: string[]
    ): ItemView[] {
        const itemsIds: string[] = _.pluck(_.values(items), 'internalid');
        let fieldValues: ItemViewDictionary = {};

        try {
            fieldValues = this.viewItems(itemsIds.map(Number));
        } catch (e) {
            throw invalidItemsFieldsAdvancedName;
        }
        return _.values(fieldValues);
    }

    // eslint-disable-next-line class-methods-use-this
    public viewItems(ids: number[], fieldsArray?: string[]): ItemViewDictionary {
        // TODO: test this in SCS
        let fields: string[] = _.flatten(
            (fieldsArray || this.fields).map((field): string[] => this.fields[field] || [field])
        );
        if (!fieldsArray) {
            fields = _.union(fields, [
                'isbackorderable',
                'isfulfillable',
                'isinactive',
                'itemimages_detail',
                'isonline',
                'isstorepickupallowed',
                'quantityavailableforstorepickup_detail',
                'urlcomponent'
            ]);
        }
        let items: ItemViewDictionary;
        ids = ids.filter((id): boolean => id >= 0);
        try {
            items = ids.length ? NrecordView.viewItems({ ids, fields }) || {} : {};
        } catch (e) {
            // try again if there are unsopported fields:
            const invalidFields: string = e.message && e.message.match(/\[[^\]]+/);
            log.debug('Error: invalid item fields', invalidFields);
            if (invalidFields[0]) {
                const invalidFieldsArray: string[] = invalidFields[0]
                    .slice(1)
                    .replace(/\s+/g, '')
                    .split(',');
                try {
                    items =
                        NrecordView.viewItems({
                            ids: ids,
                            fields: fields.filter(
                                (el): boolean => invalidFieldsArray.indexOf(el) < 0
                            )
                        }) || {};
                } catch (ex) {
                    log.debug('Error getting item', ex);
                }
            }
        }

        // There is something weird with the keys of NrecordView.viewItems returned object.
        // Object is inaccesible in some cases unless we use JSON.stringify
        return items && JSON.parse(JSON.stringify(items));
    }

    public get(id: string, type?: string, fields?: string[]): ItemView {
        if (type && !this.getItem(id, fields)) {
            this.preloadItems(
                [
                    {
                        internalid: id,
                        itemtype: type
                    }
                ],
                fields
            );
        }
        return this.getItem(id, fields);
    }

    public preloadItems(items: ItemToPreload[] = [], fields?: string[]): void {
        if (!this.fields.length && !fields) {
            return;
        }

        const itemsById: { [id: string]: ItemToPreload } = {};
        const parentItemsById: { [id: string]: ItemToPreload } = {};

        items.forEach(
            (item: ItemToPreload): void => {
                if (
                    !isNaN(Number(item.internalid)) &&
                    ['Discount', 'OthCharge', 'Markup'].indexOf(item.itemtype) === -1 &&
                    !this.getItem(item.internalid, fields)
                ) {
                    itemsById[item.internalid] = {
                        internalid: String(item.internalid),
                        itemtype: item.itemtype,
                        itemfields: this.fields || fields
                    };
                }
            }
        );

        if (_.size(itemsById)) {
            this.getItemFieldValues(itemsById, fields).forEach(
                (item: ItemView): void => {
                    if (item && typeof item.itemid !== 'undefined') {
                        if (
                            item.itemoptions_detail &&
                            item.itemoptions_detail.matrixtype === 'child'
                        ) {
                            parentItemsById[item.itemoptions_detail.parentid] = {
                                internalid: String(item.itemoptions_detail.parentid),
                                itemtype: item.itemtype,
                                itemfields: this.fields || fields
                            };
                        }
                        this.addItem(item.internalid, item, fields);
                    }
                }
            );

            this.getItemFieldValues(parentItemsById, fields).forEach(
                (item: ItemView): void => {
                    if (item && typeof item.itemid !== 'undefined') {
                        this.addItem(item.internalid, item, fields);
                    }
                }
            );

            this.items = _.mapObject(
                this.items,
                (item: ItemView): ItemView => {
                    const mappedItem = item;
                    if (item.itemoptions_detail && item.itemoptions_detail.matrixtype === 'child') {
                        mappedItem.matrix_parent = this.getItem(
                            item.itemoptions_detail.parentid,
                            fields
                        );
                    }
                    return item;
                }
            );
        }
    }
}