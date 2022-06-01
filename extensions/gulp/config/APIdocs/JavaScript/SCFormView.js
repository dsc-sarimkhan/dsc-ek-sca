/**
 * SCFormView is an abstract class that provides functions to validate form data, save form data, and display error messages related to form input.
 * 
 * To use SCFormView, you must create a child class by extending it. In the child class object, call the parent class constructor with `call()` or `apply()`. SCFormView expects a model instance to be passed to it. When the form is saved, the model associated with the form is updated accordingly, provided it passes all validations. 
 * 
 * The model passed to SCFormView must be an instance of {@link SCModel}. SCModel is responsible for the validation of model data (for example, all required fields have values, or a phone number field contains a phone number). You can use the {@link SCFormView#getFormFieldValue|getFormValues()} method of SCFormView, however, to perform type checking of field data - before the data is handed off to and validated by the model. 
 * 
 * Note that whenever the value of a form field changes (usually triggered by a blur event), SCFormView sets the corresponding attribute on the model, at which time the model validates the data. 
 * 
 * The following example shows how to use SCFormView. Since SCFormView is an abstract class, we must override it with a child class. In our child class, called 'NewsletterView', one of the first things we do is to call the parent class and pass in the model instance. SCFormView has abstract methods that must also be overridden. `getEvents`, `getFormValues`, and `getFormFieldValue` are all abstract methods, and are therefore overridden.
 *  
 *  
 * _NewsletterView.View.js_
 * ```javascript
 *			define(
 *	'NewsletterView', 
 * 	['SCFormView', 'newsletter.tpl', 'Newsletter.Model', ''], 
 *  function(FormViewModule, newsletter_tpl, NewsletterModelModule) {
 *
 * 		var SCFormView = FormViewModule.SCFormView;
 * 		var NewsletterModel = NewsletterModelModule.NewsletterModel;
 *
 * 		// Constructor
 *      function NewsletterView () {
 * 			// We must pass in a model instance to the parent constructor.
 *          SCFormView.call(this, new NewsletterModel());
 *          this.template = newsletter_tpl;
 *      }
 *
 *      // Copy parent instance methods.
 *      NewsletterView.prototype = Object.create(SCFormView.prototype);
 *
 *      // Restore the constructor.
 *      NewsletterView.prototype.constructor = NewsletterView;
 *      
 *      // Set all the instance methods.   
 *		NewsletterView.prototype.getEvents = function() {
 *			return {
 *				'submit form': 'saveForm',
 *				'blur [name="email"]': 'onFormFieldChange'
 *			};
 *		}
 *
 *		NewsletterView.prototype.saveForm = function(e) {
 *			e.preventDefault();
 *
 *			promise = NewsletterView.prototype.saveForm.call(this, e);
 *
 *			if (promise) {
 *				promise
 *				.fail((jqXhr) => {
 *					// Do something with the error code.	 
 *					jqXhr.preventDefault = true;
 *					const errorCode =
 *						jqXhr &&
 *						jqXhr.responseJSON &&
 *						jqXhr.responseJSON.errorCode && jqXhr.responseJSON.errorCode;					
 *					})
 *				.done(() => {
 *					// Do something when the formModel is saved successfully.
 *				})
 *				.always(() => {
 *					// Do something always.
 *				});
 *			}
 *			return promise;
 *		}
 *
 *		NewsletterView.prototype.getFormValues = function($savingForm) {
 *			formValues = $savingForm.serializeObject();
 *			if (formValues.email && typeof formValues.email === 'string') {
 *				return {
 *					email: formValues.email
 *				};
 *			}
 *			return {
 *				errorCode: 'FormValidation',
 *				errors: {
 *					email: 'Enter a valid email address.'
 *				}
 *			};
 *		}
 *
 *		NewsletterView.prototype.getFormFieldValue = function(changedInput) {
 *			newVal = changedInput.val();
 *			fieldName = changedInput.attr('name');
 *			if (fieldName === 'email' && typeof newVal === 'string') {
 *				return {
 *					name: fieldName,
 *					value: newVal
 *				};
 *			}
 *			return {
 *				name: fieldName || '',
 *				error: 'Please provide a valid email'
 *			};
 *		}
 *
 *		NewsletterView.prototype.getContext = function(){
 *			return {
 *				model: this.formModel
 *			};
 *		}
 *
 *		// Return the AMD constructor.
 *		return NewsletterView;
 * 	}
 * );
 * ``` 
 * 
 * **Note**: The SCFormView class contains a number of private properties (listed below) that you should not override or use (do not get or set the values of private properties).
 * 
 * In addition to creating the view file above with your SCFormView child class object, you must also ensure that the templates in your extension contain the appropriate placeholders to display form field error messsages. The following example shows a form with one field to enter an email address. Error messages will be displayed in elements with the data attribute `data-validation="control"`. The parent element should have the data attribute `data-validation="control-group"`.
 *  
 * 
 * _newsletterview.tpl_
 * ```html
 * 			<form class="newsletter-suscription-form" data-action="newsletter-subscribe" novalidate>
 * 	<div data-validation="control-group">
 * 		<h5 class="newsletter-subscription-form-label" for="login-email">{{translate 'Newsletter Sign Up'}}</h5>
 * 		<div class="newsletter-subscription-form-container {{#if showErrorMessage}}error{{/if}}" data-validation="control">
 * 			<input 
 * 				name="email" id="email" 
 * 				type="email" class="newsletter-suscription-form-input" 
 * 				placeholder="{{translate 'username@domain.com'}}">
 * 			<button type="submit" class="newsletter-subscription-form-button-subscribe">
 * 				{{translate 'Subscribe'}}
 * 			</button>
 * 		</div>
 * 	</div>
 * </form>
 * ```
 * 
 * 
 * @abstract
 * @since SuiteCommerce 2020.2
 */
