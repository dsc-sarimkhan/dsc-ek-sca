/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.View"/>

import WizardView = require('../../Wizard/JavaScript/Wizard.View');
import LiveOrderModel = require('../../../Commons/LiveOrder/JavaScript/LiveOrder.Model');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');

// @class Wizard.View  Frame component, Renders the steps @extends Backbone.View
const OrderWizardView: any = WizardView.extend({
    attributes: {
        id: 'checkout',
        'data-root-component-id': 'Wizard.View'
    },

    initialize: function initialize() {
        this.model = LiveOrderModel.getInstance();
        this.profile = ProfileModel.getInstance();
        this.steps = Configuration.get('checkoutSteps');

        this.wizard = this.constructor.wizard;

        WizardView.prototype.initialize.apply(this, arguments);
    },

    beforeShowContent: function beforeShowContent() {
        if (this.wizard.indirectURL) {
            this.wizard.indirectURL = false;
            return this.wizard._runStep();
        }
        return this.wizard.runStep();
    }
});

export = OrderWizardView;
