/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import { Schema } from '../../../Common/Schema/Schema';
import { SchemaColumn } from '../../../Common/Schema/SchemaColumn';

export class FulfillingtransactionSchema implements Schema {
    public type = 'transaction';

    private static instance: FulfillingtransactionSchema;

    private constructor(){}

    public static getInstance(): FulfillingtransactionSchema {
        if (!this.instance) {
            this.instance = new FulfillingtransactionSchema();
        }
        return this.instance;
    }

    public fields = {};

    public columns = {
        item: new SchemaColumn<string>('item'),
        shipmethod: new SchemaColumn<string>('shipmethod'),
        shipto: new SchemaColumn<string>('shipto'),
        trackingnumbers: new SchemaColumn<string>('trackingnumbers'),
        trandate: new SchemaColumn<string>('trandate'),
        status: new SchemaColumn<string>('status'),
        shipaddress: new SchemaColumn<string>('shipaddress'),
        shipaddress1: new SchemaColumn<string>('shipaddress1'),
        shipaddress2: new SchemaColumn<string>('shipaddress2'),
        shipaddressee: new SchemaColumn<string>('shipaddressee'),
        shipattention: new SchemaColumn<string>('shipattention'),
        shipcity: new SchemaColumn<string>('shipcity'),
        shipcountry: new SchemaColumn<string>('shipcountry'),
        shipstate: new SchemaColumn<string>('shipstate'),
        shipzip: new SchemaColumn<string>('shipzip')
    };

    public filters = {};

    public joins = {};

    public sublists = {};

    public transformDefaults = {};

    public initializeDefaults = {};
}