class SCFormView {

	/**
	 * @private
	 */
	application;

	/**
	 * @private
	 */
	helpMessages;

	/**
	 * A model that extends from {@link SCModel}.
	 * 
	 * @protected
	 * @type {T} 
	 */
	formModel;

	/**
	 * 
	 * @type {string}
	 * @private
	 */
	selectors;

	/**
	 * @param {T} formModel A model instance associated with the form. formModel is set as the value of the {@link SCFormView#formModel|formModel} property upon instantiation of the class. The model instance passed to the class constructor must extend from {@link SCModel}.
	 */
	constructor(formModel) {

	}

	/**
	 * Hides the reset buttons on the form and then updates the submit button to indicate the form data has been submitted, but a response has not yet been received. This method is called as part of the form submission process in the {@link SCFormView#saveForm|saveForm()} method. 
	 * 
	 * @protected
	 * @param {JQuery} form A JQuery object that references the form.
	 */
	changeControlButtonsToProcessingMode(form) {

	}

	/**
	 * Displays a validation error message in the placeholder element beneath the form field that generated the error. It is called in onFormFieldChange() if a field contains an error. Errors may come either from the type checking performed by {@link SCFormView#getFormFieldValue|getFormFieldValue()} or from the validation performed by the model.  
	 * 
	 * The placeholder must exist in the template to display the error message. The following placeholders are used in the default template. If you change the template, make sure you include the placeholders at a suitable place in the template.
	 * 
	 * @protected
	 * @param {String} fieldname The name of the form field, as specified by the HTML `name` attribute. Uses the JQuery `attr()` method to find the form field.
	 * @param {String} error The text of the error message.
	 */
	displayValidationError(fieldname, error) {

	}

