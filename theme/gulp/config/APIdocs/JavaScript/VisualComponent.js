/**
 * Base abstract class used to manage views and other visual aspects in the application. Other components used to change visual aspects of the application, such as {@link PDP} and {@link PLP}, inherit from this component. 
 *
 * Use this component to work with child views, DOM event handlers, and child view context data.
 * 
 * @class
 * @extends BaseComponent
 * @hideconstructor
 * @global
 */
class VisualComponent extends BaseComponent {
	
	constructor() {
		super()
	}

	/**
	 * Lets you close a message on the page. To close a message, you must have the ID of the message, as returned by {@link VisualComponent#showMessage|showMessage()} when the message was first shown.
	 * 
	 * ```javascript
	 * 		var layout = container.getComponent('Layout');
	 * var message_vat_no;
	 * 
	 * if (layout) {
	 * 	
	 * 	// Check if a VAT number was entered. If not, display a message.
	 * 	if ($('#vat_no').val() == '') {
	 * 		message_vat_no = layout.showMessage({message: 'You must enter a VAT number to register as a business customer.', type: 'error'});
	 * 	}
	 * }
	 * 
	 * // Clear the VAT number error message when the VAT number field gets focus.
	 * $('#vat_no').focus(function() {
	 * 	layout.closeMessage(message_vat_no);
	 * });
	 * ```
	 * 
	 * @param {string} messageId The ID of the message to close. Get the ID of a message by assigning the return value of `showMessage()` to a variable.
	 */
	closeMessage(messageId) {
		return null;
	}

	/**
	 * Lets you modify JSON-LD data embedded in the `<head>` element of a SuiteCommerce product details page. JSON-LD data on SuiteCommerce websites adheres to the structured data schemas, as specified on {@link https://schema.org/Product}.
	 * 
	 * If your extension modifies a view or adds a child view on the product details page, you can use `modifyViewJsonLd()` to update the related JSON-LD. For example, if you add a child view that displays additional product information, you can update the JSON-LD to ensure the page and its metadata are consistent.
	 * 
	 * In general, the embedded JSON-LD data should be consistent with the content in the view. SuiteCommerce creates JSON-LD data when a view is rendered. For this reason, you need to pass in a view ID to `modifyViewJsonLd()` when modifying JSON-LD data. 
	 * 
	 * **Note**: To use this method, JSON-LD must be selected as the markup type on the SuiteCommerce Configuration page in the NetSuite account. See {@link https://system.netsuite.com/app/help/helpcenter.nl?fid=section_158032882820.html|Structured Data Markup} in the NetSuite Help Center for more information.
	 * 
	 * In the following example, we create an instance of the Layout component and use `modifyViewJsonLd()` to add a property to the JSON-LD object. We pass in 'ProductDetails.Full.View' as the view ID and a function that returns a Promise. The `_.extend` function enables you to copy an object and add new properties to it.
	 * 
	 * ```javascript
	 * 			var layout = container.getComponent('Layout');
	 * 
	 * layout.modifyViewJsonLd('ProductDetails.Full.View', function(json) {
	 * 	json = _.extend(json, {
	 * 		manufacturer: 'NetSuite Industrial'	
	 * 	});
	 * 	return jQuery.Deferred().resolve(json);
	 * });
	 * 
	 * ```
	 * 
	 * @param {string} view_id The identifier of the view that will update the JSON-LD data. For example, if you use the Layout component to modify the _ProductDetails.Full.View_ view in the base theme template, pass in "ProductDetails.Full.View" as the `view_id`. 
	 * @param {Function} callback A function that modifies the JSON-LD data. It must return a Promise that resolves with an object.
	 * @returns {void} Returns `null` if the operation is successful. Otherwise, it returns an Error. For example, an error is returned if JSON-LD is not selected as the structured markup type on the Configuration page.  
	 * @throws {Error} 
	 * @since SuiteCommerce 2020.1
	 */
	modifyViewJsonLd(view_id, callback) {
		return null;
	}

	/**
	 * Changes the position of a child view inside a container.
	 * @param {string} view_id The identifier of the view of the current component that contains the child view whose position will be changed.
	 * @param {string} placeholder_selector The identifier of a location in the specified view (view_id) where the child view will be added.
	 * @param {string} view_name The identifier of a view in the placeholder. 
	 * @param {number} index The index of the child view's position. 
	 * @return {void} Returns null if the operation is successful. Otherwise, it throws an exception. 
	 * @throws {Error}
	 */
	setChildViewIndex() {
		return null;
	}

