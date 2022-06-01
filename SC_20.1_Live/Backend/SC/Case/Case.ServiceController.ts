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
import { HttpResponse } from '../../Common/Controller/HttpResponse';
import { Case } from '../../../ServiceContract/SC/Case/Case';
import { PaginationResponse } from '../../../ServiceContract/SC/PaginationResponse';
import { Listable } from '../../../ServiceContract/SC/Listable';
import { CaseHandler } from './Case.Handler';
import Auth, { requireLogin, requirePermissions, Permission } from '../Libraries/Auth/Auth';
import { notFoundError } from '../../Common/Controller/RequestErrors';

@requireLogin()
@requirePermissions({ [Permission.EDIT]: [Auth.getPermissions().lists.listCase] })
class CaseServiceController extends SCAServiceController {
    public readonly name = 'Case.ServiceController2';

    private caseHandler: CaseHandler = new CaseHandler();

    public getById(id: string): HttpResponse<Case> {
        const record: Case = this.caseHandler.get(id);
        if (!record) {
            throw notFoundError;
        }
        return new HttpResponse(record);
    }

    public get(parameters: Listable<Case>): HttpResponse<PaginationResponse<Case>> {
        const listHeaderData: Listable<Case> = {
            filter: parameters.filter,
            order: parameters.order,
            sort: parameters.sort,
            from: parameters.from,
            to: parameters.to,
            page: parameters.page
        };

        return new HttpResponse(this.caseHandler.search(listHeaderData));
    }

    public post(body: Partial<Case> & { category: number }): HttpResponse<Case> {
        const caseId: number = this.caseHandler.create({
            statusid: body.status && body.status.id,
            title: body.title,
            message: body.message,
            category: body.category,
            email: body.email
        });

        return new HttpResponse(this.caseHandler.get(String(caseId)));
    }

    public put(body: Case, parameters: { internalid: string }): HttpResponse<Case> {
        const internalid: string = parameters.internalid || body.internalid;
        const caseInput = {
            id: internalid,
            statusid: body.status && body.status.id,
            reply: body.reply
        };
        if (caseInput.statusid) {
            this.caseHandler.update(caseInput);
        }

        return new HttpResponse(this.caseHandler.get(internalid));
    }
}

export = {
    service: function(ctx: ServiceContext): void {
        new CaseServiceController(ctx).initialize();
    }
};