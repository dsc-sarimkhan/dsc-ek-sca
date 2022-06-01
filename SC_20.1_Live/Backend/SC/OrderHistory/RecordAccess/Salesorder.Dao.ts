/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import { SalesorderSchema } from './Salesorder.Schema';
import { TransactionDao } from '../../Transaction/RecordAccess/Transaction.Dao';
import { Configuration } from '../../Libraries/Configuration/Configuration';

export class SalesorderDao extends TransactionDao<SalesorderSchema> {
    protected salesorderSchema = SalesorderSchema.getInstance();
    protected schema: SalesorderSchema = this.salesorderSchema;

    public constructor() {
        super();
        this.getSchema().columns.formulatext.formula =
            "case when LENGTH({source})>0 then 2 else (case when {location.locationtype.id} = '" +
            Configuration.getInstance().get('locationTypeMapping.store.internalid') +
            "' then 1 else 0 end) end";
    }
}