/**
 * SCView is the SuiteCommerce implementation of {@link https://backbonejs.org/#View|Backbone.View}. It provides an abstract class called `SCView`. You must extend SCView by creating a child class object that inherits from it. You can then instantiate the child class object elsewhere in your extension.
 * 
 * **In extensions on SuiteCommerce 2020.2 and later, use SCView instead of Backbone.View.**
 * 
 * The following example shows how you might extend SCView to create a basic child class object called 'MyView'. As with all views in a SuiteCommerce extension, we define the view with the AMD syntax. Within the factory function of `define()`, we use a constructor function to create the child class object of SCView. Then we immediately call the parent class (SCView) with the `call()` method. 
 * 
 * After creating the constructor function, we need to use the MyView `prototype` property to inherit methods from its parent, SCView. To copy SCView's properties and methods to MyView, use `Object.create()` to create an object instance of SCView.prototype. At this stage, however, the MyView constructor points to SCView, so we need to restore MyView's constructor with `MyView.prototype.constructor = MyView`. 
 * 
 * The remainder of the example is concerned with setting context data for the template - with `getContext()` - and validating requested context data - with `validateContextDataRequest()`. In this case, when we validate the requested context data, we return `true` to take into account any data that is optional.
 * 
 *  _MyView.View.js_
 * ```javascript
 * 			define(
 * 	'MyView', 
 * 	['SCView', 'my_view.tpl'],
 * 	function('SCViewComponent', my_view_tpl) {
 * 		'use strict';
 * 
 * 		var SCView = SCViewComponent.SCView;
 * 
 * 		function MyView(options) {
 * 			SCView.call(this);
 * 
 * 			this.options = options || {};
 * 
 * 			this.template = my_view_tpl;
 * 
 * 			this.attributes = { id: 'MyViewId', class: 'my-view' };
 * 
 * 			this.contextDataRequest = ['miscData'];
 * 		}
 * 
 * 		// Inherit parent instance methods.
 * 		MyView.prototype = Object.create(SCView.prototype);
 * 
 * 		// Restore the constuctor.
 * 		MyView.prototype.constructor = MyView;
 * 
 * 		MyView.prototype.getContext = function() {
 * 			var miscData = this.contextData.miscData && this.contextData.miscData();
 * 
 * 			return {
 * 				name: this.options.name || "Name",
 * 				data: miscData ? miscData.data : 'Miscellaneous Data';
 * 			} 
 * 		}
 * 				
 * 		MyView.prototype.validateContextDataRequest = function() {
 * 			return true;
 * 		}
 * 
 * 		MyView.prototype.contextDataRequest = ['miscData'];
 * 		
 * 		// Return the AMD constructor.
 * 		return MyView;
 * 	}
 * );
 * ```
 *
 * Our example view references a single template file to display content. The object returned by `getContext()` contains two properties, `name` and `data`, which hold data for the template. Handlebars placeholders in the template display the data.
 * 
 *  _my_view.tpl_
 * ```html
 * 			<div>
 * 	<h3>{{name}}</h3>
 * 	<hr />
 * 	<h6>{{data}}</h6>
 * </div>
 * ```
 * &nbsp;
 * **Note**: The SCView class contains a number of private methods and properties (listed below) that you should not override or use (do not get or set the values of private properties). 
 * 
 * @abstract
 * @since SuiteCommerce 2020.2
 */
class SCView extends View {

	/**
	 * An internal property. Do not override or use this property. If you override this property, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	events;

	/**
	 * An internal property. Do not override or use this property. If you override this property, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	extraContextProperties;

	/**
	 * An internal property. Do not override or use this property. If you override this property, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 * @see {@link SCView#getChildViews|getChildViews()}
	 */
	childViews;

	/**
	 * An internal property. Do not override or use this property. If you override this property, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	contextData;

	constructor() {
		 
	}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	addChildViewInstances() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private 
	 */
	compileTemplate() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private 
	 */
	createChildViewInstance() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private 
	 */
	createChildViewInstances() {}

