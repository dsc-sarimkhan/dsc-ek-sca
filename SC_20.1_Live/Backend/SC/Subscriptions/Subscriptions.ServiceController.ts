/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import { SubscriptionsModel, SubscriptionBillingAccounts, SubscriptionsSearch, Subscription } from './Subscriptions.Model';
import { badRequestError } from '../../Common/Controller/RequestErrors';
import { SCAServiceController } from '../Libraries/Controller/SCAServiceController';
import { HttpResponse } from '../../Common/Controller/HttpResponse';
import { Configuration }  from '../Libraries/Configuration/Configuration';

class SubscriptionsServiceController extends SCAServiceController {
    private configuration = Configuration.getInstance();

    public readonly name = 'Subscriptions.ServiceController';

    protected options = {
        common: {
            requireLogin: true
        }
    };

    public getById() : HttpResponse<Subscription> {
        const subscriptionsModel = new SubscriptionsModel(this.request.parameters.internalid);
        
        return new HttpResponse(subscriptionsModel.get(this.request.parameters.internalid));
    }

    public get() : HttpResponse<SubscriptionBillingAccounts | SubscriptionsSearch> {
        const subscriptionsModel: SubscriptionsModel = new SubscriptionsModel();
        const { billingAccounts } = this.request.parameters;

        if (billingAccounts) {
            return new HttpResponse(subscriptionsModel.searchBillingAccounts());
        }

        const { filter, order, sort, from, to, page } = this.request.parameters;
      
        return new HttpResponse(subscriptionsModel.search({
            filter: filter,
            order: order,
            sort: sort,
            from: from,
            to: to,
            page: page || 1
        }));
    }

    public put() : HttpResponse<Subscription> {
        if (!this.data.internalid) {
            throw badRequestError;
        }

        const subscriptionsModel: SubscriptionsModel = new SubscriptionsModel(this.data.internalid);

        if (this.data.action === 'delete' && !_.isUndefined(this.data.lineNumber)) {
            if (
                this.configuration.get('subscriptions.lineStatusChange') !== "Don't Allow Status Changes"
            ) {
                subscriptionsModel.suspendLine(this.data);
            } else {
                throw 'Cancelling subscription lines is not allowed. Please contact your sales representative.';
            }
        } else if (!_.isUndefined(this.data.quantity) && !_.isUndefined(this.data.lineNumber)) {
            subscriptionsModel.updateLine(this.data);
        } else if (
            this.configuration.get('subscriptions.generalStatusChange') ===
                'Allow Suspending / Resuming' &&
            _.isUndefined(this.data.lineNumber)
        ) {
            subscriptionsModel.reactivateSubscription(this.data);
        } else {
            throw 'Resuming subscriptions is not allowed. Please contact your sales representative.';
        }
        
        return new HttpResponse(subscriptionsModel.get(this.data.internalid));
    }

    public delete() : HttpResponse<Subscription> {
        const id = this.request.parameters.internalid;
        if (!id) {
            throw badRequestError;
        }

        const subscriptionsModel: SubscriptionsModel = new SubscriptionsModel(id);

        if (
            this.configuration.get('subscriptions.generalStatusChange') !== "Don't Allow Status Changes"
        ) {
            subscriptionsModel.suspendSubscription();
        } else {
            throw 'Cancelling subscriptions is not allowed. Please contact your sales representative.';
        }

        return new HttpResponse(subscriptionsModel.get(id));
    }
}

export = {
    service: function(ctx: any): void {
        new SubscriptionsServiceController(ctx).initialize();
    }
};