/**
 * The Cart component provides ways to work with the cart, for example, adding lines, getting the cart summary, and applying promotions. It also exposes before and after events for several methods. For example, the `beforeAddLine` and `afterAddLine` events let you add event listeners before lines are added to the cart, and after lines are added to the cart respectively.
 * 
 * Get an instance of this component by calling `container.getComponent("Cart")`.
 * @class
 * @extends VisualComponent
 * @global
 * @hideconstructor
 */
class Cart extends VisualComponent {
	
		constructor() {
			super()
			/**
			 * Name of the cart main view. Use this name to reference views in methods such as {@link VisualComponent#addChildView|addChildView()} and {@link VisualComponent#addToViewContextDefinition|addToViewContextDefinition()}.
			 * @type {String}
			 */
			this.CART_VIEW = ''
	
			/**
			 * Name of the mini-cart main view. Use this name to reference views in methods such as {@link VisualComponent#addChildView|addChildView()} and {@link VisualComponent#addToViewContextDefinition|addToViewContextDefinition()}.
			 * @type {String}
			 */
			this.CART_MINI_VIEW = ''
	
			/**
			 * @type {String}
			 */
			this.WIZARD_VIEW = ''
		}
	
		/**
		 * Adds a line (item) to the cart. This method takes an object as its argument, which has a single property called `line`. The value of `line` is a {@link Line} object. Line has properties to specify the item and item quantity to add to the cart. You must know the internal ID of an item to add it to the cart.
		 * 
		 * If the item is already in the cart, the quantity of the line is increased by the value of the `quantity` property.
		 * 
		 * ```javascript
		 * 			var cart = container.getComponent('Cart');
		 * cart.addLine({
		 * 	line: {
		 * 		quantity: 1, 
		 * 		item: {
		 * 			internalid: 8058
		 * 		}
		 * 	}
		 * }).then(function() {
		 * 	alert(Utils.translate('Item added.'))
		 * });
		 * ```
		 * 
		 * @param {AddLineData} line The item to add to the cart. `line` is an AddLineData object.
		 * @return {Deferred} Returns a Deferred object. If the promise is resolved, the line is added to the cart.
		 */
		addLine(line) {
			return null;
		}
	
		/**
		 * Adds multiple lines to the cart. This method takes a single object as its argument with one property called `lines`. The value of `lines` is an array of {@link Line} objects.
		 * 
		 * ```javascript 
		 * 			var cart = container.getComponent("Cart");
		 * cart.addLines({
		 * 		lines: [
		 * 			{
		 * 				quantity: 1,
		 * 				item: {
		 * 					internalid: 4938
		 * 				}
		 * 			},
		 * 			{
		 * 				quantity: 1,
		 * 				item: {
		 * 					internalid: 4936
		 * 				}
		 * 			}
		 * 		]
		 * });
		 * 
		 * ```
		 * 
		 * @param {AddLines} lines The items to add to the cart. `lines` is an AddLines object that contains an array of AddLineData objects, each of which represents a line to add to the cart.
		 * @return {Deferred} Returns a Deferred object. If the promise is resolved, the lines are added to the cart.
		 */
		addLines(lines) {
			return null;
		}

		/**
		 * Adds a payment method.
		 * 
		 * ```javascript
		 * 			var cart = container.getComponent("Cart");
		 * cart.addPayment({
		 * 	payment_method: {
		 * 		internalid: 3
		 * 	}
		 * });
		 * 
		 * ```
		 * @param {PaymentMethod} data The payment method to add to the transaction. `data` is a PaymentMethod object, which contains a single property called `payment_method`. The value of `payment_method` is an object that contains payment method data such as the internal ID of the payment method in NetSuite, and credit card details if the payment method type is a credit card.
		 */
		addPayment(data) {
			return null;
		}

		/**
		 * Applies a promotion to the cart. If the promotion code is valid and successfully applied to the order, the promotion appears in the cart automatically and the order total is updated.
		 * 
		 * ```javascript
		 * 			var cart = container.getComponent("Cart");
		 * 
		 * if (cart) {
		 * 	cart.addPromotion({
		 * 		promocode: "5OFF"
		 * 	}).then(function(promotion) {
		 * 		alert("Promotion added.");
		 * 		console.log(promotion);
		 * 	}, function() {
		 * 		console.log("Could not add promotion.");
		 * 	});
		 * }
		 * ```
		 * 
		 * @param {Object} data Contains the data about the promotion.
		 * @param {String} data.promocode The promotion code (promocode) of the promotion. The value of `promocode` is the coupon code on the promotion record in NetSuite.
		 * @returns {Deferred} Returns a Deferred object. If the promise resolved, it returns a Promise object. If the promise is rejected (because the promotion could not be applied), it returns an error message object in JSON format.
		 */
		addPromotion(data) {
			return null;
		}

		/**
		 * Clears the shipping estimation from the order.
		 */
		clearEstimateShipping() {
			return null;
		}

