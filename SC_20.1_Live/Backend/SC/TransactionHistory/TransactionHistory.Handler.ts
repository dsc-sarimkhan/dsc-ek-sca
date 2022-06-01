/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import { TransactionHandler } from '../Transaction/Transaction.Handler';
import { TransactionDao } from '../Transaction/RecordAccess/Transaction.Dao';

export class TransactionHistoryHandler extends TransactionHandler<TransactionDao['schema']> {
    protected dao = new TransactionDao();

    protected customColumnsKey = 'TransactionHistory';
}