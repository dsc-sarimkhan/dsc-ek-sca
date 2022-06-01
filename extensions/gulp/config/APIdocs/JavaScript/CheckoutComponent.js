/**
 * The Checkout component lets you manage the steps in the checkout flow. For example, you can get the current checkout step, go to the next or previous steps, and add or remove steps in the checkout flow. 
 * 
 * Get an instance of this component by calling `container.getComponent("Checkout")`.
 * 
 * @class 
 * @extends VisualComponent
 * @global
 * @hideconstructor
 */
class Checkout extends VisualComponent {
	/**
	 * Gets the current checkout step.
	 * @return {Deferred<CheckoutStep>} Returns a Deferred object. If the promise is resolved, it returns a {@link CheckoutStep}. If the promise is rejected, it returns an error. Use the .then() and .fail() methods to work with the resolved and rejected state of the object.
     *
     * Use this method only after the checkout page has rendered - you can listen for the afterShowContent event to do this. Otherwise, this method returns undefined.
     * 
     * ```javascript
     *  checkout.on("afterShowContent", function() {
     *      checkout.getCurrentStep().then(function(step))
     *  })
     * ```
	 */
    getCurrentStep() {
        return null
    }

    /**
	 * Sets the current checkout step.
     * @param {CheckoutStep} step
	 * @return {Deferred<CheckoutStep>} Returns a Deferred object. If the promise is resolved, it indicates the operation was successful. If the promise is rejected, it returns an error.
	 */
    setCurrentStep(step) {
        return nulle
    }

    /**
     * Gets the step groups in the checkout flow.
     * @return {Deferred<Array<CheckoutStepGroup>>} Returns a Deferred object. If the promise is then resolved, it returns an array of {@link CheckoutStepGroup}. If the promise is rejected, it returns an error.
     */
    getStepGroupsInfo() {
        return null
    }

    /**
     *  Gets the steps in the checkout flow.
     * @return {Deferred<Array<CheckoutStep>>} Returns a Deferred object. If the promise is then resolved, it returns an array of {@link CheckoutStep}. If the promise is rejected, it returns an error.
     */
    getStepsInfo() {
        return null
    }

    /**
     * Gets the name of the current checkout flow, as specified on the SuiteCommerce Configuration page in NetSuite.
     * @return {String}
     */
    getCheckoutFlow() {
        return null
    }

    /**
     * Adds a module to a step. You must extend class {@link WizardModule} to add a new module.
     * 
     *  
     * ```javascript
     * checkout.addModuleToStep( {
     *     step_url: 'shipping/new_step'
     * ,	module: {
     *         id: 'new_module'
     *     ,	index: 0
     *     ,	classname: 'OrderWizard.Module.Shipmethod'
     *     ,	options: { container: '#wizard-step-content-right'}
     *     }
     * })
     * ``` 
     * 
     * @param {AddModuleData} data 
     * @return {Deferred} Returns a Deferred object. If the promise is resolved, it indicates the operation was successful. If the promise is rejected, it returns an error.
     */
    addModuleToStep(data) {
        return null
    }

    /**
     * Removes a module from a step.
     * @param {RemoveModuleData} data
     * @return {Deferred} Returns a Deferred object. If the promise is resolved, it indicates the operation was successful. If the promise is rejected, it returns an error.
     */
    removeModuleFromStep(data) {
        return null
    }

    /**
     * Adds a steps group. If a steps group with the same name already exists, `addStepsGroup()` returns an error.
     * @param {AddStepsGroupData} data 
     * @return {Deferred<CheckoutStepGroup>} Returns a Deferred object. If the promise is resolved, it returns a {@link CheckoutStepGroup}. If the promise is rejected, it returns an error.
     */
    addStepsGroup(data) {
        return null
    }

    /**
     * Removes a steps group.
     * @param {RemoveStepGroupData} data
     * @return {Deferred} Returns a Deferred object. If the promise is resolved, it indicates the operation was successful. If the promise is rejected, it returns an error.
     */
    removeStepsGroup(data) {
        return null
    }