		/**
		 * Gets the estimated shipping costs for a particular country and postal code combination. This method accepts an object as its argument. After you call this method, the order summary of the cart is updated with the postal code and the currency amount of the shipping estimate.
		 * 
		 * ```javascript
		 * 			var cart = container.getComponent("Cart");
		 * cart.estimateShipping({
		 * 	address: {
		 * 		zip: "10065",
		 * 		country: "US"
		 * 	}
		 * });
		 * ```
		 * <!-- @param {{address: {zip: String, country: String}}} data The postcode and country to use to estimate shipping. `data` is an object with a single property `address`. The value of `address` is an object with two properties: `zip` and `country`. -->
		 * @param {Object} data The address data to use to estimate shipping.
		 * @param {Object} data.address The address details. 
		 * @param {String} data.address.zip The postal code of the address
		 * @param {String} data.address.country The 2-letter country code of the address. 
		 * @returns {Deferred} Returns a Deferred object. The promise returns an object with two properties: `address` and `result`. `address` contains properties related to the shipping address, including the country and postal code. `result` contains properties related to shipping and handling costs, discount totals, and transaction totals.
		*/
		estimateShipping(data) {
			return null;
		}

		/*
		 * THIS METHOD DOES NOT SEEM TO EXIST - TO BE REMOVED
		 *
		 * Gets all addresses of the order.
		 * @returns {Deferred} Returns a Deferred object. If the promise is resolved, it returns an array of {@link Address}. If the promise is rejected, it returns an error.
		 */
		getAddresses() {
			return null
		}

		/**
		 * Gets the billing address of the order. <!-- This method returns the website visitor's billing address only when the visitor is logged in and is on the checkout page. -->
		 * 
		 * ```javascript
		 * 			var cart = container.getComponent("Cart");
		 * cart.getBillAddress().then(function(billaddress) {
		 * 	if (billaddress.isresidential == "T") {
		 * 		// Do work related to Sunday shipments for residential addresses.
		 * 		// ...
		 * 	}
		 * });
		 * ```
		 * 
		 * @returns {Deferred} Returns a Deferred object. If the promise is resolved, it returns an {@link Address}. If the promise is rejected, it returns an error. <!-- For example, if the user is not on the checkout page, the promise is rejected. -->
		 */
		getBillAddress() {
			return null
		}

		/**
		 * Gets the last line added to the cart.
		 * 
		 * The following example shows how you might use `getLatestAddition()` to allow a website visitor to remove the last item they added to the cart. When `getLatestAddition()` is called, it returns a {@link Line} object from which we can get the item ID. You can then pass the item ID to the {@link Cart#removeLine|removeLine()} method and show a message if the item was removed successfully.
		 * 
		 * ```javascript
		 * 			var cart = container.getComponent('Cart');
		 * 	
		 * cart.getLatestAddition().then(function(line) {
		 * 
		 * 	if (line) {
		 * 		var lastItemAddedId = line.internalid;	
		 * 		var lastItemAddedName = line.item.displayname;
		 * 
		 * 		cart.removeLine({
		 * 			line_id: lastItemAddedId
		 * 		}).then(function() {
		 * 			cart.showMessage({
		 * 				message: lastItemAddedName + ' was removed from the cart.',
		 * 				type: 'info'
		 * 			})
		 * 		});
		 * 	}
		 * 
		 * });
		 * ```
		 * 
		 * @since SuiteCommerce 2021.1
		 * @returns {Deferred} Returns a Deferred object. If the promise is resolved, it returns the line as a {@link Line} object; if the cart is empty, it returns null. Otherwise, the promise returns the rejected state.
		 */
		getLatestAddition() {
			return null;
		}
	
		/**
		 * Gets the lines in the cart. 
		 * 
		 * ```javascript
		 * var cart = container.getComponent("Cart");
		 * cart.getLines().then(function(lines) {
		 * 
		 * 		if (lines.length > 100) {
		 * 			throw new Error("You are ordering a lot of stuff. For high-volume orders, contact our sales team on 555-123-1234.");
		 * 		}
		 * });
		 * ```
		 * 
		 * @return {Deferred<Array<Line>>} Returns a Deferred object. If the promise is resolved, it returns the lines in the cart (an array of {@link Line} objects). Otherwise, the promise returns the rejected state.
		 */
		getLines() {
			return null;
		}

		/**
		 * Gets the currently selected payment method on the order. 
		 * 
		 * <!-- This method only works when the web store visitor is on the checkout page. -->
		 * 
		 * ```javascript
		 * 			var cart = container.getComponent('Cart');
		 * cart.getPaymentMethods().then(function(paymentmethods) {
		 * 	var paymentmethodtype = paymentmethods[0].type;
		 * 	var paymentmethodexpiry = paymentmethods[0].creditcard.expyear;
		 * 
		 * 	if (paymentmethodexpiry == todayyear) {
		 * 		// Do work related to payment method expiry date
		 * 		// ...
		 * 	}
		 * });
		 * ```
		 * 
		 * ```javascript
		 * 			// Example of the object returned by this method:
		 * {
		 * 	"extras": {...},
		 * 	"type": "creditcard",
		 * 	"creditcard": {
		 * 	"ccexpiredate": "11/1/2022",
		 * 	"ccname": "John Smith",
		 * 	"ccnumber": "************2780",
		 * 	"expmonth": "11",
		 * 	"expyear": "2022",
		 * 	"extras": {...},  
		 * 	"paymentmethod": {...}
		 * }
		 * ```
		 * 
		 * @return {Deferred} Returns a Deferred object. If the promise is resolved, it returns an array of {@link PaymentMethod} objects. If the promise is rejected, it returns an error.
		 */
		getPaymentMethods() {
			return null;
		}

