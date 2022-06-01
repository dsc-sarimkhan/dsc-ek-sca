/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import Auth, {
    requireLogin,
    requirePermissions,
    requireAtLeastOnePermission,
    Permission
} from '../Libraries/Auth/Auth';
import { SCAServiceController } from '../Libraries/Controller/SCAServiceController';
import { ServiceContext } from '../../Common/Controller/ServiceController';
import { HttpResponse } from '../../Common/Controller/HttpResponse';
import { PaginationResponse } from '../../../ServiceContract/SC/PaginationResponse';
import { Transaction } from '../../../ServiceContract/SC/Transaction/Transaction';
import { TransactionHistoryHandler } from './TransactionHistory.Handler';
import { Listable } from '../../../ServiceContract/SC/Listable';

const { transaction } = Auth.getPermissions();
@requireLogin()
@requirePermissions({ [Permission.EDIT]: [transaction.tranFind] })
@requireAtLeastOnePermission({
    [Permission.EDIT]: [
        transaction.tranCustInvc,
        transaction.tranCustCred,
        transaction.tranCustPymt,
        transaction.tranCustDep,
        transaction.tranDepAppl
    ]
})
class TransactionHistoryServiceController extends SCAServiceController {
    public name = 'TransactionHistory.ServiceController2';

    private transactionHistoryHandler: TransactionHistoryHandler = new TransactionHistoryHandler();

    public get(parameters: Listable<Transaction>): HttpResponse<PaginationResponse<Transaction>> {
        return new HttpResponse(this.transactionHistoryHandler.search(parameters));
    }
}

export = {
    service: function(ctx: ServiceContext): void {
        new TransactionHistoryServiceController(ctx).initialize();
    }
};