    /**
     * Adds a step to a steps group.
     * @param {AddStepData} data
     * @return {Deferred<CheckoutStep>} Returns a Deferred object. If the promise is then resolved, it returns a {@link CheckoutStep}. If the promise is rejected, it returns an error.
     * 
     * ```javascript
     * 
     * ```
     */
    addStep(data) {
        return null
    }

    /**
     * Removes a step from a steps group.
     * @param {String} step_url
     * @return {Deferred} Returns a Deferred object. If the promise is resolved, it indicates the operation was successful. If the promise is rejected, it returns an error.
     */
    removeStep(step_url) {
        return null
    }
}


/**
 * @event Checkout#beforeAddModuleToStep
 */

/**
 * @event Checkout#afterAddModuleToStep
 */

/**
 * @event Checkout#beforeSetCurrentStep
 */

/**
 * @event Checkout#afterSetCurrentStep
 */

/**
 * @event Checkout#beforeAddStep
 */

/**
 * @event Checkout#afterAddStep
 */

/**

 * @event Checkout#beforeAddStepsGroup
 */

/**

 * @event Checkout#afterAddStepsGroup
 */


/**
 * @typedef {Object} RemoveStepGroupData
 * @property {String} group_name
 */

/**
 * @typedef {Object} AddStepData Represents the step data in a checkout step. AddStepData is an object with a single property called `step`. The value of `step` is an object that contains the step data.
 * 
 * ```javascript
 * {
 *     step: {
 *         name: "Loyalty Card Number",
 *         url: "loyaltycard",
 *         isActive: function() {},
 *         group_name: "Loyalty",
 *         index: 0,
 *         showStep: canShowStep()
 *     }
 * }
 * ```
 * @property {String} name Mandatory. The name of the step. The name appears as the step title on the checkout page.
 * @property {String} url Mandatory. The URL fragment that indicates the current step.
 * @property {Function} isActive Indicates whether the step is active. Usually, you will define an empty anonymous function for this property. 
 * @property {String} group_name Mandatory. The name of the steps group to which the step should be added. 
 * @property {Number} index Mandatory. The position of the step in the list of steps in a group. `index` must be >= 0.
 * @property {Function} showStep A function that returns true or false. Use `showStep` to perform operations or validations that determine whether the step should be shown. Return `true` to show the step.
 */

/**
 * Represents a group of steps on a checkout page. AddStepsGroupData is an object with a single property called `group`. The value of `group` is an object that contains the steps group data.
 * 
 * ```javascript
 *          {
 *  group: {
 *      name: "Loyalty",
 *      url: "loyalty",
 *      index: 0
 *  }
 * }
 * ```
 * 
 * @typedef {Object} AddStepsGroupData
 * @property {String} name The name of the steps group.
 * @property {String} url 
 * @property {Number} index 
 */

/**
 * @typedef {Object} AddModuleData
 * @property {String} step_url
 * @property {ModuleData} module
 */

/**
 * @typedef {Object} ModuleData
 * @property {String} id
 * @property {Number} index
 * @property {String} classname the JavaScript class name of the new module to add
 * @property {ModuleOptions} options
 */

/**
 * @typedef {Object} ModuleOptions
 * @property {String} container where to add the new module, for example, '#wizard-step-content-right'
 */

/**
 * @typedef {Object} RemoveModuleData
 * @property {String} step_url
 * @property {String} module_id
 */

/**
 * @typedef {Object} CheckoutStepGroup
 * @property {Number} index
 * @property {String} name
 * @property {String} url
 * @property {Boolean} show_group
 * @property {String} state
 * @property {Array<CheckoutStep>} steps
 */

/**
 * @typedef {Object} CheckoutStep 
 * @property {String} url It is the step identifier
 * @property {String} name
 * @property {Boolean} show_step
 * @property {String} state
 * @property {String} step_group_name
 * @property {Array<CheckoutStepModule>} modules
 */

/**
 * @typedef {Object} CheckoutStepModule
 * @property {String} id
 * @property {Boolean} is_active
 * @property {Boolean} is_ready
 * @property {Number} index
 */

