/**
 * The Environment component class provides access to information about the SuiteCommerce environment, including information such as configuration details, site settings, and user session details. Information retrieved is read only; any changes made to the returned objects or data will not affect the original objects or data.
 * 
 * This component also lets you register trackers in the application, enabling you to listen for application events and respond to those events. 
 * 
 * Get an instance of this component by calling `container.getComponent("Environment")`.
 *
 * @class
 * @extends BaseComponent
 * @global
 * @hideconstructor
 */
class Environment extends BaseComponent {

	/**
	 * Registers a tracker in the application. A tracker enables you to listen for one or more events in the application - such as navigation, page views, and transactions - and then do something in response to those events. Trackers are especially useful if you want to integrate with third-party services that track user activity or behavior in a web store.
	 * 
	 * **Note**: If you want to track other events in the application, you can create custom events and trigger those events with {@link Environment#triggerEvent|triggerEvent()}.
	 * 
	 * In an extension, you can use any of the following predefined listener functions to listen for application events:
	 * * trackAddToCart - Called when a line is added to the cart, or the quantity of an item changes.
	 * * trackCartUpdate - Called when a line is added to the cart.
	 * * trackPageview - Called when a page is viewed.
	 * * trackProductView - Called when a product details page (PDP) is viewed.
	 * * trackTransaction - Called when a transaction is completed.
	 * 
	 * To register a tracker in the application, create an object with one (or several) of the predefined listener functions as an object method. Add whatever logic you require in the method - all the listener functions provide event data which you can utilise in your logic. Then call the `addTracker()` method to register the tracker.  
	 * 
	 * In the following example, the tracker object `myTracker` defines a `trackAddToCart` function, which will be called when an item is added to the cart. In the function, we call the `logShoppingEvent()` method of the `_exampleTrackingService` object, which belongs to a (fictitious) third party service. In the `logShoppingEvent()` method, we pass in a tracking identifier or trigger (in this case, `addToCart`), and some item information from the event data. To register the tracker in our extension, we call `addTracker()` with `myTracker` as the argument. Now, whenever a user adds an item to the cart, it is tracked in the third-party service.
	 * 
	 * ```javascript
	 * 			var environment = container.getComponent("Environment");
	 * 
	 * var myTracker = {
	 * 	trackAddToCart: function(line) {
	 * 		_exampleTrackingService.logShoppingEvent(
	 * 			'addToCart',
	 * 			{
	 * 				name: line.item.displayname,
	 * 				sku: line.item.itemid,
	 * 				amount: line.amount,
	 * 				quantity: line.quantity
	 * 			}
	 * 		);
	 * 	}
	 * }
	 * 
	 * environment.addTracker(tracker);
	 * ```
	 * 
	 * **Note**: Third-party website services and agents work have different requirements and methods of implementation. 
	 * 
	 * @since SuiteCommerce 2021.1
	 * @param {Object} Tracker
	 * @param {Function} [Tracker.trackAddToCart] A function that is called when a line is added to the cart, or the quantity of a line changes. Provides a {@link Line} object in its event data.
	 * @param {Function} [Tracker.trackCartUpdate] A function that is called when a line is added to the cart. Provides an array of {@link Line} objects in its event data corresponding to the items currently in the cart.
	 * @param {Function} [Tracker.trackPageView] A function that is called when a page in the application is viewed. Provides a {@link PageViewInfo} object in its event data.
	 * @param {Function} [Tracker.trackProductView] A function that is called when a product details page in the application is viewed. Provides a {@link ProductViewInfo} object in its event data.
	 * @param {Function} [Tracker.trackTransaction] A function that is called when a transaction is completed. Provides a {@link TransactionInfo} object in its event data.  
	 * @returns void
	 */
	addTracker(tracker) {
		return null;
	}

	/**
	 * Gets the value of the specified configuration key. Use dot notation to access child objects and properties, for example, `component.getConfig('CheckoutApp.skipLogin')`. The getConfig() method returns a copy of the original object. Any changes made to the retrieved object or key/value pair will not affect the original object.
	 * 
	 * **Note**: You should always call this method with a configuration key. If you use this method without a key, the application attempts to return the entire Configuration object. On some pages in the application, this may return a very large object, which will result in an internal error (InternalError: too much recursion) or a range error (RangeError: Maximum call stack size exceeded). 
	 * 
	 * ```javascript
	 * 			var environment_component = container.getComponent("Environment");
	 * if (environment_component) {
	 * 	var environment_cookiewarningsave = environment_component.getConfig("cookieWarningBanner.saveInCookie");
	 * 
	 * 	if (environment_cookiewarningsave === true) {
	 * 		// Do something here.
	 * 	}
	 * 	else {
	 * 		// Do something else here.
	 * 	}
	 * }
	 * ```
	 * 
	 * @param {String} key The key you want to get the value of. 
	 * @return {any} Returns the value of the key, or the entire Configuration object if `key` is empty.
	 */
	getConfig(key) {
		return null;
	}

