/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import Auth, { requireLogin, requirePermissions, Permission } from '../Libraries/Auth/Auth';
import { SCAServiceController } from '../Libraries/Controller/SCAServiceController';
import { ServiceContext } from '../../Common/Controller/ServiceController';
import { HttpResponse } from '../../Common/Controller/HttpResponse';
import { PaginationResponse } from '../../../ServiceContract/SC/PaginationResponse';
import {
    Transaction,
    TransactionFromRecord
} from '../../../ServiceContract/SC/Transaction/Transaction';
import { ReturnAuthorizationHandler } from './ReturnAuthorization.Handler';
import { Listable } from '../../../ServiceContract/SC/Listable';
import { ReturnAuthorizationFromRecord } from '../../../ServiceContract/SC/ReturnAuthorization/ReturnAuthorization';

const { transaction } = Auth.getPermissions();
@requireLogin()
@requirePermissions({ [Permission.VIEW]: [transaction.tranRtnAuth, transaction.tranFind] })
class ReturnAuthorizationServiceController extends SCAServiceController {
    public name = 'ReturnAuthorization.ServiceController2';

    private returnAuthorizationHandler: ReturnAuthorizationHandler = new ReturnAuthorizationHandler();

    public get(parameters: Listable<Transaction>): HttpResponse<PaginationResponse<Transaction>> {
        return new HttpResponse(this.returnAuthorizationHandler.search(parameters));
    }

    public getById(
        internalid: string,
        parameters: Listable<Transaction> & { recordtype: string }
    ): HttpResponse<Partial<TransactionFromRecord>> {
        return new HttpResponse(this.returnAuthorizationHandler.get(internalid, parameters));
    }

    @requirePermissions({ [Permission.CREATE]: [transaction.tranRtnAuth] })
    public post(
        body: ReturnAuthorizationFromRecord & {
            id: string;
            type: string;
            comments: string;
        },
        parameters: Listable<Transaction> & { recordtype: string }
    ): HttpResponse<ReturnAuthorizationFromRecord> {
        const id = this.returnAuthorizationHandler.create(body);
        return new HttpResponse(this.returnAuthorizationHandler.get(String(id), parameters), {
            customStatus: 201
        });
    }

    @requirePermissions({ [Permission.CREATE]: [transaction.tranRtnAuth] })
    public put(
        body: ReturnAuthorizationFromRecord & { status: string },
        parameters: Listable<Transaction> & { internalid: string }
    ): HttpResponse<ReturnAuthorizationFromRecord> {
        this.returnAuthorizationHandler.updateStatus(
            Number(parameters.internalid),
            body.status,
            this.request.headers
        );
        return new HttpResponse(
            this.returnAuthorizationHandler.get(parameters.internalid, parameters)
        );
    }
}

export = {
    service: function(ctx: ServiceContext): void {
        new ReturnAuthorizationServiceController(ctx).initialize();
    }
};