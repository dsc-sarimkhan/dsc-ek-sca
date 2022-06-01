/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="RequestQuoteWizard.Step"/>

import '../../SCA/JavaScript/SC.Configuration';
import * as requestquote_wizard_step_tpl from 'requestquote_wizard_step.tpl';

import WizardStep = require('../../Wizard/JavaScript/Wizard.Step');

// @class RequestQuoteWizard.Step Step View, Renders all the components of the Step @extend Wizard.Step
export = WizardStep.extend({
    // @property {Function} template
    template: requestquote_wizard_step_tpl,

    // @method render
    render: function() {
        const layout = this.wizard.application.getLayout();

        WizardStep.prototype.render.apply(this, arguments);

        // Also trigger the afterRender event so the site search module can load the typeahead.
        layout.trigger('afterRender');
    },

    // @method getContext
    // @return {RequestQuoteWizard.Step.Context}
    getContext: function() {
        // @class RequestQuoteWizard.Step.Context
        return {
            // @property {String} currentStepGroupName
            currentStepGroupName: this.wizard.steps[this.wizard.currentStep].options.stepGroup.name,
            // @property {String} continueButtonLabel
            continueButtonLabel: this.continueButtonLabel,
            // @property {Boolean} showNavButtons
            showNavButtons: !!(!this.hideBackButton || !this.hideContinueButton),
            // @property {Boolean} showBackButton
            showBackButton: !this.hideBackButton || !this.wizard.isCurrentStepFirst(),
            // @property {Boolean} showContinueButton
            showContinueButton: !this.hideContinueButton,
            // @property {Boolean} showBottomMessage
            showBottomMessage: !!this.bottomMessage,
            // @property {String} bottomMessage
            bottomMessage: this.bottomMessage
        };
        // @class RequestQuoteWizard.Step
    }
});