	/**
	 * Gets current session information, including currency information, language settings, and price level.
	 * 
	 * ```javascript
	 * 		var environment_component = container.getComponent("Environment");
	 * var session = environment_component.getSession();
	 * 
	 * if (session.currency.code == "USD") {
	 * 	// Do something based on the currency code
	 * }
	 * ```
	 * 
	 * Example of the object returned by this method:
	 * ```javascript
	 * 		{	
	 *	currency: {
	 *		code: "USD",
	 *		currencyname: "USD",
	 *		internalid: "1",
	 *		isdefault: "T",
	 *		name: "USD",
	 *		symbol: "$",
	 *		symbolplacement: 1
	 *	}
	 * 	language: {
	 * 		isDefault: "T",
	 * 		languagename: "English (U.S.)",
	 * 		locale: "en_US",
	 * 		name: "English (U.S.)"
	 * 	},
	 * 	pricelevel: "5"
	 * }
	 * ```
	 * 
	 * @return {Session}
	 */
	getSession() {
		return null;
	}	

	/**
	 * Gets the value of a key in the sitesettings JSON object. See the {@link https://system.netsuite.com/app/help/helpcenter.nl?fid=section_N2532617.html|sitesettings} help topic for more information about individual site settings.
	 * 
	 * ```javascript
	 * 			var environment_component = container.getComponent("Environment");
	 * 
	 * if (environment_component) {
	 * 	var decimal_separator = environment_component.getSiteSetting("decimalseparator");
	 * 	var logout_URL = environment_component.getSiteSetting("touchpoints.logout");
	 * }
	 * ```
	 * 
	 * @param {String} [key]  The key you want to get the value of. Use dot notation to access child objects and properties. If `key` is empty, the entire sitesettings object is returned. 
	 * @return {any} Returns the value of the key, or the entire sitesettings object if `key` is empty.
	 */
	getSiteSetting(key) {
		return null;
	}

	/**
	 * Checks whether the code is currently run by the SEO Page Generator or whether it is run by the web browser. See the [SEO Page Generator](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_4053806622.html) topic in the NetSuite Help Center for more information.
	 * 
	 * @return {boolean} Returns `true` if the code is run by the SEO Page Generator; otherwise, it returns `false`.
	 */
	isPageGenerator() {
		return null;
	}

	/**
	 * Adds or updates a translation key for the specified locale. Translations are added to the `SC.Translations` dictionary. If the key exists, this method overwrites its value. To avoid overwriting existing keys, you can use prefixes for the translation keys in your extension, for example `MY.This promotion has expired`. 
	 * 
	 * See the {@link https://system.netsuite.com/app/help/helpcenter.nl?fid=section_1516657590.html|Localize Text in an Extension} help topic in the NetSuite Help Center for more information about translations in extensions.
	 * 
	 * ```javascript
	 * 		var environment_component = container.getComponent('Environment');
	 * var translations_frfr = [
	 * 	{key: 'Pre-Orders', value: 'Précommandes'},
	 * 	{key: 'View Preorders', value: 'Visualiser précommandes'},
	 * 	{key: 'Expected On', value: 'Date prévu'}
	 * ];
	 * 
	 * environment_component.setTranslation('fr_FR', translations_frfr);
	 * ```
	 * 
	 * @param {string} locale The language and region identifier of the translation. The locale is usually in the format [language]_[region], for example, `en_US` or `fr_FR`.
	 * @param {Array<TranslationEntry>} keys An array of objects containing the translation keys and their values.
	 */
	setTranslation(locale, keys) {
		return null;
	}

