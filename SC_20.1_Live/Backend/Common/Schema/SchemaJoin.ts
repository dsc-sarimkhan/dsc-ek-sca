/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import { Schema } from './Schema';
import { SchemaColumn } from './SchemaColumn';

type SchemaKeyOfDictionary<T> = { [name in keyof T]: SchemaColumn };

export class SchemaJoin<Id = string, SchemaType extends Schema = Schema> {
    private joinId: string;

    public columns: SchemaKeyOfDictionary<SchemaType['columns']>;

    public filters: SchemaKeyOfDictionary<SchemaType['filters']>;

    public constructor(id: string, schema: SchemaType) {
        this.joinId = id;
        this.columns = <SchemaKeyOfDictionary<SchemaType['columns']>>schema.columns;
        this.filters = <SchemaKeyOfDictionary<SchemaType['filters']>>schema.filters;
        this.overrideGetter(this.columns);
        this.overrideGetter(this.filters);
    }

    private overrideGetter(prop): void {
        // TODO: this can be a decorator
        _.each(
            prop,
            (column: SchemaColumn, key: string): void => {
                Object.defineProperty(prop, key, {
                    configurable: true,
                    get: (): SchemaColumn => {
                        column.columnName = `${this.joinId}.${column.columnName
                            .split('.')
                            .slice(-1)}`;
                        return column;
                    }
                });
            }
        );
    }
}