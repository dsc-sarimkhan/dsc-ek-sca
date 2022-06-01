/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import * as Nrecord from 'N/record';
import { ActiveRecord, FieldValue, RecordOptions } from '../ActiveRecord/ActiveRecord';
import { Schema } from '../Schema/Schema';
import { Search } from '../SearchRecord/Search';

export abstract class Dao<S extends Schema> {
    protected abstract schema: S;

    public getSchema(): S {
        return this.schema;
    }

    public createRecord<S extends Schema>(options?: RecordOptions<S>): ActiveRecord<Schema> {
        return new ActiveRecord({
            schema: this.schema,
            isDynamic: options && options.isDynamic,
            defaultValues: options && options.defaultValues
        });
    }

    public loadRecord<S extends Schema>(
        id: number,
        options?: RecordOptions<S> & { recordtype?: string }
    ): ActiveRecord<Schema> {
        return new ActiveRecord({
            schema: this.schema,
            recordtype: options && options.recordtype,
            isDynamic: options && options.isDynamic,
            defaultValues: options && options.defaultValues,
            id: id
        });
    }

    public transformRecord<S extends Schema>(
        options: RecordOptions<S> & { id: number; fromSchema: Schema }
    ): ActiveRecord {
        return new ActiveRecord({
            schema: this.schema,
            isDynamic: options.isDynamic,
            defaultValues: options.defaultValues,
            id: options.id,
            fromSchema: options.fromSchema
        });
    }

    public createSearch<T>(): Search<T> {
        return new Search<T>(this.schema.type);
    }

    public deleteRecord(id: number): void {
        Nrecord.delete({ type: this.schema.type, id: id });
    }

    public submitFields<T extends { [field: string]: FieldValue }>(
        fields: T,
        id: number,
        options: {
            enablesourcing: boolean;
            ignoreMandatoryFields: boolean;
        } = { enablesourcing: true, ignoreMandatoryFields: false }
    ): number {
        return Nrecord.submitFields({
            type: this.schema.type,
            id: id,
            values: fields,
            options: {
                enableSourcing: options.enablesourcing,
                ignoreMandatoryFields: options.ignoreMandatoryFields
            }
        });
    }
}