	/**
	 * Displays multiple validation error messages beneath the form fields that generated the errors. It is called in the {@link SCFormView#saveForm|saveForm()} method when an error is detected. Errors may come either from the type checking performed by {@link SCFormView#getFormValues|getFormValues()} or from the validation performed by the model.
	 * 
	 * The placeholders must exist in the template to display the error message. The following placeholders are used in the default template. If you change the template, make sure you include the placeholders at a suitable place in the template.
	 * 
	 * @protected
	 * @param {ValidationErrors} validationerrors An object with a property and a string which contains the error message.
	 */
	displayValidationErrors(validationerrors) {

	}

	/**
	 * Finds the first input field that has an error and scrolls the page to the field, which then receives focus. This method is called in `saveForm()` if validation errors exist.
	 * 
	 * @protected
	 * @param {JQuery} form A JQuery object that references the form.
	 */
	focusOnFirstValidationError(form) {

	}

	/**
	 * Use this method to perform type checking on form field data. This method is called in {@link SCFormView#onFormFieldChange|onFormFieldChange()} whenever the value in an input field changes.
	 * 
	 * Override this method to perform type checking of the data required by the model. The input type should match the type expected by the `formModel` property. If the input is of the expected type, return an object containing the field name and its value. Otherwise, return an object containing the field name and an error message.  
	 * 
	 * 
	 * ```javascript
	 * 			getFormFieldValue(input) {
	 * 	var fieldinput = input.val();
	 * 	var fieldname = input.attr('name');
	 * 	
	 * 	if (fieldname === 'firstname' && typeof fieldinput === 'string') {
	 * 		properfieldname = 'first name';
	 * 		return {name: fieldname, value: fieldinput};
	 * 	}
	 * 	if (fieldname === 'email' && typeof fieldinput === 'string') {
	 * 		properfieldname = 'email';
	 * 		return {name: fieldname, value: fieldinput};
	 * 	}
	 * 
	 * 	return {name: fieldname || '', error: Utils.translate("Enter a valid " + properfieldname + ".")}
	 * }
	 * ```
	 * 
	 * @abstract
	 * @protected
	 * @param {JQuery} input A JQuery object that refers to the input field.
	 * @returns {FormFieldValue|FormFieldError} An object with one field name and its value; or an object containing an error.
	 */
	getFormFieldValue(input) {

	}

	/**
	 * Use this method to check that each form field in the form has a value and verify that it is of the right type. This method is similar to `getFormFieldValue()` except that it is used to check multiple fields. 
	 * 
	 * This method is called in the {@link SCFormView#saveForm|saveForm()} method.
	 * 
	 * @abstract
	 * @protected
	 * @param {JQuery} form A JQuery object that references the form.
	 * @returns {FormFieldsValues|FormFieldsErrors}
	 */
	getFormValues(form) {

	}

	/**
	 * Handles model validation errors for a given field, either displaying error messages on the page or removing the error messages. 
	 * 
	 * Called by the {@link SCFormView#onFormFieldChange|onFormFieldChange()} method. 
	 * 
	 * @protected
	 * @param {String} field The field name that was changed. The onFormFieldChange() method passes in this argument to `handleErrorMessage()`.
	 */
	handleErrorMessage(field) {

	}

	/**
	 * `onFormFieldChange()` is used to check the form field input type when the value of a form field is changed. If the input is of the type expected by the model, it updates the model with the field input value. Otherwise, it calls {@link SCFormView#displayValidationError|displayValidationError()} to show an error message. 
	 * 
	 * Note that This method is called for every change in an input field (usually after a {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/blur_event|blur} event on the field).  
	 * 
	 * @protected
	 * @param {Event} event A user triggered event. 
	 */
	onFormFieldChange(event) {

	}

	/**
	 * Hides the error message associated with the specified field.
	 * 
	 * Called by {@link SCFormView#handleErrorMessage|handleErrorMessage()} if no errors are returned from the model validation.
	 * 
	 * @protected
	 * @param {String} fieldname The field name, as specified by the `name` attribute of a form `<input>` element. For example, `<input type="text" name="nationality">`.
	 */
	removeErrorMessage(field) {

	}

