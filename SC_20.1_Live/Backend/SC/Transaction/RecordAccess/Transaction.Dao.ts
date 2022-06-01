/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import { Environment } from '../../../Common/Environment/Environment';
import { TransactionSchema } from './Transaction.Schema';
import { Dao } from '../../../Common/Dao/Dao';
import { SchemaColumn } from '../../../Common/Schema/SchemaColumn';
import { Configuration } from '../../Libraries/Configuration/Configuration';
import { Schema } from '../../../Common/Schema/Schema';

export class TransactionDao<S extends TransactionSchema | Schema = TransactionSchema> extends Dao<
    S
> {
    private transactionSchema = TransactionSchema.getInstance();

    protected schema: S = <S>this.transactionSchema;

    private configuration = Configuration.getInstance();

    public constructor() {
        super();
        if (Environment.getInstance().isFeatureInEffect('MULTICURRENCY')) {
            this.getSchema().filters.amount = new SchemaColumn<string>('fxamount');
            this.getSchema().filters.appliedtolinkamount = new SchemaColumn<string>(
                'appliedtoforeignamount'
            );
            this.getSchema().columns.amount = new SchemaColumn<string>('fxamount');
            this.getSchema().columns.appliedtolinkamount = new SchemaColumn<string>(
                'appliedtoforeignamount'
            );
        }
    }

    public getCustomColumns(name: string): SchemaColumn<string>[] {
        const customColumns: SchemaColumn<string>[] = [];
        const configColumns = this.configuration.get('transactionListColumns');
        if (name && configColumns && configColumns['enable' + name]) {
            const lowerCaseName = name[0].toLowerCase() + name.substring(1);
            _.each(
                configColumns[lowerCaseName],
                (column: { id: string }): void => {
                    if (
                        !_.find(
                            this.getSchema().columns,
                            (schColumn): boolean => schColumn.columnName === column.id
                        )
                    ) {
                        customColumns.push(new SchemaColumn(column.id));
                    }
                }
            );
        }
        return customColumns;
    }
}