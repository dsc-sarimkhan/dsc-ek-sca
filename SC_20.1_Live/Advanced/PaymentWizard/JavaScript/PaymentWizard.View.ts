/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PaymentWizard.View"/>

import * as _ from 'underscore';
import '../../../Commons/Utilities/JavaScript/Utils';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as payment_wizard_layout_tpl from 'payment_wizard_layout.tpl';

import WizardView = require('../../Wizard/JavaScript/Wizard.View');
import WizardStepNavigationView = require('../../Wizard/JavaScript/Wizard.StepNavigation.View');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

// @class PaymentWizard.View @extend Wizard.View
const PaymentWizardView: any = WizardView.extend({
    // @property {Function} template
    template: payment_wizard_layout_tpl,
    // @property {String} bodyClass
    bodyClass: 'force-hide-side-nav',

    attributes: {
        id: 'payment-wizard',
        'data-root-component-id': 'Wizard.View'
    },

    // @method initialize
    initialize: function() {
        this.wizard = this.constructor.wizard;

        WizardView.prototype.initialize.apply(this, arguments);
        this.title = Utils.translate('Make a Payment');
    },

    beforeShowContent: function beforeShowContent() {
        return this.wizard.runStep();    
    },

    getPageDescription: function() {
        return 'payment - ' + (Backbone.history.fragment || '').split('?')[0];
    },

    childViews: {
        'Wizard.StepNavigation': function() {
            return new WizardStepNavigationView({ wizard: this.wizard });
        }
    }
});

export = PaymentWizardView;
