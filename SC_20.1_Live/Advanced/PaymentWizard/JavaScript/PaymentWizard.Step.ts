/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PaymentWizard.Step"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as payment_wizard_step_tpl from 'payment_wizard_step.tpl';

import WizardStep = require('../../Wizard/JavaScript/Wizard.Step');

import HeaderSimplifiedView = require('../../Header/JavaScript/Header.Simplified.View');
import FooterSimplifiedView = require('../../Footer/JavaScript/Footer.Simplified.View');

// @class PaymentWizard.Step Step View, Renders all the components of the Step @extend Wizard.Step
const PaymentWizardStep: any = WizardStep.extend({
    template: payment_wizard_step_tpl,

    // @property {Function} headerView
    headerView: HeaderSimplifiedView,

    // @property {Function} headerViewOptions
    headerViewOptions: function() {
        return {
            headerLinkHref: '/',
            headerLinkTouchPoint: 'customercenter',
            headerLinkHashtag: '#balance',
            headerLinkTitle: Utils.translate('Account Balance')
        };
    },

    // @property {Function} footerView
    footerView: FooterSimplifiedView,

    render: function() {
        const layout = this.wizard.application.getLayout();

        WizardStep.prototype.render.apply(this, arguments);

        // Also trigger the afterRender event so the site search module can load the typeahead.
        layout.trigger('afterRender');
    },

    // @method getContext @return {PaymentWizard.Step.Context}
    getContext: function() {
        // @class PaymentWizard.Step.Context
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
            // @property {Boolean} showBreadcrumb
            showBreadcrumb: !this.hideBreadcrumb
        };
    }
});

export = PaymentWizardStep;
