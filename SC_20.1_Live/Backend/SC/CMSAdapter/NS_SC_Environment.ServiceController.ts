/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.



	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import { EntryPoints } from 'N/types';
import * as url from 'N/url';
import { ServiceController } from '../../Common/Controller/ServiceController';
import { HttpResponse } from '../../Common/Controller/HttpResponse';

import Context = EntryPoints.Suitelet.onRequestContext;

class NSSCEnvironmentServiceController extends ServiceController {
    public readonly name = 'NS_SC_Environment.ServiceController2';

    // eslint-disable-next-line class-methods-use-this
    public get(): HttpResponse<{ backendAccountDomain: string }> {
        const domain = url.resolveDomain({
            hostType: url.HostType.APPLICATION
        });

        return new HttpResponse({ backendAccountDomain: domain });
    }
}

export = {
    service: function(ctx: Context): void {
        new NSSCEnvironmentServiceController(ctx).initialize();
    }
};