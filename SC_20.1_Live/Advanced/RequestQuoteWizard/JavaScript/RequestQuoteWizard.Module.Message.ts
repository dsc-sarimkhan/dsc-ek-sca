/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="RequestQuoteWizard.Module.Message"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as requestquote_wizard_module_message_tpl from 'requestquote_wizard_module_message.tpl';

import WizardModule = require('../../Wizard/JavaScript/Wizard.Module');

// @class WizardModule.Module.Message @extend Wizard.Message
export = WizardModule.extend({
    // @property {Function} template
    template: requestquote_wizard_module_message_tpl,

    // @method getContext
    // @return {RequestQuoteWizard.Module.Message.Context}
    getContext: function() {
        // @class RequestQuoteWizard.Module.Message.Context
        return {
            // @property {String} pageHeader
            pageHeader: Utils.translate('Request a Quote'),
            // @property {String} message
            message: this.options.message || this.wizard.getCurrentStep().bottomMessage
        };
        // @class RequestQuoteWizard.Module.Message
    }
});
