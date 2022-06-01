/**
 * The Layout component class lets you manage views in the application, as well as the content of those views. Use this component to add or remove child views, bind DOM event handlers, and set context data in the view. Other components, such as {@link Cart} and {@link PDP}, let you manage specific parts of the application. Use the Layout component when you need to work with visual aspects of the application that are not covered by one of the specific components. For example, you can use Layout to modify the header or footer areas on a page. 
 * 
 * Working with the Layout component also typically requires working with properties and methods of the {@link View} class. You will also need to reference data attributes in the templates (usually the HTML data attributes called 'data-view' and 'data-cms-area'). For example, inserting a child view requires you to specify the value of the 'data-view' attribute of the HTML element in which you want to add the child view.
 * 
 * Get an instance of this component by calling `container.getComponent('Layout')`;
 * 
 * Note: Other visual components in the API, such as {@link Cart} and {@link PDP} extend Layout and its methods, except for the 'showContent' method, which is only avilable in Layout.
 * 
 * @class
 * @extends VisualComponent
 * @hideconstructor
 * @global
 */
class Layout extends VisualComponent {
	
	constructor() {
		super()
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
	addChildView(data_view, view_constructor) {
		return null;
	}

	/**
	 * Adds one or more child views to a view that already exists in the DOM. Child views can be added to elements that have the `data-view` or `data-cms-area` data attribute. If there are multiple elements in a template that have a data-view (or data-cms-area) attribute value of `view_id`, the child views are added to all elements with that ID. 
	 * 
	 * As opposed to the {addChildView} method, the current content in the data attribute element is not replaced by the child views. Instead, the child view is appended after the content in the data attribute element. If you want to add just one single child view while keeping the current content, use this method instead of {addChildView}. 
	 * 
	 * You can also specify the order in which the child views are rendered in the view by setting the `childViewIndex` property of the child view object. This index is 10-based. Set a value less than 10 to prepend the child view to the current content; set a value greater than 10 to append the child view to the current content. If adding multiple child views, set a different index in each child view object.  
	 *
	 * The addChildViews method is flexible, but more complex than `addChildView`. Use the simpler {@link Layout#addChildView|addChildView} where possible. 
	 *
	 * In the following example, `addChildViews` is used to add two child views to the `checkout.WIZARD_VIEW` main view. The child views will be added to the placeholder element that has a data-view attribute with the value `Wizard.StepNavigation`. `Wizard.StepNavigation` has an object as its value, which holds the child views to be added to the placeholder. Each child view is specified as a separate property/value pair, with the property as the view name and the value as an object that returns the child view. Within the object that returns the child view, you set the index of the child view and a child view construtor function.
	 * 
	 * ```javascript
	 * 			checkout.addChildViews(
	 *   checkout.WIZARD_VIEW,
	 *   {
	 *     'Wizard.StepNavigation': 
	 *     {
	 *       'FirstCheckoutView': 
	 *       {
	 *         childViewIndex: 1, 
	 *         childViewConstructor: function () 
	 *         {
	 *           return new FirstCheckoutExtensionView({checkout:checkout});
	 *         }
	 *       },
	 *       'SecondCheckoutView': 
	 *       {
	 *         childViewIndex: 2,
	 *         childViewConstructor: function() 
	 *         {
	 *           return new SecondCheckoutExtensionView({checkout:checkout})
	 *         }
	 *       }
	 *     }
	 *   }
	 * );
	 * ```
	 * 
	 * @param {String} view_id The identifier (ID) of the main view to which the child views will be added. 
	 * @param {Object} child_views An object containing a set of nested properties and objects that determine the placeholder to which the child views will be added, as well as the child views themselves.
	 * @return {void} Returns null if the operation is successful. Otherwise, it throws an exception.
	 * @throws {Error}
	 */
	addChildViews(view_id, child_views) {
		return null;
	}

	/**
	 * Adds a property to the context data of a view. The property can then be referenced in templates. If the property already exists in the context data of the view, it is updated. For example, if a view has a property called 'thumbnail' and you pass 'thumbnail' in the `property_name` argument, then the return value of the callback function overwrites the current value of 'thumbnail'.
	 * 
	 * ```javascript
	 * 			var layout = container.getComponent('Layout');
	 * 
	 * layout.addToViewContextDefinition('Header.View', '48HourShippingMessage', 'string', function(context) {
	 *   return 'Hello' + context.profileModel.firstname + '. Free 2 day shipping on orders over 40 USD.';
	 * });
	 * ```
	 * In the above example, the first and second arguments indicate the view, 'Header.View', to which the property, '48HourShippingMessage', will be added. The function returns a message as a string, with the first name of the logged in user and the message text. To display the message in the view, add the property to the template with the expression `{{48HourShippingMessage}}`.  
	 * 
	 * ```html
	 * 			<nav class="header-main-nav">
	 * 	<div>{{48HourShippingMessage}}</div>
	 * 	<div id="banner-header-top" data-cms-area="header-top"></div>
	 * </nav>
	 * ```
	 * 
	 * @param {string} view_id The identifier of the view to which the property will be added. This ID is usually defined in the view's AMD module.
	 * @param {string} property_name The name of the property.
	 * @param {string} type The type of the property. The value returned by the callback function must be of the same type. `type` can be one of the following:
	 * * array
	 * * boolean
	 * * null
	 * * number
	 * * object
	 * * string
	 * @param {Function} callback A function that sets the value of the property. The return value sets the value of the specified property and must be of the same type as specified by `type`. You can pass the current context as an argument to the function.
	 * @return {void} Returns null if the operation is successful. Otherwise, it throws an exception.
	 * @throws {Error}
	 * 
	 */
	addToViewContextDefinition(view_id, property_name, type, callback) {
		return null;
	}

	/** 
	 * Attaches an event handler to an event that occurs on a specific element in the DOM. The DOM element must have a 'data-action' attribute. The value of the data-action attribute is used in the `event_selector` argument to specify on which element the event must occur.
	 * 
	 * It is not possible to attach an event handler to a DOM element if another SuiteCommerce event is already attached to the element.     
	 * 
	 * ```javascript
	 * 			layout = container.getComponent('Layout');
	 * 
	 * layout.addToViewEventsDefintion(
	 *   'Header.View', 
	 *   'click [data-action="sidebar-toggle-icon-clickable"]', 
	 *   function(event) {
	 *     console.log(event);  
	 *   }
	 * );
	 * ```
	 * 
	 * ```html
	 * 			<div class="header=sidebar-toggle-wrapper">
	 * 	<button class="" data-action="header-sidebar-show">
	 * 		<i class="header-sidebar-toggle-icon" data-action="sidebar-toggle-icon-clickable"></i>  
	 * 	</button>
	 * </div>
	 * ```
	 * 
	 * The following events are supported:
	 * * blur
	 * * change
	 * * click
	 * * contextmenu
	 * * change
	 * * dblclick
	 * * error
	 * * focus
	 * * focusin
	 * * focusout
	 * * keydown
	 * * keppress
	 * * keyup
	 * * load
	 * * mousedown
	 * * mousemove
	 * * moustout
	 * * mouseover
	 * * mouseup
	 * * resize
	 * * scroll
	 * * select
	 * * submit
	 * * touchend
	 * * touchmove
	 * * touchstart
	 * * unload
	 * @param {string} view_id The identifier of the view to which the event handler will be added. This ID is usually defined in the view's AMD module.
	 * @param {string} event_selector A string that denotes the event and DOM selector that will trigger the event handler as specified by `callback`. `event_selector` must be specified in the following format: `<event type> [data action="a-custom-data-action">]`. 
	 * * `<event type>` is one of the supported events.
	 * * `<a-custom-data-action>` is the value of the 'data-action' attribute on a DOM element.
	 * @param {Function} callback A function that is called when the specified event occurs.
	 * @return {void} Returns null if the operation is successful. Otherwise, it throws an exception.
	 * @throws {Error}
	 */
	addToViewEventsDefinition(view_id, event_selector, callback) {
		return null;
	}

	/**
	 * Registers a child view that can be used in any template within the scope of the component in which `registerView` is called. `registerView` is available in this component (Layout) as well as other components that manage views, including {@link Cart}, {@link Checkout}, {@link PDP}, and {@link PLP}.
	 * 
	 * When you use `registerView` in Layout itself, it registers a child view that can be used globally in any template. For example, if you register a view called `ProductLimitedStock` in Layout, you can use that view in a template of the PDP component, as well as in the templates of other components such as the Cart component or the PLP component.  
	 * 
	 * ```javascript
	 * 			var layout = container.getComponent('Layout');
	 * 
	 * if (layout) {
	 * 	layout.registerView('ProductLimitedStock', function() {
	 * 		return new ProductLimitedStockView({});
	 * 	});
	 * }
	 * ```
	 * 
	 * After a view has been registered, you can include the view anywhere in a template file by adding a HTML element with its `data-view` attribute set to the value of `data_view`. You can also include the view in any of the predefined Site Management Tools (SMT) areas on a page by setting the value of a `data-cms-area` data attribute to `data_view`.
	 * 
	 * ```html
	 * 			<div class="product-container">
	 * 	<div class="product-name"></div>
	 * 	<div data-view="ProductLimitedStock"></div>
	 * 	<div class="product-details"></div>
	 * </div>
	 * ```
	 * 
	 * @since SuiteCommerce 2018.2
	 * @param {string} data_view The name of the data-view attribute in which the view will be displayed. 
	 * @param {Function} view_constructor An instance of a view. Use a constructor function to return an instance.
	 */
	registerView(data_view, view_constructor) {
		return null;
	}

	/**
	 * Removes a child view from a view. This method can remove child views that were added with the {@link Layout#addChildView|addChildView} or {@link Layout#addChildViews|addChildViews} methods, as well as other child views in the parent view.
	 * 
 	 * This method accepts up to three arguments. If only one argument is passed, the argument is determined to be `placeholder_selector`. In this case, `view_id` is set to the default view of the current component. In Layout, the main view is `layout.ALL_VIEWS`.
	 * 
	 * ```javascript
	 * 			var layout = container.getComponent('Layout');
	 * 
	 * layout.addChildView('FlashMessage.View', function() {
	 *   return new FlashMessageContentView({});
	 * });
	 * console.log('Child view added.');
	 * 
	 * layout.removeChildView('FlashMessageContentView');
	 * console.log('Child view removed.');
	 * ``` 
	 * 
	 * @param {string} view_id The identifier of the main view from which the child view will be removed. Most components have only one main view. 
	 * @param {string} placeholder_selector The identifier of the view to be removed (specified as a value of a `data-view` or `data-cms-area` attribute).
	 * @param {string} [view_name] The internal identifier of the view to be removed. To get the internal identifier of a view, put the return value of `addChildView` in a variable, and then pass that variable as `[view_name]`.
	 * @return {void} Returns null if the operation is successful. Otherwise, it throws an exception.
	 * @throws {Error}
	 */
	removeChildView(view_id, placeholder_selector, view_name) {
		return null;
	}

	/**
	 * Removes a property from the context data of a view. 
	 * 
	 * You can only remove properties that were added to the same extension with `addToViewContextDefinition`. Properties already exposed in the template or properties added by another extension cannot be removed with this method.
	 * 
	 * In the following example, the property called `WelcomeMessage` is first added to the context data of the `Header.View` view and then removed from the view. To compare the context data, we can output `context` to the console before and after the `addToViewContextDefinition`.  
	 * ```javascript
	 * 			var layout = container.getComponent('Layout');
	 * 
	 * if (layout) {
	 *   layout.addToViewContextDefinition('Header.View', 'WelcomeMessage', 'string', function(context) {
	 *     console.log(context);
	 *     return 'Hello ' + context.profileModel.firstname;
	 *   })
	 *   console.log(context);
	 * }
	 * 
	 * layout.removeToViewContextDefinition('Header.View', 'WelcomeMessage');
	 * ```
	 * 
	 * @param {string} view_id The identifier of the view of the current component from which the context property will be removed.
	 * @param {string} property_name The name of the property to be removed.
	 * @return {void} Returns null if the operation is successful. Otherwise, it throws an exception.
	 * @throws {Error}
	 */
	removeToViewContextDefinition(view_id, property_name) {
		return null;
	}

	/**
	 * Detaches an event handler from an event in a view.
	 * 
	 * You can only remove event handlers that were added to the same extension with `addToViewEventsDefinition`. You cannot use this method to remove built-in event handlers.
	 * 
	 * ```javascript
	 * 			var layout = container.getComponent('Layout');
	 * 
	 * layout.addToEventsDefintion(
	 *   'Header.View', 
	 *   'click [data-action="sidebar-toggle-icon-clickable"]',
	 *   function(event) {
	 *     console.log(event);  
	 *   }
	 * );
	 * 
	 * layout.removeToViewEventsDefinition('Header.View', 'click [data-action="sidebar-toggle-icon-clickable"]');
	 * ```
	 * 
	 * @param {string} view_id The identifier of the view of the current component from which the event handler will be removed. This is the same view_id specified in `addToViewEventsDefinition`.
	 * @param {string} event_selector An event that was previously added with `addToViewEventsDefinition`.
	 * @return {void} Returns null if the operation is successful. Otherwise, it throws an exception.
	 * @throws {Error}
	 */
	removeToViewEventsDefinition(view_id, event_selector) {
		return null;
	}

	/**
	 * Repositions a child view inside a placeholder by changing the index value of the child view. The index is a 10-based index. Set `index` to less than 10 to position the child view before the current child view; set `index` to greater than 10 to position the child view after the current child view. If you set `index` to 10, the child view is displayed. Other child views with an `index` value of 10 are also displayed. However, because there is more than one child view with the same index value, the order in which the child views are displayed is undetermined.
	 * 
	 * This method can accept three or four arguments. If three arguments are passed, the value of `view_id` is set to the default view of the component.  
	 * 
	 * ```javascript
	 * 			var layout = container.getComponent('Layout');
	 * 
	 * layout.addChildView('Header.View', function() {
	 *   return new HeaderBannerView({})
	 * });
	 * layout.setChildViewIndex('Header.View', 'HeaderBannerView', 'HeaderBannerView', 15);
	 * ```
	 * 
	 * 
	 * @param {string} [view_id] The identifier of the view that contains the child view. This is usually the main view in the current component. 
	 * @param {string} placeholder_selector The identifier of the placeholder element in the view's template (specified as a value of a `data-view` or `data-cms-area` attribute).
	 * @param {string} view_name The identifier of the child view in the placeholder. 
	 * @param {number} index The new position of the child view.   
	 * @return {void} Returns null if the operation is successful. Otherwise, it throws an exception. 
	 * @throws {Error}
	 */
	setChildViewIndex(view_id, placeholder_selector, view_name, index) {
		return null;
	}	

	/**
	 * Shows content in a view (by replacing the current main view) or in a modal. This method takes two arguments: `view` is the view to display, and `options` is an object with the following properties:
	 * 
	 * * `showInModal` - Determines whether the content is shown in a modal or whether it replaces the main view of the component. Set to false (default) to replace the main view of the current component with the content of `view`. Set to true to show the content in a modal. `showInModal` is set to false by default.
	 * * `dontScroll` - Indicates whether content that overflows its container element is srollable or unscrollable. Set to false to make content scrollable. Set to true to make content unscrollable. `dontScroll` is set to false by default.
	 * * `options` - An object with a single property `className` to indicate the Sass class name that will be applied to the modal. The class name is applied to the modal itself, not the modal content.
	 * 
	 * Both arguments are required. If you do not want to set any of the properties, pass the second argument `options` as an empty object.
	 * 
	 *  _MyModalMessage.View.js_
	 * ```javascript 
	 * 
	 * ```
	 * 
	 * ```javascript
	 * 		var layout = container.getComponent('Layout');
	 * 
	 * if (layout) {
	 *   var modalViewMessage = new MyModalMessageView ({
	 *     message: 'Register today and get 10% off your next order.', type: 'info', closable: false 
	 *   });
	 * 
	 *   var modalViewMessageShown = false;
	 *   layout.on('afterShowContent', function() {
	 *     if (!modalViewMessageShown) {
	 *       layout.showContent(modalViewMessage, {showInModal: true, options: {classname; 'site-modal'}});
	 *     }     
	 *   });
	 * }
	 * ```
	 * In the above example, `showContent` is used to show a modal after the layout has rendered (after the `afterShowContent` event has fired). The `modalViewMessage` view is shown in the modal and the modal is given the class name `site-modal`.
	 * 
	 * ```javascript
	 * 		var layout = container.getComponent('layout');
	 * 
	 * if (layout) {
	 *   var viewShown = false;
	 *   layout.on('afterShowContent', function() {
	 *     if (!viewShown) {
	 *       layout.showContent(new newView(), {});
	 *       viewShown = true;
	 *     }
	 *   });
	 * }
	 * ```
	 * In the above example, `showContent` is used to replace the main view with another view `newView`. Because showContent is replacing a view, properties do not need to be specified in the options argument, but the options argument must still be passed as an empty object.
	 *  
	 * @since SuiteCommerce 2018.2
	 * @param {SCView} view An instance of a view that renders the content to be displayed.
	 * @param {object} options Options that determine how the content is displayed, including whether it is displayed as a modal or whether it replaces the content of the main view. 
	 */
	showContent(view, options) {
		return null;
	}
}

/*
 * @typedef {Function} SimpleChildViewConstructor
 * @param {...any} any
 * @return {View}
 */