/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import { Schema } from '../../../Common/Schema/Schema';
import { Type } from '../../../Common/ActiveRecord/ActiveRecord';
import { SchemaColumn } from '../../../Common/Schema/SchemaColumn';

export class ItemSchema implements Schema {
    public type = Type.INVENTORY_ITEM;

    private static instance: ItemSchema;

    private constructor(){}

    public static getInstance(): ItemSchema {
        if (!this.instance) {
            this.instance = new ItemSchema();
        }
        return this.instance;
    }

    public fields = {};

    public columns = {
        id: new SchemaColumn<string>('id'),
        item: new SchemaColumn<string>('item'),
        internalid: new SchemaColumn<string>('internalid'),
        type: new SchemaColumn<string>('type'),
        parent: new SchemaColumn<string>('parent'),
        displayname: new SchemaColumn<string>('displayname'),
        storedisplayname: new SchemaColumn<string>('storedisplayname'),
        itemid: new SchemaColumn<string>('itemid')
    };

    public filters = {
        internalid: new SchemaColumn<string>('internalid')
    };

    public sublists = {};

    public joins = {};

    public transformDefaults = {};

    public initializeDefaults = {};
}