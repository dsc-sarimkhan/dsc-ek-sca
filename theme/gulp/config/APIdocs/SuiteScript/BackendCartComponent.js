/**
 * <p class="label label-warning">DEPRECATED</p>
 * 
 * <div style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This component has been <b>deprecated</b>. Use components in the <a href="">frontend extensibility API</a>, or SuiteScript 2.0 modules and methods instead.</div>
 * 
 * Provides methods for working with multiple aspects of a cart, including lines, cart summary, estimates, promotions, and the submit action. It also exposes cancelable events that are triggered before and after changes to lines, estimates, promotions, and so on.

 * @class
 * @deprecated Since SuiteCommerce 2020.1
 * @extends BackendBaseComponent
 * @global
 * @hideconstructor
 */
class BackendCartComponent extends BackendBaseComponent {

	constructor() {
		super()
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Adds a new line to the cart. Returns a Deferred object. If the promise is resolved, the line is added to the cart. If the promise is rejected, it returns an error.
	 * 
	 * @deprecated Since SuiteCommerce 2020.1
	 * @param {{line:Line}} data A Line object.
	 * @return {Deferred}
	 */
	addLine(data) {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * The synchronous version of {@link BackendCartComponent#addLine|addLine}.
	 * 
	 * @deprecated Since SuiteCommerce 2020.1
	 * @param {{line:Line}} data
	 * @return {String}
	 */
	addLineSync(data) {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Adds multiple lines to the cart. Returns a Deferered object. If the object is resolved, the lines (as an array of strings) are added to the cart. If the object is rejected, it returns an error.
	 * 
	 * @deprecated Since SuiteCommerce 2020.1
	 * @param {{lines:Array<Line>}} lines
	 * @return {Deferred}
	 */
	addLines(lines) {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * The synchronous version of {@link BackendCartComponent#addLines|addLines}.
	 * @param {{lines:Array<Line>}} lines
	 * @return {Array<String>}
	 */
	addLinesSync(lines) {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Gets the lines in the cart and returns a Deferred object. If the promise is resolved, it returns an array of {@link Line} objects. If the promise is rejected, it returns an error.
	 * @return {Deferred}
	 */
	getLines() {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#getLines}.
	 * @return {Array<Line>}
	 */
	getLinesSync() {
		return null
	}


	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Removes a line from the cart. Returns a Deferred that is resolved in the case the operation was done successfully or rejected with an error message.
	 * @param {String} internalid id of the line to remove
	 * @return {Deferred}
	 */
	removeLine(internalid) {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#removeLine}.
	 * @return {undefined|string} returns undefined if successful or an error message if an errors occurs.
	 */
	removeLineSync(internalid) {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Updates a cart's line. Returns a Deferred that is resolved with {@link Line} in the case the operation was done successfully,
	 * or rejected with an error message.
	 * @param {Line} line
	 * @return {Deferred}
	 */
	updateLine(line) {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#updateLine}.
	 * @param {{line:Line}} line
	 * @return {Line|string}
	 */
	updateLineSync(line) {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Returns the summary of the cart as a Deferred that is resolved with a {@link Summary} in the case the operation was done successfully or
	 * rejected with an error message.
	 * @return {Deferred}
	 */
	getSummary() {
		return null
	}
	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#getSummary}.
	 * @return {Summary}
	 */
	getSummarySync() {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Submits the order. Returns a Deferred that is resolved with a {@link ConfirmationSubmit} object in the case
	 * the operation was done successfully,	or rejected with an error message.
	 * @return {Deferred}
	 */
	submit() {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#submitSync}.
	 * @return {ConfirmationSubmit}
	 */
	submitSync() {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Adds a payment method
	*/
	addPayment(data) {
		return null
	}
	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#addPayment}.
	 */
	addPaymentSync(data) {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Returns the payment methods added to the order
	 * @return {Deferred} Return a jQuery Deferred that is resolved with an array of {@link PaymentMethod}
	 * in the case the operation was done successfully or the promise is rejected with an error message.
	 */
	getPaymentMethods() {
		return null
	}
	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#addPayment}.
	 */
	getPaymentMethodsSync() {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Adds a promotion
	 * @param {{promocode: String}} the promocode to add
	 */
	addPromotion(data) {
		return null
	}
	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#addPromotion}.
	 */
	addPromotionSync() {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Removes a promotion.
	 * @param {{promocode_internalid: string}} data
	 * @return {Deferred}
	 */
	removePromotion(data) {
		return null
	}
	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#removePromotion}.
	 */
	removePromotionSync() {
		return null
	}


	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Returns the promotion codes added to the cart.
	 * @return {Deferred} Returns a Deferred that is resolved with an array of {@link Promotion} in the case the
	 * operation was done successfully or rejected with an error message.
	 */
	getPromotions() {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#getPromotions}.
	 */
	getPromotionsSync() {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Returns the estimated shipping costs.
	 * @param {{zip: string, country: string}} locationData
	 */
	estimateShipping(locationData) {
		return null
	}
	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#estimateShipping}.
	 */
	estimateShippingSync() {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Removes the shipping method
	 */
	removeShipping() {
		return null
	}
	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#removeShipping}.
	 */
	removeShippingSync() {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Clears the shopping estimations in the cart.
	 */
	clearEstimateShipping() {
		return null
	}
	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#clearEstimateShipping}.
	 */
	clearEstimateShippingSync() {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Returns the addresses of the order.
	 * @return {Deferred} Return a jQuery Deferred that is resolved with an array of {@link Address} in the case the operation
	 * was done successfully or the promise is rejected with an error message.
	 */
	getAddresses() {
		return null
	}
	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#getAddresses}.
	 */
	getAddressesSync() {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Returns the shipping address of the order.
	 * @return {Deferred} Return a jQuery Deferred that is resolved with an {@link Address} in the case the operation
	 * was done successfully or the promise is rejected with an error message.
	 */
	getShipAddress() {
		return null
	}
	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#getShipAddress}.
	 */
	getShipAddressSync() {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Returns the billing address of the order
	 * @return {Deferred} Return a jQuery Deferred that is resolved with an {@link Address} in the case the operation
	 * was done successfully or the promise is rejected with an error message.
	 */
	getBillAddress() {
		return null
	}
	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#getBillAddress}.
	 */
	getBillAddressSync() {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Returns the ship methods of the order.
	 * @return {Deferred} Return a jQuery Deferred that is resolved with an array of {@link ShipMethod} in the case the operation
	 * was done successfully or the promise is rejected with an error message.
	 */
	getShipMethods() {
		return null
	}
	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#getShipMethods}.
	 */
	getShipMethodsSync() {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Returns the selected shipping method of the order.
	 * @return {Deferred} Return a jQuery Deferred that is resolved with an array of {@link ShipMethod} in the case the operation
	 * was done successfully or the promise is rejected with an error message.
	 */
	getShipMethod() {
		return null
	}
	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#getShipMethod}.
	 */
	getShipMethodSync() {
		return null
	}


	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Voids a line. Implemented only for SCIS.
	 */
	voidLine() {
		return null
	}
	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#voidLine}.
	 */
	voidLineSync() {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Unvoids a line. Implemented only for SCIS.
	 */
	unvoidLine() {
		return null
	}
	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#unvoidLine}.
	 */
	unvoidLineSync() {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Updates a customer data. Implemented only for SCIS.
	 */
	updateCustomer() {
		return null
	}

	/**
	 * <p style="background-color: lightyellow; margin-bottom: 10px; margin-top: 10px; padding: 4px">This method has been <b>deprecated</b>. Use methods in the <a href="../Frontend/index.html">frontend extensibility API</a>, or SuiteScript 2.0 methods instead.</p>
	 * 
	 * Synchronous version of {@link BackendCartComponent#updateCustomer}.
	 */
	updateCustomerSync() {
		return null
	}
}


//Events:


/**
 * Cancelable event triggered before a cart's line is updated. See {@link BackendCancelableEvents}
 * @event BackendCartComponent#beforeUpdateLine
 * @type {object}
 * @property {boolean} .
 */

/**
 * Triggered after a cart's line is updated See
 * @event BackendCartComponent#afterUpdateLine
 * @type {object}
 * @property {boolean} .
 */

/**
 * Cancelable event triggered before a cart's line is removed. See {@link BackendCancelableEvents}
 * @event BackendCartComponent#beforeRemoveLine
 * @type {object}
 * @property {boolean} .
 */


/**
 * Triggered after a cart's line is removed
 * @event BackendCartComponent#afterRemoveLine
 * @type {object}
 * @property {boolean} .
 */

/**
 * Cancelable event triggered before doing an estimate shipping in the cart. See {@link BackendCancelableEvents}
 * @event BackendCartComponent#beforeEstimateShipping
 * @type {object}
 * @property {boolean} .
 */

/**
 * Triggered after an estimate shipping is done in the cart
 * @event BackendCartComponent#afterEstimateShipping
 * @type {object}
 * @property {boolean} .
 */

/**
 * Cancelable event triggered before clearing an estimate shipping in the cart. See {@link BackendCancelableEvents}
 * @event BackendCartComponent#beforeClearEstimateShipping
 * @type {object}
 * @property {boolean} .
 */

/**
 * Triggered after an estimate shipping is cleared in the cart
 * @event BackendCartComponent#afterClearEstimateShipping
 * @type {object}
 * @property {boolean} .
 */

/**
 * Triggered before a promotion is added to the cart. See {@link BackendCancelableEvents}
 * @event BackendCartComponent#beforeAddPromotion
 * @type {object}
 * @property {boolean} .
 */

/**
 * Triggered before a promotion is added to the cart
 * @event BackendCartComponent#afterAddPromotion
 * @type {object}
 * @property {boolean} .
 */

/**
 * Triggered before a promocode is removed from the cart. See {@link BackendCancelableEvents}
 * @event BackendCartComponent#beforeRemovePromotion
 * @type {object}
 * @property {boolean} .
 */

/**
 * Triggered after a promocode is removed from the cart
 * @event BackendCartComponent#afterRemovePromotion
 * @type {object}
 * @property {boolean} .
 */

/**
 * Triggered before a payment method is added to the order. See {@link BackendCancelableEvents}
 * @event BackendCartComponent#beforeAddPayment
 * @type {object}
 * @property {boolean} .
 */

/**
 * Triggered after a payment method is added to the order
 * @event BackendCartComponent#afterAddPayment
 * @type {object}
 * @property {boolean} .
 */

/**
 *  Triggered before the order is submitted. See {@link BackendCancelableEvents}
 * @event BackendCartComponent#beforeSubmit
 * @type {object}
 * @property {boolean} .
 */

/**
 * Triggered after the order is submitted
 * @event BackendCartComponent#afterSubmit
 * @type {object}
 * @property {boolean} .
 */

/**
 * Cancelable event triggered before adding a new cart's line. See {@link BackendCancelableEvents}
 * @event BackendCartComponent#beforeAddLine
 * @type {object}
 * @property {boolean} .
 */

/**
 * Triggered after a new line is added in the cart
 * @event BackendCartComponent#afterAddLine
 * @type {object}
 * @property {boolean} .
 */


// // Data types:

// /**
//  * This is the representation of Promotion objects for methods liks {@link addPromotion}, {@link getPromotions} etc
//  * @typedef {Object} Promotion
//  * @property {String} internalid
//  * @property {String} type
//  * @property {String} name
//  * @property {String} rate
//  * @property {String} code
//  * @property {String} errormsg
//  * @property {Boolean} isvalid
//  */


// /**
//  * This is the representation of the cart's line objects with you call {@link addLine}, {@link getLine}, etc
//  * @typedef {Object} Line
//  * @property {String} internalid
//  * @property {Number} quantity
//  * @property {Number} amount
//  * @property {Number} rate
//  * @property {Number} tax_amount
//  * @property {String} tax_code
//  * @property {String} itemtype

// //  * @property {String} extras.shipaddress SCA specific
// //  * @property {String} extras.shipmethod SCA specific
// //  * @property {Number} extras.tax_rate SCA specific
// //  * @property {String} extras.rate_formatted SCA specific
// //  * @property {Number} extras.discount SCA specific
// //  * @property {number} extras.total SCA specific
// //  * @property {String} extras.amount_formatted SCA specific
// //  * @property {String} extras.tax_amount_formatted SCA specific
// //  * @property {String} extras.discount_formatted SCA specific
// //  * @property {String} extras.total_formatted SCA specific
// //  * @property {String} extras.description SCIS specific
// //  * @property {String} extras.giftcertfrom SCIS specific
// //  * @property {String} extras.giftcertmessage SCIS specific
// //  * @property {Number} extras.giftcertnumber SCIS specific
// //  * @property {String} extras.giftcertrecipientemail SCIS specific
// //  * @property {String} extras.giftcertrecipientname SCIS specific
// //  * @property {String} extras.taxrate1 SCIS specific
// //  * @property {String} extras.taxrate2 SCIS specific
// //  * @property {String} extras.grossamt SCIS specific
// //  * @property {String} extras.tax1amt SCIS specific
// //  * @property {String} extras.custreferralcode SCIS specific
// //  * @property {Boolean} extras.excludefromraterequest SCIS specific
// //  * @property {String} extras.custcol_ns_pos_voidqty SCIS specific
// //  * @property {Number} extras.voidPercentage SCIS specific
// //  * @property {Number} extras.returnedQuantity SCIS specific
// //  * @property {Boolean} extras.isUnvalidatedReturn SCIS specific
// //  * @property {Boolean} extras.order SCIS specific
// //  * @property {String} extras.note SCIS specific

// //  * @property {Array<LineOption>} options

// //  * @property {Number} line.item.internalid
// //  * @property {String} line.item.itemid
// //  * @property {String} line.item.displayname
// //  * @property {Boolean} line.item.isinactive
// //  * @property {String} line.item.itemtype
// //  * @property {Number} line.item.minimumquantity


// //  * @property {Boolean} line.item.extras.isinstock SCA specific
// //  * @property {Boolean} line.item.extras.isonline SCA specific
// //  * @property {Object} line.item.extras.matrixchilditems_detail SCA specific
// //  * @property {Boolean} line.item.extras.ispurchasable SCA specific
// //  * @property {String} line.item.extras.stockdescription SCA specific
// //  * @property {Boolean} line.item.extras.isfulfillable SCA specific
// //  * @property {Boolean} line.item.extras.isbackorderable SCA specific
// //  * @property {Boolean} line.item.extras.showoutofstockmessage SCA specific
// //  * @property {String} line.item.extras.outofstockmessage SCA specific
// //  * @property {String} line.item.extras.storedisplayname2 SCA specific
// //  * @property {Number} line.item.extras.pricelevel1 SCA specific
// //  * @property {String} line.item.extras.pricelevel1_formatted SCA specific
// //  * @property {String} line.item.extras.urlcomponent SCA specific
// //  * @property {Object} line.item.extras.itemimages_detail SCA specific
// //  * @property {Object} line.item.extras.onlinecustomerprice_detail SCA specific
// //  * @property {Object} line.item.extras.itemoptions_detail SCA specific
// //  * @property {String} line.item.extras.type SCIS specific
// //  * @property {String} line.item.extras.baseprice SCIS specific
// //  * @property {String} line.item.extras.matrix_parent SCIS specific
// //  * @property {String} line.item.extras.upccode SCIS specific
// //  * @property {String} line.item.extras.additional_upcs SCIS specific
// //  * @property {Boolean} line.item.extras.isdonationitem SCIS specific
// //  * @property {Boolean} line.item.extras.custitem_ns_pos_physical_item SCIS specific
//  */


// /**
//  * This is the representation of the line's option in the  {@link Line} type
//  * @typedef {Object} LineOption
//  * @property {String} cartOptionId
//  * @property {{internalid:String}} value an object with a String property *internalid*
//  */









// /**
//  * This is the representation of the cart's summary returned by  {@link getSummary},  etc
//  * @typedef {Object} Summary
//  * @property {Number} total
//  * @property {Number} taxtotal
//  * @property {Number} tax2total
//  * @property {Number} discounttotal
//  * @property {Number} subtotal
//  * @property {Number} shippingcost
//  * @property {Number} handlingcost
//  * @property {Number} giftcertapplied

//  * @property {String} discounttotal_formatted SCA specific
//  * @property {String} taxonshipping_formatted SCA specific
//  * @property {String} taxondiscount_formatted SCA specific
//  * @property {Number} itemcount SCA specific
//  * @property {String} taxonhandling_formatted SCA specific
//  * @property {Number} discountedsubtotal SCA specific
//  * @property {String} discountedsubtotal_formatted SCA specific
//  * @property {Number} taxondiscount SCA specific
//  * @property {String} handlingcost_formatted SCA specific
//  * @property {Number} taxonshipping SCA specific
//  * @property {String} taxtotal_formatted SCA specific
//  * @property {String} totalcombinedtaxes_formatted SCA specific
//  * @property {Number} totalcombinedtaxes SCA specific
//  * @property {String} giftcertapplied_formatted SCA specific
//  * @property {String} shippingcost_formatted SCA specific
//  * @property {Number} discountrate SCA specific
//  * @property {Number} taxonhandling SCA specific
//  * @property {String} tax2total_formatted SCA specific
//  * @property {String} discountrate_formatted SCA specific
//  * @property {Number} estimatedshipping SCA specific
//  * @property {String} estimatedshipping_formatted SCA specific
//  * @property {String} total_formatted SCA specific
//  * @property {String} subtotal_formatted SCA specific

//  * @property {String} shippingtax1rate SCIS specific
//  * @property {Boolean} shippingcostoverridden SCIS specific
//  * @property {Number} amountdue SCIS specific
//  * @property {String} tranid SCIS specific
//  * @property {Date} createddate SCIS specific
//  * @property {String} couponcode SCIS specific
//  * @property {Date} createdfrom SCIS specific
//  * @property {Number} changedue SCIS specific
// 	*/



// /**
//  * in SCA the object returned by getShoppingSession().getOrder().submit()
//  * @typedef {Object} ConfirmationSubmit
//  */



// /**
//  * This is the representation an address
//  * @typedef {Object} Address
//  * @property {String} internalid
// @property {String} zip
// @property {String} country
// @property {String} addr1
// @property {String} addr2
// @property {String} addr3
// @property {String} city
// @property {String} company
// @property {Boolean} defaultbilling
// @property {Boolean} defaultshipping
// @property {String} fullname
// @property {Boolean} isresidential
// @property {Boolean} isvalid
// @property {String} phone
// @property {String} state
//  */

// /**
//  * This is the representation of a shipping method
//  * @typedef {Object} ShipMethod
// @property {String} internalid
// @property {String} name
// @property {Number} rate
// @property {String} rate_formatted
// @property {String} shipcarrier
//  */

// /**
//  * This is the representation of a shipping method
//  * @typedef {Object} PaymentMethod
// @property {String} internalid
// @property {String} type [creditcard, invoice, paypal, giftcertificate, external_checkout]
// @property {CreditCard} creditcard Required only if it is a creditcard

// @property {String} creditcard.ccnumber Required only if it is a creditcard
// @property {String} creditcard.ccname Required only if it is a creditcard
// @property {String} creditcard.ccexpiredate Required only if it is a creditcard
// @property {String} creditcard.expmonth Required only if it is a creditcard
// @property {String} creditcard.expyear Required only if it is a creditcard
// @property {String} creditcard.ccsecuritycode Required only if it is a creditcard

// @property {String} creditcard.paymentmethod.internalid
// @property {String} creditcard.paymentmethod.name
// @property {Boolean} creditcard.paymentmethod.creditcard
// @property {Boolean} creditcard.paymentmethod.ispaypal
// @property {String} creditcard.paymentmethod.key

// @property {String} key
// @property {String} thankyouurl
// @property {String} errorurl
// @property {String} giftcertificate.code Required only if it is a giftcertificate

//  */
