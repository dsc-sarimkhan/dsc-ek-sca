/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import { SCAServiceController } from '../Libraries/Controller/SCAServiceController';
import { ServiceContext } from '../../Common/Controller/ServiceController';
import { OrderHistory } from '../../../ServiceContract/SC/OrderHistory/OrderHistory';
import { OrderHistoryHandler, Tax } from './OrderHistory.Handler';
import Auth, { requireLogin, requirePermissions, Permission } from '../Libraries/Auth/Auth';
import { HttpResponse } from '../../Common/Controller/HttpResponse';
import { Listable } from '../../../ServiceContract/SC/Listable';
import { Transaction } from '../../../ServiceContract/SC/Transaction/Transaction';
import { PaginationResponse } from '../../../ServiceContract/SC/PaginationResponse';

@requireLogin()
@requirePermissions({
    [Permission.EDIT]: [
        Auth.getPermissions().transaction.tranFind,
        Auth.getPermissions().transaction.tranSalesOrd
    ]
})
class OrderHistoryServiceController extends SCAServiceController {
    public name = 'OrderHistory.ServiceController2';

    private orderHistoryHandler: OrderHistoryHandler = new OrderHistoryHandler();

    public get(parameters: Listable<Transaction>): HttpResponse<PaginationResponse<Transaction>> {
        return new HttpResponse(this.orderHistoryHandler.search(parameters));
    }

    public getById(
        internalid: string,
        parameters: Listable<Transaction> & { recordtype?: string }
    ): HttpResponse<OrderHistory | Tax[]> {
        let result: OrderHistory | Tax[];
        if (parameters.recordtype) {
            result = this.orderHistoryHandler.get(internalid, parameters);
        } else {
            result = this.orderHistoryHandler.getTaxes(internalid);
        }
        return new HttpResponse(result);
    }

    public put(
        body: { status: string },
        parameters: Listable<Transaction> & { internalid: string }
    ): HttpResponse<OrderHistory & { cancel_response?: string }> {
        const cancelResult = this.orderHistoryHandler.updateStatus(
            Number(parameters.internalid),
            body.status,
            this.request.headers
        );
        const record: OrderHistory & { cancel_response?: string } = this.orderHistoryHandler.get(
            parameters.internalid,
            parameters
        );
        record.cancel_response = cancelResult;
        return new HttpResponse(record);
    }
}

export = {
    service: function(ctx: ServiceContext): void {
        new OrderHistoryServiceController(ctx).initialize();
    }
};