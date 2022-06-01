/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="LivePayment"/>

import LivePaymentModel = require('./LivePayment.Model');

const LivePayment: any = {
    mountToApp: function() {
        if (SC.ENVIRONMENT.LIVEPAYMENT) {
            LivePaymentModel.getInstance().set(SC.ENVIRONMENT.LIVEPAYMENT);
        }
    }
};

export = LivePayment;