	/**
	 * Removes a view from the page, including any child views attached to it. It also stops listening for new events and removes any events already associated with the view. 
	 * 
	 * You should override this method in your child class when you want to do additional work at the time the view is destroyed. For example, if you add jQuery events in a view, you will need to stop listening for those same events when the view is destroyed. If you do override this method, make sure you call the parent class immediately in the child class. 
	 * 
	 * 
	 * ```javascript
	 * 			function DeliveryOptionsView() {
	 * 	// Add your code related to this view... 
	 * 
	 * 	function destroy() {
	 * 		View.call(this);
	 * 
	 * 		// Add your code related to the destroy method of this view...
	 * 	}
	 * }
	 * ```
	 * @protected
	 * @param {Boolean} destroy 
	 */
	destroy(destroy) {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private 
	 */
	destroyCompositeView() {}
	
	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private 
	 */
	finishRender() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	getAddToHead() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	getCanonical() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	getChildViewInstance() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	getChildViewInstances() {}

	/**
	 * Override this method to define the child views of a view. You must return an object with the child views.  
	 * 
	 * ```javascript
	 * 			// 'NewsletterFormView' is defined as a view elsewhere.
	 * 
	 * function getChildViews() {
	 * 	return {
	 * 		'NewsletterForm.View,': function() {
	 * 			return new NewsletterFormView();
	 * 		}
	 * 	};
	 * }
	 * ```
	 * 
	 * @protected
	 * @returns {ChildViews} One of more child views. 
	 */
	getChildViews() {}

	/**
	 * Lets you define an object that will be passed to the template as context. This method must return an object in the form expected by the template.
	 * 
	 * Called by the {@link SCView#render|render()} method. 
	 * 
	 * @protected
	 * @abstract
	 * @returns {Object} Object that will be passed to the template as context.
	 */
	getContext() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	getContextData() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	getContextDataRequest() {}

	/**
	 * Lets you define events on template elements and bind them to methods in a view. If you have no events to define in the view, you don't need to override this method.
	 * 
	 * Called by the {@link SCView#render|render()} method of a view.
	 *  
	 * 
	 * ```javascript
	 * 			function getEvents() {
	 * 	return {
     * 		'submit form': 'saveForm',
     *      'click [data-action="include_email"]': 'includeAnotherEmail',
     *      'keypress [data-action="text"]': 'preventEnter',
     *      'blur [name="title"]': 'onFormFieldChange',
     *      'blur [name="category"]': 'onFormFieldChange',
     *      'blur [name="message"]': 'onFormFieldChange',
     *      'blur [name="email"]': 'onFormFieldChange'
     * 	};
	 * }
	 * ```
	 * 
	 * @protected
	 * @returns {Object} The returned object can contain any number of key/value pairs, where the key is the event and a selector, and the value is the method to call. Define key/value pairs in the format `{event selector: method}`.
	 */
	getEvents() {}

	/**
	 * Use this method to return a promise that resolves with another JSON object (which contains JSON-LD).
	 * 
	 * @protected
	 * @param {Object} jsonLd An object that contains JSON-LD.
	 * @returns {Object} An object that contains JSON-LD.
	 */
	getJsonLd(jsonLd) {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 * @see setMetaDescription
	 */
	getMetaDescription() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	getMetaKeywords() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	getMetaTags() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	getPageDescription() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private 
	 */
	getPlaceholder() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	getTemplateContext() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	getTemplateName() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	getTitle() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	getViewJsonLd() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce application might not work as expected.
	 * 
	 * @private 
	 */
	isDataTypeValid() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce application might not work as expected.
	 * 
	 * @private 
	 */
	isEventSelectorValid() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private 
	 */
	normalizeChildView() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	removeChildViewInstance() {}

	/**
	 * Builds the HTML from the view template with context data obtained from {@link SCView#getContext|getContext()}. It attaches events to elements in the view and renders all child views.
	 *  
	 * @protected
	 */
	render() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	renderChild() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private 
	 */
	renderChildViewContainer() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private 
	 */
	renderChildViewInstance() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private 
	 */
	renderChildViewInstances() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private 
	 */
	renderCompositeView() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	setAddToHead() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	setChildViewIndex() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private 
	 */
	setCustomTemplate() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	setMetaDescription() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	setMetaKeywords() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	setTitle() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	setMetaTags() {}

	/**
	 * An internal method. Do not override or use this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	updateChildViewInstances() {}

	/**
	 * Lets you determine if the view should be rendered based on the context data provided. By default, `validateContextDataRequest` checks that all requested content (in `contextDataRequest`) is available and only renders the view if it is available. Return `true` to render the view; otherwise, return `false`.
	 * 
	 * 
	 * @protected
	 * @param contextdata An object with one or more `key: value` pairs. `key` is a string; `value` is a function that returns 'anything', but most often an object or an array. 
	 * @returns {Boolean} Return `true` if the context data is valid for the view; otherwise, return `false`.
	 */
	validateContextDataRequest(contextdata) {}

}


// DATA TYPE DEFINITIONS
// ---------------------

/**
 * An object that contains one or more child views. Returned by the {@link SCView#getChildViews|getChildViews()} method in {@link SCView}.
 * 
 * @typedef {Object} ChildViews
 * @property {Object<string, string>} {...} A list of one or more enumerable key/value pairs. The key is a selector in a template, identified by the value of any of the `data-view` data attributes of an element. For example, if a template contains the following element `<div data-view="Header.View">`, the key is `'Header.View'`. The value is a function that returns an instance of a view.
 */