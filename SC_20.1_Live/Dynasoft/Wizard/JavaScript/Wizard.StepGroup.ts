/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Wizard.StepGroup"/>

import * as _ from 'underscore';

export = class StepGroup {
    name: string;

    url: string;

    steps: any[];

    constructor(name: string, url: string) {
        // @property {String} name
        this.name = name;

        // Don't use this property, use getURL instead
        this.url = '/' + url;

        // @property {Array<Wizard.Step>} steps Collection of steps
        this.steps = [];
    }

    // @method hasErrors
    // @return {Boolean}
    hasErrors = function() {
        return _.some(this.steps, function(step: any) {
            return step.hasErrors();
        });
    };

    // @method getURL
    // @return {String}
    getURL = function() {
        const first_active_step = _.find(this.steps, function(step: any) {
            return step.showStep();
        });

        return first_active_step ? first_active_step.url : '';
    };

    // @method getErrors
    // @return {Array<Wizard.Error>}
    getErrors = function() {
        const errors = [];
        _.each(this.steps, function(step: any) {
            _.each(step.moduleInstances, function(module_instance: any) {
                /* if (_.isArray(module_instance.error))
                {
                    //This case happens when the module is a proxy that group all its submodule errors
                    _.each(module_instance.error, function (an_error)
                    {
                        errors.push(an_error);
                    });
                }
                else*/
                if (_.isObject(module_instance.error)) {
                    errors.push(module_instance.error);
                } else if (_.isString(module_instance.error)) {
                    errors.push({
                        errorCode: 'ERR_WS_UNHANDLED_ERROR',
                        errorMessage: module_instance.error
                    });
                }
            });
        });
        return errors;
    };

    // @method showStepGroup
    // @return {Boolean}
    showStepGroup = function() {
        return _.some(this.steps, function(step: any) {
            return step.showStep();
        });
    };
};

// @class Wizard.Error
// @property {String} errorCode
// @property {String} errorMessage
