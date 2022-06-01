/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Step"/>
import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as order_wizard_step_tpl from 'order_wizard_step.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import WizardStep = require('../../Wizard/JavaScript/Wizard.Step');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import HeaderSimplifiedView = require('../../Header/JavaScript/Header.Simplified.View');
import FooterSimplifiedView = require('../../Footer/JavaScript/Footer.Simplified.View');
import GlobalViewsMessageView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Message.View');
import Tracker = require('../../../Commons/Tracker/JavaScript/Tracker');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');

// @class OrderWizard.Step Step View, Renders all the components of the Step @extends Wizard.Step
const OrderWizardStep: any = WizardStep.extend({
    // @property {Function} headerView
    headerView: !Configuration.get('useStandardHeaderFooter') ? HeaderSimplifiedView : false,
    // @property {Function} footerView
    footerView: !Configuration.get('useStandardHeaderFooter') ? FooterSimplifiedView : false,
    // @property {Function} template
    template: order_wizard_step_tpl,
    // @method stepAdvance
    stepAdvance: function() {
        if (this.areAllModulesReady()) {
            return this.isStepReady() || this.wizard.isPaypalComplete();
        }
        return false;
    },

    // @method initialize
    initialize: function() {
        WizardStep.prototype.initialize.apply(this, arguments);
    },

    addModule: function addModule(module) {
        const self = this;
        const args = arguments;
        const order_wizard = this.wizard.orderWizardModel;
        const event_data = {
            step_group_name: self.stepGroup.name,
            step_url: self.step_url,
            module: _.isArray(module) ? module : [module, {}]
        };

        if (_.isFunction(event_data.module[0])) {
            event_data.module[1] = event_data.module[1] || {};
            event_data.module[1].module_id =
                event_data.module[0].prototype.template &&
                event_data.module[0].prototype.template.Name;
        }

        return order_wizard
            .cancelableTrigger('before:OrderWizardStep.addModule', event_data)
            .done(function() {
                WizardStep.prototype.addModule.apply(self, args);

                order_wizard.cancelableTrigger('after:OrderWizardStep.addModule', event_data);
            });
    },

    submit: function submit() {
        const self = this;
        const args = arguments;
        const order_wizard = this.wizard.orderWizardModel;
        const next_step_url = this.wizard.getNextStepUrl();

        return order_wizard
            .cancelableTrigger('before:OrderWizardStep.submit', next_step_url)
            .then(function() {
                return WizardStep.prototype.submit.apply(self, args);
            })
            .fail(function(jqXhr) {
                const error_container = jQuery('[data-type="alert-placeholder-module"]:first');
                const error_container_parent = error_container.parents('.module-rendered:last');

                if (error_container_parent.length) {
                    jQuery('html, body').animate(
                        {
                            scrollTop: jQuery(error_container_parent[0]).offset().top
                        },
                        600
                    );
                }
            });
    },

    _submit: function _submit() {
        const self = this;
        const args = arguments;

        return WizardStep.prototype._submit
            .apply(self, args)
            .then(jQuery.noop)
            .fail(function fail(error) {
                return {
                    error: error,
                    step_url: self.step_url
                };
            });
    },

    previousStep: function previousStep() {
        const self = this;
        const args = arguments;
        const order_wizard = this.wizard.orderWizardModel;
        const prev_step_url = this.wizard.getPreviousStepUrl();

        return order_wizard
            .cancelableTrigger('before:OrderWizardStep.previousStep', prev_step_url)
            .then(function() {
                return WizardStep.prototype.previousStep.apply(self, args);
            });
    },

    _previousStep: function _previousStep() {
        const self = this;
        const args = arguments;

        return WizardStep.prototype._previousStep
            .apply(self, args)
            .then(jQuery.noop, function fail(error) {
                return {
                    error: error,
                    step_url: self.step_url
                };
            });
    },

    // @method render
    render: function() {
        const layout = this.wizard.application.getLayout();

        this.profileModel = ProfileModel.getInstance();

        WizardStep.prototype.render.apply(this, arguments);

        if (
            this.wizard.isCurrentStepFirst() && // only in the first step
            this.profileModel.get('isLoggedIn') === 'F' && // only if the user doesn't already have a session
            this.wizard.application.getConfig('checkoutApp.skipLogin')
        ) {
            const message = Utils.translate(
                '<p>Checking out as a Guest. Using an account, you will enjoy a faster checkout experience.<p><a href="login" data-toggle="show-in-modal" data-id="skip-login-modal">Login</a><a class="order-wizard-step-skip-login-register" href="register" data-toggle="show-in-modal" data-id="skip-login-register-modal">Register</a>'
            );
            const global_view_message = new GlobalViewsMessageView({
                message: message,
                type: 'info',
                closable: true
            });

            this.$('[data-action="skip-login-message"]')
                .empty()
                .append(global_view_message.render().$el.html());
        }

        if (this.wizard.currentStep !== 'confirmation') {
            Tracker.getInstance().trackPageviewForCheckoutStep(
                this.wizard.getStepPosition().fromBegining + 2
            );
        }

        // Also trigger the afterRender event so the site search module can load the typeahead.
        layout.trigger('afterRender');
    },
    // @method getContext @returns OrderWizard.Step.Context
    getContext: function() {
        // @class OrderWizard.Step.Context
        return {
            // @property {Boolean} showTitle
            showTitle: !!this.getName(),
            // @property {String} title
            title: this.getName(),
            // @property {Boolean} showContinueButton
            showContinueButton: !this.hideContinueButton,
            // @property {String} continueButtonLabel
            continueButtonLabel: this.getContinueButtonLabel() || '',
            // @property {Boolean} showSecondContinueButtonOnPhone
            showSecondContinueButtonOnPhone: !!this.hideSecondContinueButtonOnPhone,
            // @property {Boolean} showBackButton
            showBackButton: !(this.hideBackButton || this.wizard.isCurrentStepFirst()),
            // @property {Boolean} showBottomMessage
            showBottomMessage: !!this.bottomMessage,
            // @property {String} bottomMessage
            bottomMessage: _.isFunction(this.bottomMessage)
                ? this.bottomMessage()
                : this.bottomMessage || '',
            // @property {String} bottomMessageClass
            bottomMessageClass: _.isFunction(this.bottomMessageClass)
                ? this.bottomMessageClass()
                : this.bottomMessageClass || ''
        };
    }
});

export = OrderWizardStep;