		/**
		 * Gets the promotions in the cart.
		 * 
		 * ```javascript
		 * 			var cart = container.getComponent("Cart");
		 * cart.getPromotions().then(function(promotions) {
		 * 	if (promotions.length >= 3) {
		 * 		console.log("Too many promotions on this order!");
		 * 	}	
		 * });
		 * ```
		 * 
		 * @return {Deferred} Returns a Deferred object. If the promise is resolved, it returns an array of {@link Promotion} objects. If the promise is rejected, it returns an error.
		 * The Promotion object contains a property called `internalid`, which you can use with the {@link Cart#removePromotion|removePromotion()} method to remove a promotion from the cart.
		 */
		getPromotions() {
			return null;
		}

		/**
		 * Gets the purchase order number from the Enter Purchase Order Number field on the order. You can set the purchase order number with {@link Cart#setPurchaseOrderNumber|setPurchaseOrderNumber()}.
		 * 
		 * **Note**: To get the purchase order number, the 'Display Purchase Order Field on Payment Info Page' option must be checked on the website settings page in the NetSuite account. See the {@link https://nlcorp.app.netsuite.com/app/help/helpcenter.nl?fid=section_N2567548.html#bridgehead_N2569505|Shopping Preferences} topic in the Help Center for more information. 
		 * 
		 * ```javascript
		 * 			var cart = container.getComponent('Cart');
		 * var purchaseOrderNumber = '';			
		 * 
		 * cart.getPurchaseOrderNumber().then(function(ponumber) {
		 * 	purchaseOrderNumber = ponumber;
		 * 
		 * 	if (purchaseOrderNumber != '') {
		 * 		console.log('Purchase order number: ' + ponumber);
		 * 	}
		 * });
		 * ```
		 * 
		 * @since SuiteCommerce 2021.1
		 * @returns {Deferred} Returns a Deferred object. If the promise is resolved, it returns the purchase order number as a string. If the promise is rejected, it returns an error.
		 */
		getPurchaseOrderNumber() {
			return null;
		}

		/**
		 * Gets the shipping address of the order. 
		 * 
		 * <!-- To get the full details of the ship address, the user must be logged in and on the checkout page. -->
		 * 
		 * ```javascript
		 * 			var cart = container.getComponent("Cart");
		 * cart.getShipAddress().then(function(shipaddress) {
		 * 	
		 * 	if (shipaddress.country != "US") {
		 * 		alert("Shipping of this item outside the US may incur delays due to export regulations.");
		 * 	}
		 * })
		 * ```
		 * 
		 * ```javascript
		 * 			// Example of the Address object returned by this method:
		 * {
		 * 	addr1: "1 Main Street",
		 * 	addr2: "",
		 * 	addr3: "",
		 * 	city: "New York",
		 * 	company: null,
		 * 	country: "US",
		 * 	defaultbilling: "F",
		 * 	defaultshipping: "T",
		 * 	extras: {...},
		 * 	fullname: "John Smith",
		 * 	internalid: "42",
		 * 	isresidential: "F",
		 * 	isvalid: "T",
		 * 	phone: "555-123-1234",
		 * 	state: "NY",
		 * 	zip: "10065"
		 * }
		 * ```
		 * 
		 * @return {Deferred} Returns a Deferred object. If the promise is resolved, it returns an {@link Address} object. If the promise is rejected, it returns an error.
		 */
		getShipAddress() {
			return null;
		}

		/**
		 * Gets the selected shipping method on the order. If a shipping method is not yet set on the order, it returns an object with a single property called `extras` with an empty object as its value.
		 * 
		 * ```javascript
		 * 			var cart = container.getComponent("Cart");
		 * cart.getShipMethod().then(function(shipmethod) {
		 * 	if (shipmethod.internalid == "105") {
		 * 		alert("Delivery tracking for this ship method is available on www.example.com/track");
		 * 	}
		 * });
		 * ```
		 * 
		 * Example of the {@link ShipMethod} object returned by this method:
		 * ```javascript
		 * 			{
		 * 	extras: {},
		 * 	internalid: "105",
		 * 	name: "2-day shipping",
		 * 	rate: 10,
		 * 	rate_formatted: "$10.00",
		 * 	shipcarrier: "nonups"
		 * }
		 * ```
		 * 
		 * @return {Deferred} Returns a Deferred object. If the promise is resolved, it returns a {@link ShipMethod} object. If the promise is rejected, it returns an error.
		 */
		getShipMethod() {
			return null;
		}

		/**
		 * Gets all shipping methods available on the order.
		 * 
		 * ```javascript
		 * 			var cart = container.getComponent("Cart");
		 * cart.getShipMethods().then(function(shipmethods) {
		 * 	alert(shipmethods.length + " shipping methods are available on this order.");
		 * });
		 * ```
		 * 
		 * @return {Deferred} Returns a Deferred object. If the promise is resolved, it returns an array of {@link ShipMethod} objects. If the promise is rejected, it returns an error.
		 */
		getShipMethods() {
			return null;
		}