	/**
	 * Triggers a custom event defined in a Tracker object. Data can be appended to the custom event by passing in an object with as many property/value pairs as required.
	 * 
	 * **Note**: `triggerEvent` cannot be used to trigger any of the standard application events, for example, when an item is added to the cart or the product details page is viewed. Instead, you should use {@link Environment#addTracker|addTracker()} to work with those events. 
	 * 
	 * <p style="color: #80a9d7; margin-bottom: 3px"><strong>EXAMPLE 1</strong></p>
	 * 
	 * The following example shows basic usage of the `triggerEvent()` method. `myTracker` is an object with two listener functions. `trackAddToCart` is an application listener function that is called natively by the application when an item is added to the cart. `trackCreateReview` is a custom event listener function that we want to call when a user clicks a button to create a review. To trigger the custom event, you use `triggerEvent()`. 
	 * After the tracker object is defined, register it in the application with {@link Environment#addTracker|addTracker()}. Then you can define some data for the custom event in `myEventData` and call `triggerEvent()` to trigger the custom event.
	 * 
	 * ```javascript
	 * 			var environment = container.getComponent('Environment');
	 * 
	 * var myTracker = {
	 *	trackAddToCart: function(line) {
	 *	 	var itemName = line.name;
	 *		// Do something.
	 *		// ...
	 *	},
	 *	trackCreateReview: function() {
	 *		// Do something with custom event.
	 *		// ...
	 *	}
	 * }
	 * 
	 * environment.addTracker(myTracker);
	 * 
	 * var myEventData = {timestamp: Date.now()};
	 * 
	 * environment.triggerEvent('trackCreateReview', myEventData);
	 * ```
	 * &nbsp;
	 * 
	 * <p style="color: #80a9d7;margin-bottom: 3px;"><strong>EXAMPLE 2</strong></p>
	 * 
	 * The following example shows how you might use `triggerEvent()` to track when a user compares items on the website. This example is divided between two files: _Company.CompareProductsExtension.MainModule.js_, which corresponds to the main module file; and _MainModule.View.js_, which is a view file. 
	 * 
	 * **Note**: The examples use a fictitious third-party tracking service called `_externalService`. Usage of a third-party provider or service for tracking purposes requires separate steps to set up and implement. 
	 * 
	 * In the main module file, in the `mountToApp()` function, you instantiate the Environment component and create an object in which you declare a custom event listener function called `compareProductsDone`. Inside the function, the underscore function `_.map` is used to create an array of item names and skus. You then call the appropriate method of the external service (represented here with `_externalService`) in which you want to track the action, in this case `logCommerceEvent()`. 
	 * 
	 *  _Company.CompareProductsExtension.MainModule.js_
	 * ```javascript
	 * 			// ...
	 * mountToApp: function mountToApp(container) {
	 * 
	 * 	var environment = container.getComponent('Environment');
	 * 
	 * 	var myTracker = {
	 *		compareProductsDone: function(data) {
	 *			var products = _.map(data.items, function(item) {
	 *	 			return {
	 *	 				name: item.name,
	 *					sku: item.sku
	 *				}
	 *			});
	 *			_externalService.logCommerceEvent('productscompare', {products.products});
	 *		}
	 * 	}
	 * 
	 * 	environment.addTracker(myTracker);
	 * }
	 * // ...
	 * ```
	 * <!--
	 * THIS EXAMPLE USES A NATIVE BACKBONE VIEW, WHICH IS NO LONGER RECOMMENDED IN EXTENSIONS.
	 * 
	 * In the view file, use the `events` hash to bind the `click` event on a HTML element to the method that will do the comparison, `onCompareProductsAction()`. In the `onCompareProductsAction()` method, `triggerEvent()` is called with the custom event lister function as the first argument, and a list of the items for comparison as the second argument.
	 * `this.compareItems` is an ancilliary function that redirects to a comparison page. In this case, it expects a list of internal IDs of the items for comparison, which we can get with the {@link https://underscorejs.org/#pluck|_.pluck()} function.
	 * 
	 *  _MainModule.View.js_
	 * ```javascript
	 * 			// ...
	 * events = {
	 * 	'click [data-action="compare-products"]': 'onCompareProductsAction'
	 * }
	 * 
	 * onCompareProductsAction: function onCompareProductsAction() {
	 * 	this.environment.triggerEvent('compareProductsDone', { items: this.itemsAddedToTheComparison });
	 * 	this.compareItems(_.pluck(this.itemsAddedToTheComparison, 'internalid'));
	 * }
	 * 
	 * // ...
	 * ```
	 * -->
	 * In the view file (based on the {@link SCView} component), define a {@link SCView#getEvents|getEvents()} function to bind the `click` event on a HTML element to the method that will do the comparison, `onCompareProductsAction()`. In the `onCompareProductsAction()` method, `triggerEvent()` is called with the custom event listener function as the first argument, and a list of the items for comparison as the second argument.
	 * `this.compareItems` is an ancilliary function that redirects to a comparison page. In this case, it expects a list of internal IDs of the items for comparison, which we can get with the {@link https://underscorejs.org/#pluck|_.pluck()} function.
	 * 
	 *  _MainModule.View.js_
	 * ```javascript
	 * 			// ...
	 * MainView.prototype.getEvents = function() {
	 * 	return {
	 * 		'click [data-action="compare-products"]': 'onCompareProductsAction'
	 * 	}
	 * }
	 * 
	 * // Function called by the click event on the element with the data attribute 'compare-products'.
	 * MainView.prototype.onCompareProductsAction = function() {
	 * 	this.environment.triggerEvent('compareProductsDone', { items: this.itemsAddedToTheComparison });
	 * 	this.compareItems(_.pluck(this.itemsAddedToTheComparison, 'internalid'));
	 * }
	 * 
	 * MainView.prototype.compareItems = function(items) {
	 * 	// Compare the items.
	 * }
	 * // ...
	 * ```
	 * &nbsp; 
	 * 
	 * **Important**: `triggerEvent()` can only be used to trigger custom events that have been registered in the application with {@link Environment#addTracker|addTracker()}.
	 * 
	 * @since SuiteCommerce 2021.1
	 * @param {String} event The name of the event to trigger.
	 * @param {Object} [data] Optional custom event data. 
	 * @returns void
	 */
	triggerEvent(event, data) {
		return null;
	}

}

