/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard"/>

import OrderWizardRouter = require('./OrderWizard.Router');
import LiveOrderModel = require('../../../Commons/LiveOrder/JavaScript/LiveOrder.Model');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import OrderWizardView = require('./OrderWizard.View');

const OrderWizard: any = {
    mountToApp: function(application) {
        const order_wizard_router = new OrderWizardRouter(application, {
            model: LiveOrderModel.getInstance(),
            profile: ProfileModel.getInstance(),
            steps: application.getConfig('checkoutSteps')
        });

        OrderWizardView.wizard = order_wizard_router;

        const checkout_component = application.getComponent('Checkout');
        checkout_component._setOrderWizardRouter(order_wizard_router);
    }
};

export = OrderWizard;