	/**
	 * Shows a message in the notifications area of a SuiteCommerce page. The message is displayed by default in the Notifications placeholder (a DIV element in the base theme template with the custom data attribute `data-view="Notifications"`). You can also choose to display the message in any other placeholder that uses either of the following custom data attributes: `data-view` or `data-cms-area`.
	 * 
	 * Messages can be closed by the user, by setting a timeout in the method, or with the {@link VisualComponent#closeMessage|closeMessage()} method. If you want to use `closeMessage()`, first assign the return value of `showMessage()` to a variable, and then pass the variable to `closeMessage()`.
	 * 
	 * In the following example, the message is shown and then closed after 5 seconds by setting a timeout.
	 * ```javascript
	 * 		var layout = container.getComponent('Layout');
	 * 
	 * if (layout) {
	 * 	var message_shown = false;
	 * 	layout.on('afterShowContent', function() {
	 * 		
	 * 		if (message_shown != false) {
	 * 			layout.showMessage({
	 * 				message: '',
	 * 				type: 'info',
	 * 				selector: 'Notifications',
	 * 				timeout: 5000
	 * 			});
	 * 			message_shown = true;
	 * 		}
	 * 	});
	 * }
	 * ```
	 * 
	 * In the following example, a message is shown if an invalid VAT number is entered. When the user enters a valid number, the message is closed.
	 * ```javascript
	 * 		var layout = container.getComponent('Layout');
	 * var message_vat_no;
	 * 
	 * $('#vat_number').blur(function() {
	 * 	var vat_number = $(this).val();
	 * 
	 * 	if (message_vat_no !== undefined) {
	 * 		layout.closeMessage(message_vat_no);
	 * 	}
	 * 
	 * 	// checkVatNumber() returns false if the number entered is invalid.
	 * 	if (!checkVatNumber(vat_number)) {
	 * 		message_vat_no = layout.showMessage({
	 * 			message: 'You must enter a VAT number to register as a business customer.', 
	 * 			type: 'error'
	 * 		});
	 * 	}
	 * });
	 * ```
	 * 
	 * @since SuiteCommerce 2019.2
	 * @param {Object} data Data required to display the message. `data` is an object, which can have the following properties:
	 * * *message* - Required. The text of the message.
	 * * *type* - Required. The type of message. It also determines the appearance of the message on the page. Type can be one of the following: `info`, `warning`, `error`, or `success`.
	 * * *selector* - A placeholder on the page where you want the message to appear. 
	 * * *timeout* - Specifies the duration in milliseconds of the message on the page. If you do not specify a timeout, you can use {@link VisualComponent#closeMessage|closeMessage()} to remove the message.
	 * @returns {string} Returns the message ID as a string.
	 */
	showMessage(data) {
		return null;
	}
	
	
	/**
	 * Adds one or more child views to an existing view. The existing view must already be in the DOM and must have the 'data-view' HTML attribute.
	 *
	 * The `addChildViews` method is flexible, but more complex than `addChildView`. Use the simpler {@link VisualComponent#addChildView|addChildView()} where possible. 
	 * 
	 * ```javascript
	 * checkout.addChildViews(
	 *     checkout.WIZARD_VIEW
	 *     , {
	 *         'Wizard.StepNavigation':
	 *         {
	 *             'CheckoutView':
	 *             {
	 *                 childViewIndex: 1
	 *             ,   childViewConstructor: function ()
	 *                 {
	 *                     return new CheckoutExtensionView({checkout:checkout});
	 *                 }
	 *             }
	 *         }
	 *     }
	 * );
	 * ```
	 * @param {string} view_id The identifier of the view of the current component to which the child views will be added.
	 * @param {object} child_views 
	 * @return {void} Returns null if the operation is successful. Otherwise, it throws an exception.
	 * @throws {Error}
	 */
	addChildViews(view_id, child_views) {
		return null
	}

