/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CustomFields"/>

import * as _ from 'underscore';
import * as jQuery from '../../Core/JavaScript/jQuery';

import Backbone = require('../../Utilities/JavaScript/backbone.custom');
import WizardStep = require('../../../Advanced/Wizard/JavaScript/Wizard.Step');

// jshint validthis: true
const CustomFields: any = {
    mountToApp: function() {
        // update in the model the changed custom field
        function updateOption(event: any) {
            const options = _.clone(this.model.get('options'));
            const optionName = event.target.name;
            // support checkbox type of backend
            if (event.target.type === 'checkbox') {
                if (this.model.__customFieldsMetadata[optionName].type === 'checkbox') {
                    options[optionName] = event.target.checked ? 'T' : '';
                } else {
                    options[optionName] = event.target.checked ? event.target.value : '';
                }
            } else {
                options[optionName] = jQuery(event.target).val();
            }
            this.model.set('options', options);
        }

        WizardStep.prototype.afterModuleInstanceCreated.install({
            name: 'custom-fields-wizard-step-module-instance-created',
            execute: function(moduleInstance: any) {
                // Add the model of the wizard to the context of all the modules to support transaction body fields
                const originalGetContextFunction = moduleInstance.getContext;
                moduleInstance.getContext = function() {
                    const context = originalGetContextFunction.apply(moduleInstance, arguments);
                    if (!context.model) {
                        context.model = moduleInstance.model;
                    }
                    moduleInstance.events = moduleInstance.events || {};
                    _.each(context.model.get('options'), function(
                        optionValue: any,
                        optionKey: any
                    ) {
                        moduleInstance.events['change [name="' + optionKey + '"]'] = updateOption;
                    });
                    return context;
                };
            }
        });
    }
};

export = CustomFields;
