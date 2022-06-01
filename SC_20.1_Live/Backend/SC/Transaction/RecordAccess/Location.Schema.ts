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

export class LocationSchema implements Schema {
    public type = Type.LOCATION;

    private static instance: LocationSchema;

    private constructor(){}

    public static getInstance(): LocationSchema {
        if (!this.instance) {
            this.instance = new LocationSchema();
        }
        return this.instance;
    }

    public fields = {};

    public columns = {
        locationtype: new SchemaColumn<string>('locationtype')
    };

    public filters = {
        locationtype: new SchemaColumn<string>('locationtype')
    };

    public joins = {};

    public sublists = {};

    public transformDefaults = {};

    public initializeDefaults = {};
}