		/**
		 * Gets a summary of the cart including information such as the total currency amount, number of items in the transaction, tax amounts, and discounts applied.
		 * 
		 * ```javascript
		 * 		var cart = container.getComponent("Cart");
		 * cart.getSummary().then(function(summary) {
		 * 	if (summary.total > 10000) {
		 * 		throw new Error("Contact our sales team on 555-123-1234 for order amounts above 10,000 USD.");
		 * 	}
		 * });
		 * ```
		 * 
		 * Example of the {@link Summary} object returned by this method. Note that the list of properties in the extras property may differ depending on the configuration of your account.
		 * ```javascript
		 * 			{
		 * 	discounttotal: 0,
		 * 	estimatedshipping: 0,
		 * 	extras: {
		 * 		discountedsubtotal: 260.88,
		 * 		discountedsubtotal_formatted: "$260.88",
		 * 		discountrate: 0,
		 * 		discountrate_formatted: "",
		 * 		discounttotal_formatted: "($0.00)",
		 * 		estimatedshipping_formatted: "$0.00",
		 * 		giftcertapplied_formatted: "($0.00)",
		 * 		handlingcost_formatted: "$0.00",
		 * 		itemcount: 3,
		 * 		shippingcost_formatted: "$0.00",
		 * 		subtotal_formatted: "$260.88",
		 * 		tax2total_formatted: "$0.00",
		 * 		taxondiscount: 0,
		 * 		taxondiscount_formatted: "$0.00",
		 * 		taxonhandling: 0,
		 * 		taxonhandling_formatted: "$0.00",
		 * 		taxonshipping: 0,
		 * 		taxonshipping_formatted: "$0.00",
		 * 		taxtotal_formatted: "$0.00",
		 * 		total_formatted: "$260.88",
		 * 		totalcombinedtaxes: 0,
		 * 		totalcombinedtaxes_formatted: "$0.00"
		 * 	}
		 * 	giftcertapplied: 0,
		 * 	handlingcost: 0,
		 * 	shippingcost: 0,
		 * 	subtotal: 260.88,
		 * 	tax2total: 0,
		 * 	taxtotal: 0,
		 * 	total: 260.88
		 * }
		 * ```
		 * 
		 * @return {Deferred} Returns a Deferred object. If the promise is resolved, it returns a {@link Summary} object. If the promise is rejected, it returns an error.
		 */
		getSummary() {
			return null;
		}
	
		/**
		 * Removes a line from the cart. To decrease (or increase) the line quantity, use {@link Cart#updateLine|updateLine()} instead. 
		 * 
		 * ```javascript
		 * 				var cart = container.getComponent("Cart");
		 * 	cart.removeLine({
		 * 		"line_id": "i123"	
		 * 	}).then(function() {
		 * 		console.log("Line removed successfully.");
		 * 	}, function() {
		 * 		alert("An error occurred while trying to remove the item. Try again.");
		 * 	});
		 * ```
		 * @param {Object} line The line to remove from the cart. `line` is an object with a single property `line_id`. The value of `line_id` is the internal ID of the item.
		 * @return {Deferred} Returns a Deferred object. If the promise is resolved, it indicates the operation was successful.
		 */
		removeLine(line) {
			return null;
		}
	
		/**
		 * Removes a promotion from the cart. If the promotion is removed sucessfully, the cart total is updated and the promotion no longer appears in the cart. 
		 * 
		 * ```javascript
		 * 			var cart = container.getComponent("Cart");
		 * 
		 * if (cart) {
		 * 	cart.removePromotion({promocode_internalid: "22"}).fail(function() {
		 * 		console.log("Could not remove promotion.");
		 * 	});
		 * }
		 * ```
		 * 
		 * @param {{promocode_internalid: string}} data The promotion to remove from the cart. `data` is an object with a single property `promocode_internalid`. The value of `promocode_internalid` is the internal ID of the promotion. You can use the {@link Cart#getPromotions|getPromotions()} method to get the internal IDs of all promotions currently applied.
		 * @return {Deferred} Returns a Deferred object. If the promise is resolved, it indicates the promotion was removed successfully. Otherwise, if the promise fails, it returns an error message.
		 */
		removePromotion(data) {
			return null;
		}

		/*
		 *
		 * Removes the selected shipping method on the order.
		 */
		removeShipping() {
			return null;
		}

		/**
		 * Sets the purchase order number on the order, and displays it in the Enter Purchase Order Number field. You can pass in a parameter to optionally save the purchase order number in the user session. Saving the purchase order number in the user session does not save the order itself.
		 * 
		 * This method only works when the web store visitor is on the checkout page. Calling this method on any other page in the application will not set the purchase order number.
		 * 
		 * **Note**: To set the purchase order number, the 'Display Purchase Order Field on Payment Info Page' option must be checked on the website settings page in the NetSuite account. See the {@link https://nlcorp.app.netsuite.com/app/help/helpcenter.nl?fid=section_N2567548.html#bridgehead_N2569505|Shopping Preferences} topic in the Help Center for more information. 
		 * 
		 * You can get the purchase order number with {@link Cart#getPurchaseOrderNumber|getPurchaseOrderNumber()}.
		 * 
		 * ```javascript
		 * 			var cart = container.getComponent('Cart');
		 * 
		 * cart.setPurchaseOrderNumber('PO123456').then(function() {
		 * 	console.log('Purchase order number added.');
		 * }, function() {
		 * 	cart.showMessage({
		 * 		message: 'Purchase order number could not be added to the order.',
		 * 		type: 'error'
		 * 	});
		 * });
		 * ```
		 * 
		 * @since SuiteCommerce 2021.1
		 * @param {String} purchase_order_number The purchase order number to set on the order.
		 * @param {Boolean} [save_order] Indicates whether to save the purchase order number in the user session. If set to `true`, reloading the page or navigating away from the checkout page (for example, to add more items to the cart) maintains the purchase order number on the order.
		 * @returns {Deferred} Returns a Deferred object. If the promise is resolved, it indicates the operation was successful. If the promise is rejected, it returns an error. 
		 */
		setPurchaseOrderNumber(purchase_order_number, save_order) {
			return null;
		}