/**
 * Contains information about a page view. This object is provided in the event data of the `trackPageview` listener function, which you can declare as a function in a Tracker object. See {@link Environment#addTracker|addTracker()} for more information.
 * @typedef {Object} PageViewInfo
 * @property {String} url The URL of the page.
 */

/**
 * Contains information about the product viewed on a product details page (PDP). This object is provided in the event data of the `trackProductView` listener function, which you can declare as a function in a Tracker object. See {@link Environment#addTracker|addTracker()} for more information. 
 * @typedef {Object} ProductViewInfo
 * @property {String} internalid
 * @property {String} sku
 * @property {String} name
 * @property {Number} price
 * @property {Boolean} isinstock
 * @property {Boolean} isbackorderable
 * @property {Number} quantityavailable
 * @property {String} thumbnail
 * @property {String} urlComponent
 */


/**
 * 
 * @typedef {Object} Session
 * @property {SessionCurrency} currency
 * @property {SessionLanguage} language
 * @property {SessionTouchpoints} touchpoints
 * @property {String} priceLevel
 */

/**
 * @typedef  {Object} SessionCurrency
 * @property {String} internalid
 * @property {String} symbol
 * @property {String} code
 * @property {String} name
 * @property {String} currencyname
 * @property {String} isdefault
 * @property {Number} symbolplacement
 */

/**
 * @typedef  {Object} SessionLanguage
 * @property {String} name
 * @property {String} isdefault
 * @property {String} locale
 * @property {String} languagename
 */

/*
 * Defined in the addTracker() method.
 *
 * @typedef {Object} Tracker
 * @property {Function} [trackPageview] A function that is called when a user navigates to a page on the website.
 */

/**
 * Transaction info contains information about the completed transaction. This object is provided in the event data of the `trackTransaction` listener function, which you can declare as a function in a Tracker object. See {@link Environment#addTracker|addTracker()} for more information.
 * @typedef {Object} TransactionInfo
 * @property {String} confirmationNumber
 * @property {Number} subTotal
 * @property {Number} taxTotal
 * @property {Number} shippingCost Shipping costs related to the transaction.
 * @property {Number} handlingCost Handling costs related to the transaction.
 * @property {Number} total
 * @property {Array<TransactionProductInfo>} products The list of items in the transaction, as an array of `TransactionProductInfo` objects.
 * @property {Array<String>} promoCodes
 */

/**
 * Contains information about each item in a completed transaction. 
 * @typedef {Object} TransactionProductInfo
 * @property {String} sku
 * @property {String} name
 * @property {Number} price
 * @property {Number} quantity
 * @property {String} options
 */

/**
 * @typedef {Object} TranslationEntry Represents an entry in the translation dictionary.
 * @property {String} key The key of the translation.
 * @property {String} value The translation string. 
 */ 

/*
 * THIS IS NOT IMPLEMENTED AS AT 2019.1 RELEASE.
 * @typedef  {Object} SessionTouchpoints
 * @property {String} logout
 * @property {String} customercenter
 * @property {String} serversync
 * @property {String} viewcart
 * @property {String} login
 * @property {String} welcome
 * @property {String} checkout
 * @property {String} continueshopping
 * @property {String} home
 * @property {String} register
 * @property {String} storelocator
 */