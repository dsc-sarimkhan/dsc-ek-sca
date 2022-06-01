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
import { CaseHandler } from './Case.Handler';
import { CaseFields } from '../../../ServiceContract/SC/Case/Case';
import Auth, { requireLogin, requirePermissions, Permission } from '../Libraries/Auth/Auth';

@requireLogin()
@requirePermissions({ [Permission.EDIT]: [Auth.getPermissions().lists.listCase] })
class CaseFieldsServiceController extends SCAServiceController {
    public name = 'Case.Fields.ServiceController2';

    private caseHandler: CaseHandler = new CaseHandler();

    public get(): HttpResponse<CaseFields> {
        return new HttpResponse(this.caseHandler.getCaseFields());
    }
}

export = {
    service: function(ctx: ServiceContext): void {
        new CaseFieldsServiceController(ctx).initialize();
    }
};