	/**
	 * Adds a child view to a view that already exists in the DOM. Child views can be added to elements that have the `data-view` or `data-cms-area` data attribute. If there are multiple elements in a template that have a data-view attribute value of `view_id`, the child view is added to all elements with that ID. Elements with the data-view attribute act as placeholders in the application. If there is content in the view (which is typically the case), the child view replaces the current content. 
	 * 
	 *  If you want to add multiple views at the same time, or if you want to add a child view while preserving the current content in the existing view, use {@link Layout#addChildViews|addChildViews}.
	 * 
	 * ```javascript
	 * 			layout.addChildView('Header.View', function () {
	 *   return new HolidayBannerView({});
	 * });
	 * ```
	 * In the above example, the view `HolidayBannerView` will be added as a child view of an element in any template that has a data-view attribute of `Header.View`. 
	 * 
	 * ```javascript
	 * 			layout.addChildView('cms:header_banner_top', function () {
	 *   return new HolidayBannerView({});
	 * });
	 * ```
	 * In the above example, a child view is added to a predefined SMT area called 'header_banner_top'. In the template, the header_banner_top SMT area might be in a div tag in the following way: `<div data-cms-area="header_banner_top"></div>`. Because header_banner_top is a predefined SMT area, the `cms:` prefix is used before the `view_id` argument.
	 * 
	 * @param {String} data_view The view to which the child view will be added. `data_view` is the value of the 'data-view' or 'data-cms-area' data attributes of an element on the page. For example, the header logo view uses the following data-view data attribute: `<div data-view="Header.Logo">`.
	 * @param {SimpleChildViewConstructor} view_constructor An instance of a view. Use a constructor function to get an instance of a view.
	 * @return {Void} Returns null if the operation is successful. Otherwise, it throws an exception.
	 * @throws {Error} 
	 */
	addChildView(view_id, childViewConstuctor) {
		return null
	}

	/**
	 * Removes a child view from a view.
	 * @param {string} view_id The identifier of the view of the current component from which the child view will be removed.
	 * @param {string} placeholder_selector The identifier of the location in the specified view (view_id) from which the child view will be removed.
	 * @param {string} [view_name] The identifier of the view to be removed.
	 * @return {void} Returns null if the operation is successful. Otherwise, it throws an exception.
	 * @throws {Error}
	 */
	removeChildView(view_id, placeholder_selector, view_name) {
		return null
	}

	/**
	 * Adds a property to the UI context of a view to extend interaction with its template.
	 * @param {string} view_id The identifier of the view of the current component to which the context property will be added.
	 * @param {string} property_name The name of the property.
	 * @param {string} type The type of the property. The value returned by the callback function must be of the same type.
	 * @param {Function} callback A function that sets the value of the property (property_name).
	 * @return {void} Returns null if the operation is successful. Otherwise, it throws an exception.
	 * @throws {Error}
	 */
	addToViewContextDefinition(view_id, property_name, type, callback) {
		return null
	}

	/**
	 * Removes a property from the UI context of a view.
	 * @param {string} view_id The identifier of the view of the current component from which the context property will be removed.
	 * @param {string} property_name The name of the property.
	 * @return {void} Returns null if the operation is successful. Otherwise, it throws an exception.
	 * @throws {Error}
	 */
	removeToViewContextDefinition(view_id, property_name) {
		return null
	}

	/**
	 * Adds an event handler to an event in a view.
	 * @param {string} view_id The identifier of the view of the current component to which the event handler will be added.
	 * @param {string} event_selector
	 * @param {Function} callback The event handler function to call when the specified event occurs.
	 * @return {void} Returns null if the operation is successful. Otherwise, it throws an exception.
	 * @throws {Error}
	 */
	addToViewEventsDefinition(view_id, event_selector, callback) {
		return null
	}

	/**
	 * Removes an event handler from an event in a view.
	 * @param {string} view_id The identifier of the view of the current component to which the event handler will be added.
	 * @param {string} event_selector
	 * @return {void} Returns null if the operation is successful. Otherwise, it throws an exception.
	 * @throws {Error}
	 */
	removeToViewEventsDefinition(view_id, event_selector) {
		return null
	}
}

// EVENTS
// ------

/**
 * Event triggered after content has been rendered in the main view. This event is available in components that extend VisualComponent (such as {@link PDP}, {@link PLP}, or {@link Layout}) and is triggered by the showContent() method. 
 * 
 * See the {@link https://system.netsuite.com/app/help/helpcenter.nl?fid=section_1521059818.html|Work with Events} help topic in the NetSuite Help Center for more information.
 * @event VisualComponent#afterShowContent
 */

/**
 * Event triggered before content in the main view is rendered. This event is available in components that extend VisualComponent (such as {@link PDP}, {@link PLP}, or {@link Layout}) and is triggered by the showContent() method. For example, if the URL changes in the application, the showContent() method is called, which triggers the event.
 * @event VisualComponent#beforeShowContent 
 */

// TYPE DEFINITIONS
// ----------------

/**
 * @typedef {Function} SimpleChildViewConstructor
 * @param {...any} any
 * @return {View}
 */