		/**
		 * Sets a shipping method on the order for all items in the cart. Use {@link Cart#getShipMethods|getShipMethods()} to get available shipping methods. If you pass in an invalid ship method ID, an error is returned.
		 * 
		 * **Note**: This method will not work if the Multiple Ship To feature is enabled in the NetSuite account. More information about Multiple Ship To is available in the {@link https://system.netsuite.com/app/help/helpcenter.nl?fid=section_4188560821.html|Help Center}.
		 * 
		 * ```javascript
		 * 			var cart = container.getComponent("Cart");
		 * var shipMethodId = '2910';
		 * var shipMethodData = {ship_method: {internalid: shipMethodId}};
		 * 
		 * cart.setShipMethod(shipMethodData).then(function() {
		 * 	cart.showMessage({
		 * 		message: 'Shipping method of the order was updated.',
		 * 		type: 'info'
		 * 	})
		 * });
		 * ```
		 * 
		 * @since SuiteCommerce 2021.1
		 * @param {ShipMethodData} ship_method The shipping method to set on the order. `ship_method` is a {@link ShipMethodData} object, for example, `{ship_method: {internalid: '2910'}}`.
		 * @returns {Deferred} Returns a Deferred object. If the promise is resolved, it returns a {@link ShipMethod} object. If the promise is rejected, it returns an error. For example, if Multiple Ship To is enabled in the NetSuite account, an error is returned (`INVALID_METHOD`).
		 */
		setShipMethod(ship_method) {
			return null;
		}

		/**
		 * Sets the value of a custom transaction body field on the order. To use this method, pass in an object that contains the field ID, its type, and the value you want to set. 
		 * 
		 * The following table shows which types of NetSuite fields are supported for each data type:
		 * <div style="width: 50%">
		 * 	<table class="table-bordered">
		 * 		<tr><th>Data Type</th><th>NetSuite Field Type</th></tr>
		 * 		<tr><td>string</td><td>text<br>textarea<br>richtext<br>longtext<br>select<br>URL<br>inlinehtml<br>phone<br>email<br>multiselect</td></tr>
		 * 		<tr><td>number</td><td>currency<br>float<br>integer<br>percent</td></tr>
		 * 		<tr><td>boolean</td><td>checkbox</td></tr>
		 * 		<tr><td>date</td><td>date</td></tr>
		 * 	</table>
		 * </div>
		 * &nbsp;
		 * 
		 * See the {@link https://3925220.app.netsuite.com/app/help/helpcenter.nl?fid=section_n2828059.html|Custom Transaction Body Fields} topic in the Help Center for more information about how to create custom transaction body fields in NetSuite.
		 * 
		 * Any of the following circumstances will cause this method to fail and return an error:
		 * * If there are no transaction body fields on the page.
		 * * If the specified transaction body field is not on the page. 
		 * * If the value of `value` does not match the specified `type` in the {@link TransactionBodyFieldData} object.
		 * * If the value of `type` in the {@link TransactionBodyFieldData} object does not match the field type in NetSuite.
		 * 
		 * 
		 * In the following example, `setTransactionBodyField()` is used to set the value of a custom field called 'custbody_customerref' to 'C123456', and then log success or fail messages to the console.
		 * ```javascript
		 * 			var cart = container.getComponent('Cart');
		 * var data = {
		 * 	fieldId: "custbody_customerref",
		 * 	type: "string",
		 * 	value: "C123456"
		 * }
		 * 
		 * cart.setTransactionBodyField(data).then(function() {
		 * 	console.log(data.fieldId + ' was set to ' + data.value);
		 * }).fail(function(error) {
		 * 	console.log('setTransactionBodyField failed.');
		 * });
		 * ```
		 * @since SuiteCommerce 2021.1
		 * @param {TransactionBodyFieldData} data Specifies the ID of the custom transaction body field, its type, and its value. 
		 * @returns {Deferred} Returns a Deferred object. If the promise is resolved, it indicates the operation was successful. If the promise is rejected, it returns an error.
		 */
		setTransactionBodyField(data) {
			return null;
		}
	
		/**
		 * Submits the order. The user must be logged in on the web store to submit an order. If information required to submit the order is missing or incomplete, this method returns an error message. This method only works on a secure domain.
		 * 
		 * ```javascript
		 * 			var cart = container.getComponent("Cart");
		 * cart.submit();
		 * 
		 * ```
		 * @return {Deferred} Returns a Deferred object. If the promise is resolved, it returns a {@link ConfirmationSubmit}. If the promise is rejected, it returns an error.
		 */
		submit() {
			return null;
		}
	