	/**
	 * Shows the reset button and then calls the {@link SCFormView#restoreSubmitButton|restoreSubmitButton()} method to re-enable the submit button with its default text.
	 * 
	 * Called by the {@link SCFormView#saveForm|saveForm()} method after the form data has been saved successfully to the model.
	 * 
	 * @protected 
	 * @param {JQuery} form A JQuery object that references the form.
	 */
	restoreControlButtons(form) {

	}

	/**
	 * Re-enables the submit button with its default text.
	 * 
	 * Called by the {@link SCFormView#restoreControlButtons|restoreControlButtons()} method.
	 * 
	 * @protected 
	 * @param {JQuery} form A JQuery object that references the form.
	 */
	restoreSubmitButton(form) {

	}

	/**
	 * Saves the form data and updates the model. Before the model is updated, the form data is validated with {@link SCFormView#getFormValues|getFormValues()} and on the model itself. The model is updated only if validation is successful; otherwise, one or more error messages are displayed.
	 * 
	 * @protected
	 * @param {Event} event A user tiggered event.
	 */
	saveForm(event) {

	}

	/**
	 * Updates the appearance and label of all submit buttons on the form (buttons are disabled and the button text is set to "Processing..."). Called by the {@link SCFormView#changeControlButtonsToProcessingMode|changeControlButtonsToProcessingMode()} method after form data is submitted.
	 * 
	 * Override this method if you want to modify the behaviour of {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/submit|submit} buttons on a form after the form is submitted.
	 * 
	 * ```javascript
	 * function setSubmitButtonToProcessing(form) {
	 * 	form.find('[type="submit"]').each(
	 * 		function(index) {
	 * 			// Do something else related to the submit buttons...
	 * 		}
	 * 	);
	 * }
	 * ```
	 * 
	 * @protected 
	 * @param {JQuery} form A JQuery object that references the form.
	 */
	setSubmitButtonToProcessing(form) {

	}

}

// DATA TYPE DEFINITIONS
// ---------------------

/**
 * 
 * @typedef {Object} ValidationErrors
 * 
 */

/**
 * Returned by {@link SCFormView#getFormFieldValue|getFormFieldValue()} if type checking performed on the field was successful.
 * 
 * @typedef {Object} FormFieldValue
 * @property {String} name The name of the field. `name` should be the same as the attribute name in {@link SCFormView#formModel|formModel}. 
 * @property {T} value The value for the associated form model attribute name. Make sure the data type is the one expected by the form model attribute. For example, if the value of a model's attribute is a number, you need to make sure that the value passed is also a number.
 */

/**
 * Returned by {@link SCFormView#getFormFieldValue|getFormFieldValue()} if type checking performed on the field failed.
 * 
 * @typedef {Object} FormFieldError
 * @property {String} name The name of the field. `name` should be the same as the attribute name in {@link SCFormView#formModel|formModel}.
 * @property {String} error An error message indicating that the value entered in the field is not correct. You can return a translatable error message with the `Utils.translate()` method.
 */

/**
 * Returned by {@link SCFormView#getFormValues|getFormValues()} if no form field errors were found.
 * 
 * @typedef {Object} FormFieldsValues A list of form fields as properties of the object. The property name is a field name and the property value is the field value. For example, `email: 'jsmith@example.com`.  
 */

/**
 * Returned by {@link SCFormView#getFormValues|getFormValues()} if form field errors were found.  
 * 
 * @typedef {Object} FormFieldsErrors
 * @property {String} errorCode An error code. 
 * @property {Object} errors A list of form field errors as properties of the object. The property name is a field name and the property value is the error message. For example, `email: Utils.translate('You must enter a valid email')`.
 */

/**
 * 
 * 
 * @typedef {Object} Event
 * @property {HTMLElement} target The HTML element that triggered the event.
 */