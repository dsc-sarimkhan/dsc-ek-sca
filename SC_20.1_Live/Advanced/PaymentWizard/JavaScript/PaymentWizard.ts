/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PaymentWizard"/>

import PaymentWizardRouter = require('./PaymentWizard.Router');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import LivePaymentModel = require('../../LivePayment/JavaScript/LivePayment.Model');
import PaymentWizardView = require('./PaymentWizard.View');
import PaymentWizardConfiguration = require('./PaymentWizard.Configuration');

// @class PaymentWizard @extends ApplicationModule
const PaymentWizard: any = {
    mountToApp: function(application) {
        const paymentRouter = new PaymentWizardRouter(application, {
            profile: ProfileModel.getInstance(),
            model: LivePaymentModel.getInstance(),
            steps: PaymentWizardConfiguration
        });

        PaymentWizardView.wizard = paymentRouter;

        return paymentRouter;
    }
};

export = PaymentWizard;
