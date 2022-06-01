/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PaymentWizard.Router"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import WizardRouter = require('../../Wizard/JavaScript/Wizard.Router');
import PaymentWizardView = require('./PaymentWizard.View');
import PaymentWizardStep = require('./PaymentWizard.Step');

// @class PaymentWizard.Router @extend Backbone.Router
const PaymentWizardRouter: any = WizardRouter.extend({
    view: PaymentWizardView,

    step: PaymentWizardStep,

    _registerPageType: function _registerPageType(options) {
        const pageType = this.application.getComponent('PageType');

        pageType.registerPageType({
            name: 'payment-wizard',
            routes: options.routes,
            view: PaymentWizardView,
            defaultTemplate: {
                name: 'payment_wizard_layout.tpl',
                displayName: 'Payment wizard default',
                thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                    'img/default-layout-payment-wizard.png'
                )
            }
        });
    },

    // @method runStep
    runStep: function() {
        if (SC.ENVIRONMENT.permissions.transactions.tranCustPymt < 2) {
            this.application.getLayout().forbiddenError();

            return jQuery.Deferred().reject();
        }
        return WizardRouter.prototype.runStep.apply(this, arguments);
    },
    // @method hidePayment
    hidePayment: function() {
        return (
            (!this.model.get('payment') && !this.model.get('confirmation')) ||
            (this.model.get('confirmation') && !this.model.get('confirmation').payment)
        );
    }
});

export = PaymentWizardRouter;
