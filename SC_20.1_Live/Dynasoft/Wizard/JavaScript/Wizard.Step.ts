/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Wizard.Step"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as wizard_step_tpl from 'wizard_step.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import GlobalViewsMessageView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Message.View');
import PluginContainer = require('../../../Commons/PluginContainer/JavaScript/PluginContainer');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');

// @class Wizard.Step Step View, Renders all the components of the Step @extends {Backbone.View}
const WizardStep: any = BackboneView.extend({
    template: wizard_step_tpl,

    // @property {String} continueButtonLabel default label for the "continue" button, this is overridden in the configuration file
    continueButtonLabel: Utils.translate('Continue'),

    // @property {Boolean} hideBackButton by default the back button is shown, this is overridden in the configuration file
    hideBackButton: false,

    // @property {String} bottomMessage
    bottomMessage: null,

    // @property {String} bottomMessageClass
    bottomMessageClass: '',

    // @property {Array<Wizard.Module>} modules Will be extended with the modules to be instantiated
    modules: [],

    // @method getContinueButtonLabel @returns {String}
    getContinueButtonLabel: function() {
        const current_step = this.wizard.getCurrentStep();
        let label = this.continueButtonLabel;

        if (current_step) {
            if (this.changedContinueButtonLabel) {
                label = _.isFunction(this.changedContinueButtonLabel)
                    ? this.changedContinueButtonLabel()
                    : this.changedContinueButtonLabel;
            } else if (this.continueButtonLabel) {
                label = _.isFunction(this.continueButtonLabel)
                    ? this.continueButtonLabel()
                    : this.continueButtonLabel;
            }
        }

        return label;
    },

    afterModuleInstanceCreated: new PluginContainer(),

    // @method initialize initializes some variables and Instantiates all the modules
    initialize: function(options) {
        this.wizard = options.wizard;
        this.stepGroup = options.stepGroup;
        this.step_url = options.step_url;
        this.moduleInstances = [];

        BackboneCompositeView.add(this);

        // This is used to know when to execute the events
        this.renderPromise = jQuery.Deferred().resolve();

        const self = this;
        _.each(this.modules, function(ModuleClass) {
            self.addModule(ModuleClass);
        });
    },

    addModule: function addModule(ModuleClass) {
        const self = this;
        let module_options: any = {};

        if (_.isArray(ModuleClass)) {
            module_options = ModuleClass[1] || {};
            ModuleClass = ModuleClass[0];
        }

        if (typeof ModuleClass === 'undefined') {
            return;
        }
        if (typeof ModuleClass === 'string') {
            ModuleClass = Utils.requireModules(ModuleClass);
        }

        let { module_index } = module_options;

        const module_instance = new ModuleClass(
            _.extend(
                {
                    wizard: self.wizard,
                    step: self,
                    stepGroup: self.stepGroup
                },
                module_options
            )
        );

        // add listeners to some events available to the modules
        module_instance.on({
            ready: function(is_ready) {
                self.moduleReady(this, is_ready);
            },

            navbar_toggle: function(toggle) {
                self.moduleNavbarToggle(this, toggle);
            },

            change_enable_continue: function(enable, options) {
                const selected_options = _.extend({ onlyContinue: false }, options);
                enable
                    ? self.enableNavButtons(selected_options)
                    : self.disableNavButtons(selected_options);
            },

            change_visible_back: function(visible) {
                self.changeVisibleNavButtons({
                    backBtn: true,
                    visible: visible
                });
            },

            update_step_name: function() {
                self.$('[data-type="wizard-step-name-container"]').text(self.getName());
            },

            change_label_continue: function(label) {
                self.changeLabelContinue(label);
            },

            error: function(error) {
                self.moduleError(this, error);
            }
        });

        // attach wizard events to error handling
        _.each(module_instance.errors, function(errorId) {
            self.wizard.handledErrors.push(errorId);

            self.wizard.on(errorId, function(error) {
                module_instance.manageError(error);
            });
        });

        if (module_instance.modules) {
            _.each(module_instance.modules, function(submodule: any) {
                _.each(submodule.instance.errors, function(errorId) {
                    self.wizard.handledErrors.push(errorId);

                    self.wizard.on(errorId, function(error) {
                        submodule.instance.manageError(error);
                    });
                });
            });
        }

        self.afterModuleInstanceCreated.executeAll(module_instance);

        // ModuleClass is expected to be a View
        module_index = _.isNumber(module_index) ? module_index : self.moduleInstances.length;
        self.moduleInstances.splice(module_index, 0, module_instance);
    },

    // @method removeReadyFromModules When a step gets in the pass it is requested to set all its module instances
    // to false, so if the step get to be present again (back and forward) dot get skipped
    removeReadyFromModules: function() {
        _.each(this.moduleInstances, function(module_instance: any) {
            module_instance.isReady = false;
        });
    },

    // @method moduleReady when a module is ready triggers this
    // if all the modules in the step are ready, and the advance conditions are met, the step submits itself
    moduleReady: function(module, ready) {
        const self = this;
        // submit the step if changed the state of isReady and step is in the present.
        if (module.isReady !== ready) {
            module.isReady = ready;

            if (self.stepAdvance() && self.state === 'present') {
                this.renderPromise.done(function() {
                    self.submit();
                });
            }
        }
    },

    // @method moduleError @param {Wizard.Module} module @param {Wizard.Module.Error} error
    moduleError: function(module, error) {
        // if the error doesn't come from a module, and this step is being shown, display the error
        if (!module && this.state !== 'future') {
            this.error = error;
            if (this === this.wizard.getCurrentStep()) {
                this.showError();
            }
        }
    },

    // @method hasErrors  @return {Boolean}
    hasErrors: function() {
        return (
            this.error ||
            _.some(this.moduleInstances, function(module: any) {
                return module.error;
            })
        );
    },

    // @method  showError
    showError: function() {
        if (this.error) {
            const global_view_message = new GlobalViewsMessageView({
                message: this.wizard.processErrorMessage(this.error.errorMessage),
                type: 'error',
                closable: true
            });

            this.$('[data-type="alert-placeholder-step"]').html(
                global_view_message.render().$el.html()
            );

            jQuery('body').animate(
                {
                    scrollTop: jQuery('body .global-views-message-error:first').offset().top
                },
                600
            );

            this.error = null;
        }
    },

    // @method stepAdvance auxiliary function to determine if we have to advance to the next step.
    stepAdvance: function() {
        return this.areAllModulesReady() && this.isStepReady();
    },

    // @method areAllModulesReady  @return {Boolean}
    areAllModulesReady: function() {
        const ready_state_array = _(this.moduleInstances)
            .chain()
            .pluck('isReady')
            .uniq()
            .value();
        const url_options = Utils.parseUrlOptions(Backbone.history.location.hash);

        return (
            !url_options.force && ready_state_array.length === 1 && ready_state_array[0] === true
        );
    },

    // @method isStepReady method to be overwritten to put custom logic to determine if a step is ready to be skipped @return {Boolean}
    isStepReady: function() {
        return false;
    },

    // @method moduleNavbarToggle when a module doesn't need the navigation bar triggers this
    // if no modules in the step needs it, the step hide the navigation buttons
    // @param {Wizard.Module} module @param {Boolean} toggle
    moduleNavbarToggle: function(module, toggle) {
        const self = this;
        this.renderPromise.done(function() {
            module.navigationToggle = toggle;

            const toggle_state_array = _(self.moduleInstances)
                .chain()
                .pluck('navigationToggle')
                .uniq()
                .value();

            if (toggle_state_array.length === 1 && toggle_state_array[0] === false) {
                self.$('.step-navigation-buttons').hide();
            } else {
                self.$('.step-navigation-buttons').show();
            }
        });
    },

    // @method tellModules communicate the status of the step to it's modules (past, present, future) @param {String} what
    tellModules: function(what) {
        _.each(this.moduleInstances, function(module_instance: any) {
            _.isFunction(module_instance[what]) && module_instance[what]();
            module_instance.state = what;
        });
    },

    // @method past
    // Will be called ever time a step is going to be rendered and this step is previous in the step order
    past: function() {
        return this.validate();
    },

    // @method present
    // Will be called ever time a step is going to be rendered and this is the step
    present: jQuery.noop,

    // @method future Will be called ever time a step is going to be rendered
    // and this step is next in the step order
    future: function() {
        // cleanup future errors
        this.error = null;
        _.each(this.moduleInstances, function(module_instance: any) {
            module_instance.error = null;
        });
    },
    // @method render overrides the render function to not only render itself
    // but also call the render function of its modules
    render: function() {
        const self = this;

        this.removeReadyFromModules();

        this.renderPromise = jQuery.Deferred();

        this.currentModelState = JSON.stringify(this.wizard.model);

        // Renders itself
        this._render();
        const content_element = this.$('#wizard-step-content');

        // Empties the modules container
        content_element.empty();

        const containers = [];

        // Then Renders the all the modules and append them into the container
        _.each(this.moduleInstances, function(module_instance: any) {
            module_instance.attributes = module_instance.attributes || {};
            module_instance.attributes['data-root-component-id'] =
                self.attributes['data-root-component-id'];

            module_instance.isReady = false;
            module_instance.render();
            let content = content_element;
            const { container } = module_instance.options;

            if (container) {
                let added = false;
                if (!containers[container]) {
                    containers[container] = true;
                    added = true;
                }

                const content_temp = self.$(container);
                if (content_temp.length) {
                    if (added) {
                        content_temp.empty();
                    }
                    content = content_temp;
                }
            }
            content.append(module_instance.$el);
        });

        this.wizard.application.getLayout().once('afterAppendView', function() {
            self.renderPromise.resolve();
        });

        this.showError();
        return this;
    },

    _previousStep: function _previousStep(e) {
        // Disables the navigation Buttons
        e && this.disableNavButtons();

        // Calls the submit method of the modules and collects errors they may have
        const promises = [];
        _.each(this.moduleInstances, function(module_instance: any) {
            promises.push(module_instance.cancel());
        });

        const self = this;
        return jQuery.when.apply(jQuery, promises).then(
            // Success Callback
            jQuery.noop,
            // Error Callback
            function(error) {
                if (error) {
                    self.wizard.manageError(error, self);
                    e && self.enableNavButtons();
                }
            }
        );
    },

    // @method previousStep Goes to the previous step. Calls the cancel of each module
    // and asks the wizard to go to the previous step
    previousStep: function previousStep(e) {
        const self = this;

        return this._previousStep(e).done(function() {
            self.wizard.goToPreviousStep();
        });
    },

    // @method submitErrorHandler @param {Wizard.Module.Error} error
    submitErrorHandler: function(error) {
        this.enableNavButtons();
        
        if (error) {
            this.wizard.manageError(error, this);
        }

        _.each(this.moduleInstances, function(module_instance: any) {
            module_instance.enableInterface();
        });
    },

    _submit: function _submit(e) {
        // Disables the navigation Buttons
        e && this.disableNavButtons();

        // Calls the submit method of the modules and collects errors they may have
        const promises = [];

        _.each(this.moduleInstances, function(module_instance: any) {
            if (module_instance.isActive()) {
                promises.push(module_instance.submit(e));
                module_instance.disableInterface();
            }
        });

        const self = this;
        return jQuery.when
            .apply(jQuery, promises)
            .then(
                // Success Callback
                function() {
                    // NOTE: Here the order between then and always have changed, because when certain module wanted to disable nav buttons this always re-enable them!
                    // Validate this change!
                    return self
                        .save()
                        .always(function() {
                            self.enableNavButtons();
                        })
                        .fail(function(error) {
                            self.submitErrorHandler(error);
                        });
                }
            )
            .fail(function(error) {
                self.submitErrorHandler(error);
                return error;
            });
    },

    // @method submit Calls the submit method of each module. Calls our save function
    // and asks the wizard to go to the next step
    submit: function(e) {
        const self = this;

        return this._submit(e).done(function() {
            self.wizard.goToNextStep();
        });
    },

    // @method showStep Each time a next step is going to be rendered, it is asked if the step should be shown or not. In this way an entire step can be skipped
    // @returns {Boolean}
    showStep: function() {
        return (
            this.isActive() &&
            _.some(
                _.filter(this.moduleInstances, function(module_to_filter: any) {
                    return !module_to_filter.options.exclude_on_skip_step;
                }),
                function(module_instance: any) {
                    return module_instance.isActive();
                }
            )
        );
    },

    // @method isActive @returns {Boolean}
    isActive: function(): boolean {
        return true;
    },

    // @method changeLabelContinue Change the label of the 'continue' button.
    // @param {String} label
    changeLabelContinue: function(label) {
        const new_label =
            label ||
            (_.isFunction(this.continueButtonLabel)
                ? this.continueButtonLabel()
                : this.continueButtonLabel);

        this._executeAfterRender(function() {
            this.wizard.application
                .getLayout()
                .$('[data-action="submit-step"]')
                .html(new_label);
        }, this);

        this.changedContinueButtonLabel = new_label;
    },

    // @method _save If there is a model calls the save function of it.
    // other ways it returns a resolved promise, to return something standard
    // @returns {jQuery.Deferred}
    _save: function() {
        if (this.wizard.model && this.currentModelState !== JSON.stringify(this.wizard.model)) {
            return this.wizard.model.save().fail(function(jqXhr) {
                jqXhr.preventDefault = true;
            });
        }
        return jQuery.Deferred().resolveWith(this);
    },

    // @method save The overridable save() method. Internally calls _.save()
    // @returns {jQuery.Deferred}
    save: function() {
        return this._save();
    },

    // @method validate calls validation on all modules and call the error manager
    validate: function() {
        const promises = [];
        _.each(this.moduleInstances, function(module_instance: any) {
            if (module_instance.isActive()) {
                promises.push(module_instance.isValid());
            }
        });

        const self = this;
        return jQuery.when.apply(jQuery, promises).fail(
            // Error Callback
            function(error) {
                self.wizard.manageError(error, self);
            }
        );
    },

    // @method disableNavButtons Disables the navigation buttons
    // @param {onlyContinue:Booelan} options
    disableNavButtons: function(options) {
        this._executeAfterRender(function() {
            let selector = '[data-action="edit-module"], [data-type="edit-module"], ';
            if (!options || !options.onlyContinue) {
                selector += '[data-action="previous-step"], ';
            }

            selector += ' [data-action="submit-step"]';

            this.wizard.application
                .getLayout()
                .$(selector)
                .attr('disabled', true);
        }, this);
    },

    // @method changeVisibleNavButtons Show or hide the specified navigation button @param {continueBtn: Boolean, backBtn: Boolean, visible: Boolean} options
    changeVisibleNavButtons: function(options) {
        this._executeAfterRender(function() {
            let selector = '';

            if (options.continueBtn) {
                selector = (selector ? ', ' : '') + '[data-action="edit-module"]';
            }

            if (options.backBtn) {
                selector += (selector ? ', ' : '') + '[data-action="previous-step"]';
            }

            this.wizard.application
                .getLayout()
                .$(selector)
                .css('display', options.visible ? 'block' : 'none');
        }, this);
    },

    // @method enableNavButtons
    // @param {onlyContinue: Boolean, notDisableTouchs: Boolean, notDisableBreads: Boolean} options
    enableNavButtons: function(options) {
        this._executeAfterRender(function() {
            let selector = '[data-action="edit-module"], [data-type="edit-module"],  ';
            if (!options || !options.onlyContinue) {
                selector += '[data-action="previous-step"], ';
            }

            if (!options || !options.notDisableTouchs) {
                selector += '[data-touchpoint], ';
            }

            if (!options || !options.notDisableBreads) {
                selector += '.breadcrumb a, .wizard-step-link a, ';
            }

            selector += ' [data-action="submit-step"]';

            this.wizard.application
                .getLayout()
                .$(selector)
                .attr('disabled', false);
        }, this);
    },

    // @method _executeAfterRender @param {Function} fn @param {Any} ctx
    _executeAfterRender: function(fn, ctx) {
        if (this.renderPromise.state() !== 'resolved') {
            this.renderPromise.done(_.bind(fn, ctx));
        } else {
            _.bind(fn, ctx)();
        }
    },

    // @method getName @return {String}
    getName: function() {
        return this.name;
    },

    // @method getContext @return {Wizard.Step.Context}
    getContext: function() {
        // @class Wizard.Step.Context
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
            bottomMessage: this.bottomMessage || '',
            // @property {String} bottomMessageClass
            bottomMessageClass: this.bottomMessageClass || ''
        };
    }
});

export = WizardStep;
