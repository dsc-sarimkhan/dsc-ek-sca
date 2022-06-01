/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import { ServiceController, ServiceContext } from '../../../Common/Controller/ServiceController';
import { Configuration } from '../Configuration/Configuration';
import Auth from '../Auth/Auth';

import { unauthorizedError, forbiddenError } from '../../../Common/Controller/RequestErrors';
import { Environment } from '../../../Common/Environment/Environment';

export abstract class SCAServiceController extends ServiceController {
    public constructor(context: ServiceContext) {
        super(context);
        const siteId = Number(this.request.parameters.n);
        const domain: string =
            this.request.parameters.domain || Environment.getInstance().getHost();

        Configuration.getInstance().setSiteAndDomain(siteId, domain, this.request.url);
    }

    protected handle(): void {
        const serviceAction: string = this.getServiceAction();
        if (!Auth.validateLogin(serviceAction)) {
            return this.sendError(unauthorizedError);
        }
        if (!Auth.validatePermissions(serviceAction)) {
            return this.sendError(forbiddenError);
        }
        return super.handle();
    }
}