		/**
		 * Updates the quantity of a line in the cart. Setting the quantity to zero will remove the line from the cart.
		 * 
		 * ```javascript
		 * 			var cart = container.getComponent("Cart");
		 * cart.updateLine({
		 * 	line: {
		 * 		internalid: "i123",
		 * 		quantity: 2
		 * 	}
		 * }).then(function() {
		 * 	console.log("Line updated successfully");
		 * });
		 * ```
		 * @param {Line} line The line in the cart to update. `line` is an object with a single property called `line`. The value of the `line` property is a {@link Line} object. You only need to specify two properties in the Line object: `internalid` and `quantity`. All other properties of the Line object are ignored when updating the line.
		 * @return {Deferred} Returns a Deferred object. If the promise is resolved, it returns the line as a {@link Line} object. Otherwise, the promise returns the rejected state.
		 */
		updateLine(line) {
			return null;
		}		
	}
	

	
	// EVENTS
	// ------

	// BEFORE EVENTS

	/**
	 * Cancelable event triggered before a line is added to the cart. See {@link CancelableEvents}.
	 * @event Cart#beforeAddLine
	 * @type {object}
	 * @property {boolean} .
	 */

	/**
	 * Cancelable event triggered before a payment method is added to the order. See {@link CancelableEvents}.
	 * @event Cart#beforeAddPayment
	 * @type {object}
	 * @property {boolean} .
	 */

	/**
	 * Cancelable event triggered before a promotion is applied to the cart. See {@link CancelableEvents}.
	 * @event Cart#beforeAddPromotion
	 * @type {object}
	 * @property {boolean} .
	 */

	/**
	 * Cancelable event triggered before clearing shipping estimates for the cart. See {@link CancelableEvents}.
	 * @event Cart#beforeClearEstimateShipping
	 * @type {object}
	 * @property {boolean} .
	 */

	/**
	 * Cancelable event triggered before getting shipping esimates for the cart. See {@link CancelableEvents}.
	 * @event Cart#beforeEstimateShipping
	 * @type {object}
	 * @property {boolean} .
	 */

	/**
	 * Cancelable event triggered before a line in the cart is removed. See {@link CancelableEvents}.
	 * @event Cart#beforeRemoveLine
	 * @type {object}
	 * @property {boolean} .
	 */

	/**
	 * Cancelable event triggered before a promotion is removed from the cart. See {@link CancelableEvents}.
	 * @event Cart#beforeRemovePromotion
	 * @type {object}
	 * @property {boolean} .
	 */

	/**
	 * Cancelable event triggered before the purchase order number is set on the order. The event data is an object with a single property `purchase_order_number`.
	 * @event Cart#beforeSetPurchaseOrderNumber
	 * @type {Object}
	 * @property {String} purchase_order_number The purchase order number passed to the {@link Cart#setPurchaseOrderNumber|setPurchaseOrderNumber()} method.
	 */

	/**
	 * A cancelable event triggered before a ship method is set on the order. Listen for this event with the `on()` method of the {@link Cart} component.
	 * ```javascript
	 * 			var cart = container.getComponent('Cart');
	 * cart.on('beforeSetShipMethod', function(shipping_method) {
	 * 	console.log('setShipMethod fired.');
	 * 	console.log(shipping_method);
	 * });
	 * ```
	 * @event Cart#beforeSetShipMethod
	 * @type {Object}
	 * @property {String} internalid The internal ID of the shipping method.
	 */

	/**
	 * A cancelable event triggered before a custom transaction body field is updated with {@link Cart#setTransactionBodyField|setTransactionBodyField()}.
	 * @event Cart#beforeSetTransactionBodyField
	 * @type {Object}
	 * @property {Object} TransactionBodyFieldData The data to set on the custom transaction body field.
	 */

	/**
	 * Cancelable event triggered before the order is submitted. See {@link CancelableEvents}.
	 * @event Cart#beforeSubmit
	 * @type {object}
	 * @property {boolean} .
	 */
	
	/**
	 * Cancelable event triggered before a line in the cart is updated. See {@link CancelableEvents}. 
	 * @event Cart#beforeUpdateLine
	 */

	// AFTER EVENTS

	/**
	 * Event triggered after a line is added to the cart.
	 * @event Cart#afterAddLine
	 * @type {object}
	 * @property {boolean} .
	 */

	/**
	 * Event triggered after a payment method is added to the order.
	 * @event Cart#afterAddPayment
	 * @type {object}
	 * @property {boolean} .
	 */

	 /**
	 * Event triggered after a promotion is applied to the cart.
	 * @event Cart#afterAddPromotion
	 * @type {object}
	 * @property {boolean} .
	 */
	
	/**
	 * Event triggered after shipping estimates are cleared.
	 * @event Cart#afterClearEstimateShipping
	 * @type {object}
	 * @property {boolean} .
	 */

	/**
	 * Event triggered after shipping estimates retrieved.
	 * @event Cart#afterEstimateShipping
	 * @type {object}
	 * @property {boolean} .
	 */

	/**
	 * Event triggered after a line in the cart is removed.
	 * @event Cart#afterRemoveLine
	 * @type {object}
	 * @property {boolean} .
	 */

	/**
	 * Event triggered after a promotion is removed fromt the cart.
	 * @event Cart#afterRemovePromotion
	 * @type {object}
	 * @property {boolean} .
	 */

	/**
	 * An event triggered after the purchase order number is set on the order with {@link Cart#setPurchaseOrderNumber|setPurchaseOrderNumber()}. The event data is an object with a single property `purchase_order_number`.
	 * @event Cart#afterSetPurchaseOrderNumber
	 * @type {Object}
	 * @property {String} purchase_order_number The purchase order number passed to the {@link Cart#setPurchaseOrderNumber|setPurchaseOrderNumber()} method.
	 */

	/**
	 * An event triggered after the ship method is set on the order with {@link Cart#setShipMethod|setShipMethod()}. The event data is a {@link ShipMethod}.
	 * @event Cart#afterSetShipMethod
	 * @type {ShipMethod} 
	 */

	/**
	 * An event triggered after a custom transaction body field is updated with {@link Cart#setTransactionBodyField|setTransactionBodyField()}.
	 * @event Cart#afterSetTransactionBodyField
	 * @type {Object}
	 * @property {Object} TransactionBodyFieldData The data that was set on the custom transaction body field.
	 */

	 /**
	 * Event triggered after the order is submitted.
	 * @event Cart#afterSubmit
	 * @type {object}
	 * @property {boolean} .
	 */

	/**
	 * Event triggered after a line in the cart is updated.
	 * @event Cart#afterUpdateLine
	 * @type {object}
	 * @property {boolean} .
	 */
	


	// DATA TYPE DEFINITIONS
	// ---------------------
	
	
	
	/**
	 * @typedef {Object} AddLineData Represents a line to be added to the cart.
	 * @property {Line} line The line to add to the cart. The value of `line` is a {@link Line} object.
	 */
	
	/**
	 * @typedef {Object} AddLines Represents one or more lines to be added to the cart. It is used with the {@link Cart#addLines|addLines()} method to add multuple lines to the cart.
	 * @property {Array<Line>} lines The lines to add to the cart. `lines` is an array of `Line` objects.
	 */
	
	/**
	 * @typedef {Object} Line A line in the cart. Use when getting, adding, or removing lines from the cart. The {@link Cart#getLines|getLines()} method of the {@link Cart} component returns an array of Line objects.
	 * @property {String} [internalid] The line ID of the item in the cart. `internalid` is required to add or remove lines in a cart.
	 * @property {Number} [quantity] 
	 * @property {Number} [amount]
	 * @property {Number} [rate]
	 * @property {Number} [tax_amount]
	 * @property {String} [tax_code]
	 * @property {String} [itemtype]
	 * @property {*} [item]
	 *
	 * @property {Number} item.internalid
	 * @property {String} [item.itemid]
	 * @property {String} [item.displayname]
	 * @property {Boolean} [item.isinactive]
	 * @property {String} [item.itemtype]
	 * @property {Number} [item.minimumquantity]
	 *
	 * @property {Array<LineOption>} [options]
	 * 
	 * @property {*} [extras]
	 * 
	 * @property {String} [extras.shipaddress] SCA specific
	 * @property {String} [extras.shipmethod] SCA specific
	 * @property {Number} [extras.tax_rate] SCA specific
	 * @property {String} [extras.rate_formatted] SCA specific
	 * @property {Number} [extras.discount] SCA specific
	 * @property {number} [extras.total] SCA specific
	 * @property {String} [extras.amount_formatted] SCA specific
	 * @property {String} [extras.tax_amount_formatted] SCA specific
	 * @property {String} [extras.discount_formatted] SCA specific
	 * @property {String} [extras.total_formatted] SCA specific
	 * @property {String} [extras.description] SCIS specific
	 * @property {String} [extras.giftcertfrom] SCIS specific
	 * @property {String} [extras.giftcertmessage] SCIS specific
	 * @property {Number} [extras.giftcertnumber] SCIS specific
	 * @property {String} [extras.giftcertrecipientemail] SCIS specific
	 * @property {String} [extras.giftcertrecipientname] SCIS specific
	 * @property {String} [extras.taxrate1] SCIS specific
	 * @property {String} [extras.taxrate2] SCIS specific
	 * @property {String} [extras.grossamt] SCIS specific
	 * @property {String} [extras.tax1amt] SCIS specific
	 * @property {String} [extras.custreferralcode] SCIS specific
	 * @property {Boolean} [extras.excludefromraterequest] SCIS specific
	 * @property {String} [extras.custcol_ns_pos_voidqty] SCIS specific
	 * @property {Number} [extras.voidPercentage] SCIS specific
	 * @property {Number} [extras.returnedQuantity] SCIS specific
	 * @property {Boolean} [extras.isUnvalidatedReturn] SCIS specific
	 * @property {Boolean} [extras.order] SCIS specific
	 * @property {String} [extras.note] SCIS specific	
	 */
	
	/**
	 * This is the representation of the line's option in the  {@link Line} type
	 * @typedef {Object} LineOption
	 * @property {String} cartOptionId
	 * @property {{internalid:String}} value an object with a String property *internalid*
	 */

	/**
	 * @typedef {Object} Promotion Refers to a promotion. The {@link Cart#getPromotions|getPromotions()} method returns an array of Promotion objects. You can use the value of the `internalid` property of a Promotion object to remove promotions from the cart - see {@link Cart}.
	 * @property {String} [internalid] The internal ID of the promotion record in NetSuite.
	 * @property {String} type The type of promotion, for example, a free gift promotion or an order promotion.
	 * @property {String} name The name of the discount item for accounting in NetSuite.
	 * @property {String} rate The amount of the promotion. 
	 * @property {String} code The coupon code of the promotion in NetSuite.
	 * @property {String} errormsg The error message returned if the promotion cannot be applied.
	 * @property {Boolean} isvalid Indicates if the promotion can be applied to items in the cart.
	 */
	
	/**
	 * This is the representation of the cart's summary returned by  {@link getSummary}.
	 * @typedef {Object} Summary
	 * @property {Number} [total]
	 * @property {Number} [taxtotal]
	 * @property {Number} [tax2total]
	 * @property {Number} [discounttotal]
	 * @property {Number} [subtotal]
	 * @property {Number} [shippingcost]
	 * @property {Number} [handlingcost]
	 * @property {Number} [giftcertapplied]
	
	 * @property {String} [discounttotal_formatted] SCA specific
	 * @property {String} [taxonshipping_formatted] SCA specific
	 * @property {String} [taxondiscount_formatted] SCA specific
	 * @property {Number} [itemcount] SCA specific
	 * @property {String} [taxonhandling_formatted] SCA specific
	 * @property {Number} [discountedsubtotal] SCA specific
	 * @property {String} [discountedsubtotal_formatted] SCA specific
	 * @property {Number} [taxondiscount] SCA specific
	 * @property {String} [handlingcost_formatted] SCA specific
	 * @property {Number} [taxonshipping] SCA specific
	 * @property {String} [taxtotal_formatted] SCA specific
	 * @property {String} [totalcombinedtaxes_formatted] SCA specific
	 * @property {Number} [totalcombinedtaxes] SCA specific
	 * @property {String} [giftcertapplied_formatted] SCA specific
	 * @property {String} [shippingcost_formatted] SCA specific
	 * @property {Number} [discountrate] SCA specific
	 * @property {Number} [taxonhandling] SCA specific
	 * @property {String} [tax2total_formatted] SCA specific
	 * @property {String} [discountrate_formatted] SCA specific
	 * @property {Number} [estimatedshipping] SCA specific
	 * @property {String} [estimatedshipping_formatted] SCA specific
	 * @property {String} [total_formatted] SCA specific
	 * @property {String} [subtotal_formatted] SCA specific
	
	 * @property {String} shippingtax1rate SCIS specific
	 * @property {Boolean} shippingcostoverridden SCIS specific
	 * @property {Number} amountdue SCIS specific
	 * @property {String} tranid SCIS specific
	 * @property {Date} createddate SCIS specific
	 * @property {String} couponcode SCIS specific
	 * @property {Date} createdfrom SCIS specific
	 * @property {Number} changedue SCIS specific
	 */

	/**
	 * Contains the data to set on a specific custom transaction body field. This object is used with the {@link Cart#setTransactionBodyField|setTransactionBodyField()} method of the {@link Cart} component.
	 * 
	 * ```javascript
	 * 			{
	 * 	fieldId: 'custbody_customerref',
	 * 	type: 'string',
	 * 	value: '12083'
	 * }
	 * ```
	 * @typedef {Object} TransactionBodyFieldData
	 * @property {String} fieldId The internal ID of the custom transaction body field in NetSuite.
	 * @property {String} type The type of data the field accepts. It must be one of the following: `string`, `number`, `boolean`, or `date`.
	 * @property {String|Number|Boolean|Date} value The value to set on the field. It must correspond to the specified type.
	 */
	
	/**
	 * In SCA the object returned by getShoppingSession().getOrder().submit()
	 * @typedef {Object} ConfirmationSubmit
	 */
	
	/**
	 * Represents an address record in NetSuite.
	 * @typedef {Object} Address 
	 * @property {String} internalid The internal ID of the address record in NetSuite.
	 * @property {String} zip The postal code of the address.
	 * @property {String} country The two-letter country code of the address, for example, "CA", "IE", or "US".
	 * @property {String} addr1 The first line of the address.
	 * @property {String} addr2 The second line of the address.
	 * @property {String} addr3 The third line of the address.
	 * @property {String} city The city name.
	 * @property {String} company The company name.
	 * @property {Boolean} defaultbilling Indicates whether the address is the default billing address (`T`) or a secondary address (`F`).
	 * @property {Boolean} defaultshipping Indicates whether the address is the default shipping address (`T`) or a secondary address (`F`).
	 * @property {String} fullname The customer's full name.
	 * @property {Boolean} isresidential Indicates whether the address is a residential address (`T`) or a business address (`F`).
	 * @property {Boolean} isvalid Indicates whether the address is currently valid (`T`) or invalid (`F`).
	 * @property {String} phone The phone number associated with the address.
	 * @property {String} state The state or province.
	 */
	
	/**
	 * @typedef {Object} ShipMethod A shipping method.
	 * @property {String} internalid The internal ID of the shipping item record in NetSuite.
	 * @property {String} name The name of the shipping item.
	 * @property {Number} rate The rate charged for this shipping method, for example, "10". 
	 * @property {String} rate_formatted The formatted rate charged for the shipping method, for example, "$10.00".
	 * @property {String} shipcarrier
	 */

	/**
	 * @typedef {Object} ShipMethodData The data required to set a shipping method on an order. This object is used with the {@link Cart#setShipMethod|setShipMethod} method.
	 * @property {Object} ship_method Contains the internal ID of the ship method.
	 * @property {String} ship_method.internalid The internal ID of the ship method. 
	 */
	
	/**
	 * @typedef {Object} PaymentMethod Refers to a payment method in NetSuite.
	 * @property {String} internalid
	 * @property {String} type valid options: [creditcard, invoice, paypal, giftcertificate, external_checkout]
	 * @property {CreditCard} creditcard Required only if it is a creditcard
	
	 * @property {String} creditcard.ccnumber Required only if it is a creditcard
	 * @property {String} creditcard.ccname Required only if it is a creditcard
	 * @property {String} creditcard.ccexpiredate Required only if it is a creditcard
	 * @property {String} creditcard.expmonth Required only if it is a creditcard
	 * @property {String} creditcard.expyear Required only if it is a creditcard
	 * @property {String} creditcard.ccsecuritycode Required only if it is a creditcard
	
	 * @property {String} creditcard.paymentmethod.internalid
	 * @property {String} creditcard.paymentmethod.name
	 * @property {Boolean} creditcard.paymentmethod.creditcard
	 * @property {Boolean} creditcard.paymentmethod.ispaypal
	 * @property {String} creditcard.paymentmethod.key
	
	 * @property {String} key
	 * @property {String} thankyouurl
	 * @property {String} errorurl
	 * @property {String} giftcertificate.code Required only if it is a giftcertificate
	
	 */
	