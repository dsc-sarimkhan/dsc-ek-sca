/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.SubmitButton"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended.d.ts" />

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as order_wizard_submitbutton_module_tpl from 'order_wizard_submitbutton_module.tpl';

import WizardModule = require('../../Wizard/JavaScript/Wizard.Module');
import Configuration = require('../../../Advanced/SCA/JavaScript/SC.Configuration');
import LiveOrderModel = require('../../../Dynasoft/LiveOrder/JavaScript/LiveOrder.Model');
export = WizardModule.extend({
    template: order_wizard_submitbutton_module_tpl,

    render: function() {
        if (
            this.wizard.currentStep === 'review' ||
            !this.options.is_below_summary ||
            (this.options.is_below_summary && Configuration.get('promocodes.allowMultiples', true))
        ) {
            this._render();
            this.trigger('ready', true);
        }
    },

    // @method getContinueButtonLabel @returns {String}
    getContinueButtonLabel: function() {
        const current_step = this.wizard.getCurrentStep();
        let label = Utils.translate('Place Order');

        if (current_step) {
            label = current_step.getContinueButtonLabel();
        }

        return label;
    },

    // @method getContext @return OrderWizard.Module.SubmitButton.Context
    getContext: function() {
        this.liveOrderModel = LiveOrderModel.getInstance();
        // @class OrderWizard.Module.SubmitButton.Context
        return {
            // @property {Boolean} showWrapper
            showWrapper: !!this.options.showWrapper,
            // @property {String} wrapperClass
            wrapperClass: this.options.wrapperClass,
            // @property {String} continueButtonLabel
            continueButtonLabel: this.getContinueButtonLabel() || '',

            showZipPayButton: (window.location.hash.indexOf("billing")!==-1) && (this.liveOrderModel.get('zippay_image')!=undefined) ? true : false,
            
            continueZipPayButtonLabel: 'Continue with ',
            imageURLZipPayButton : this.liveOrderModel.get('zippay_image'),
            
            showAfterPayButton: (window.location.hash.indexOf("billing")!==-1) && (this.liveOrderModel.get('afterpay_image')!=undefined) ? true : false,
            
            continueAfterPayButtonLabel: 'Continue with ',
            imageURLAfterPayButton : this.liveOrderModel.get('afterpay_image')
        };
    }
});
