/**
 * The PDP (Product Details Page) component provides a number of ways to interact with the product details page, such as setting page options, changing quantities, and getting item information. 
 * 
 * Get an instance of this component by calling `container.getComponent("PDP")`.
 * @extends VisualComponent
 * @hideconstructor
 * @global
 */
class PDP extends VisualComponent {
  constructor () {
    super()

    /**
     * The name of the main PDP full view. Use this name to reference views in methods such as {@link addChildViews}, {@link addToViewContextDefinition}, and so on.
     * @type {String}
     */
    this.PDP_FULL_VIEW = 'ProductDetails.Full.View'

    /**
     * The name of the PDP quick view. Use this name to reference views in methods such as {@link addChildViews}, {@link addToViewContextDefinition}, and so on.
     * @type {String}
     */
    this.PDP_QUICK_VIEW = 'ProductDetails.QuickView.View'
  }

  /**
   * Gets all the subitems of a matrix item. `getAllMatrixChilds` returns an array of objects. Each object in the array is a subitem of the matrix item. 
   * 
   * The following example shows how to use the method and what a simplified version of an object in the array might look like. 
   * ```javascript
   * var pdp = container.getComponent("PDP");
   * var iteminfo = pdp.getAllMatrixChilds();
   * 
   * // Example of an object in the array returned by getAllMatrixChilds() 
   * [
   *   {
   *     "internalid": 7040,
   *     "isbackorderable": true,
   *     "isinstock": true,
   *     "itemid": "SHIRT-COT-S",
   *     "quantityavailable": 4,
   *     ...
   *   }
   * ]
   * ```
   * 
   * @return {Array<MatrixChild.ItemInfo>} Returns an array of all the subitems of a matrix item. If the item is not a matrix item, or it is a matrix item but it has no subitems, an empty array is returned. If the current view is not in the PDP component, it returns `null`.
   */
  getAllMatrixChilds () {
    return null
  }

  /**
   * Gets information about the item in the current product details page (PDP), which may include details such as the item quantity, shipping address, or fulfillment choice. Information may also include data from custom fields. The actual values returned will depend on how the item is configured in NetSuite. This method only works if the current view is a PDP.
   * 
   * The following example shows how to use this method and what a simplified version of the object returned might look like. 
   * ```javascript
   * var pdp = container.getComponent("PDP");
   * var iteminfo = pdp.getItemInfo();
   *
   * // Example of the object returned from getItemInfo()
   * {
   *   "item": {
   *     "displayname": "Cotton Shirt",
   *     "internalid": 7101,
   *     "isinstock": true,
   *     "quantityavailable": 8,
   *     ...
   *   },
   *   "options": [
   *     {
   *     "cartOptionId": "custcol14",
   *     "itemOptionId": "custitem30",
   *     "label": "Size",
   *     "values": [
   *       {
   *         "internalid": "2",
   *         "label": "Small"
   *       },
   *       {
   *         "internalid": "4",
   *         "label": "Medium"
   *       }
   *     ]
   *     }
   *   ],
   *   "quantity": "1"
   * }
   * ```
   * You can use dot notation to access the object properties. Here is an explanation of some of the properties from the example above: 
   * * item.internalid - The internal ID of the item in NetSuite.
   * * item.isinstock - Indicates if inventory is available.
   * * options.cartOptionId - The name of an option on the product details page. Use the value of this property as the first argument in `setOption()` when setting an option.
   * * options.values.internalid - The internal ID of the option value. Use the value of this property as the second argument in `setOption()` when setting an option.
   * * options.values.label - The label of the option as it appears on the product details page. 
   * @return {ItemInfo} Returns an ItemInfo object with information about the item. If the Store Pickup feature is enabled in the NetSuite account, it also returns item information related to store pickup, such as the quantity of items available for store pickup. If the current view is not in the PDP component, it returns `null`.
   */
  getItemInfo () {
    return null
  }

  /**
   * Gets the subitems of a matrix item according to the filters defined in `matrix_options`. If `matrix_options` is set but empty, this method returns all subitems of the matrix item. If `matrix_options` is null or undefined, this method returns the subitems of the current selection.
   * @param {MatrixOptionSelection} matrix_options The options by which to filter the subitems of the matrix item. If you omit `matrix_options', an array of all subitems is returned.
   * @return {Array<MatrixChild.ItemInfo>} Returns an array of all the subitems (of the matrix item) that match the `matrix_options` filters. If the current view is not in the PDP component, it returns `null`.
   */
  getSelectedMatrixChilds (matrix_options) {
    return null
  }

  /**
   * Sets an option of the current product details page. This method only works if the current view is a PDP.
   * 
   * You need to pass two arguments to this method:
   * * `cart_option_id` - The ID of the option you want to set. You can get a list of all possible `cart_option_id`s by calling getItemInfo() first. getItemInfo() returns an object that contains an `options` property, which contains an array with one object. Each object in the array corresponds to an option that can be set. Use the value of the `cartOptionId` property in the object as the `cart_option_id` argument in setOption(). 
   * * `value` - The value of the option you want to set. You can get a list of all possible option `value`s by calling getItemInfo() first. getItemInfo() returns an object that contains an `options` property, which contains an array with one object. The `values` property in the object contains an array of objects, each of which corresponds to an option value. Use the value of the `internalid` property in the object as the `value` argument in setOption().
   * 
   * In the following example, the size option of an item is set to medium. The size option is represented by the `cart_option_id` with the value `custcol14`. To set the size to medium, we pass '4', which is the `internalid` for the medium size of the item.
   * ```javascript
   * var pdp = container.getComponent('PDP');
   * var iteminfo = pdp.getItemInfo();
   * 
   * pdp.setOption('custcol14', '4');
   * ```
   * @param {String} cart_option_id The option identifier. You can get a list of option identifiers with {@link PDP#getItemInfo|getItemInfo()}.
   * @param {String} value The value of the option. Leave the `value` blank or provide an invalid value to clear the option.
   * @return {Deferred<Boolean>} Returns a Deferred object. If the promise is resolved, it indicates the operation was successful. If the promise is rejected, it returns an error.
   * @fires PDP#afterOptionSelection
   * @fires PDP#beforeOptionSelection
   */
  setOption (cart_option_id, value) {
    return null
  }

  /**
   * Updates the quantity of the item on the product details page. For example, if the quantity is currently 2 and you call `setQuantity(4)`, the quantity is changed to 4. This method only works if the current view is a PDP.
   * 
   * ```javascript
   * var pdp = container.getComponent('PDP');
   * var newquantity = 2;
   * 
   * pdp.on('beforeQuantityChange', function(event) {
   *   if (!_.isNumber(newquantity)) {
   *     alert('That is not a valid quantity.');
   *     return false;
   *   }
   * });
   * ```
   * @param {Number} quantity The quantity of the item to set. Quantity must be a positive integer (greater than zero).
   * @return {Deferred} Returns a Deferred object. If the promise is resolved, it indicates the operation was successful. If the promise is rejected, it returns an error.
   * @fires PDP#beforeQuantityChange
   * @fires PDP#afterQuantityChange
   */
  setQuantity (quantity) {
    return null
  }

  /**
   * Gets information about the inventory of the item, such as whether the item is in stock, the quantity in stock, and the in-stock and out-of-stock messages. If the item is an inventory item, it returns the available quantity of the item. If the item is a matrix item and subitems are filtered (with {@link PDP#getSelectedMatrixChilds|getSelectedMatrixChilds()}), it returns the sum of the available quantity of all the filtered subitems of the matrix item.
   * 
   * If the Store Pickup feature is enabled in the NetSuite account (see {@link https://system.netsuite.com/app/help/helpcenter.nl?fid=chapter_4793321418.html|Store Pickup}), this method also returns the quantity of inventory available for store pickup at each pickup location. The `stockPerLocation` property of the main object contains an array of objects, each of which contains the ID of the store pickup location and the quantity available.
   * 
   * ```javascript
   * 			var pdp = container.getComponent('PDP');
   * 
   * var stockinfo = pdp.getStockInfo();
   * var totalstock = stockinfo.stock;
   * var isinstock = stockinfo.isInStock;
   * ```
   * @return {Item.StockInfo} Returns a StockInfo object. If the current view is not in the PDP component, it returns `null`.
   */
  getStockInfo () { 
    return null
  }
}

// Events:

/**
 * Cancelable event triggered before an option is set. See {@link CancelableEvents}.
 * @event PDP#beforeOptionSelection
 * @property {String} optionCartId The selected option id
 * @property {String} value The selected option value
 */

/**
 * Event triggered after an option is set.
 * @event PDP#afterOptionSelection
 * @property {String} optionCartId The selected option id
 * @property {String} value the selected option value
 */

/**
 * Cancelable event triggered before the quantity is changed. See {@link CancelableEvents}.
 * @event PDP#beforeQuantityChange
 * @type {number}
 */

/**
 * Event triggered after the quantity is changed.
 * @event PDP#afterQuantityChange
 * @type {number}
 */

/**
 * Cancelable event triggered before the main image displayed on the product details page is changed. See {@link CancelableEvents}.
 * @event PDP#beforeImageChange
 * @property {number} currentIndex
 * @property {number} nextIndex
 */

/**
 * Event triggered after the main image displayed on the product details page is changed.
 * @event PDP#afterImageChange
 * @type {undefined}
 */

// Data types:

/**
 * Representation of the data objects used to send a transaction line representation to the back-end without sending all the heavy weight JSON that is not totally needed by the back-end
 * @typedef {Object} ItemInfo
 *
 * @property {String} internalid
 * @property {Number} [quantity]
 * @property {Array<Object>} [options]
 * @property {Number} [splitquantity]
 * @property {Number} [shipaddress]
 * @property {Number} [shipmethod]
 * @property {Number} [location]
 * @property {String} [fulfillmentChoice]
 * @property {*} [item]
 * @property {String} [item.internalid]
 * @property {String} [item.type]
 * @property {String} [item.onlinecustomerprice_detail]
 */

/**
 * @typedef {Object} MatrixOptionSelection
 *
 * @property {String} custom_item_option
 * @property {String|Number} custom_item_option_value
 */

/**
 * @typedef {Object} MatrixChild.ItemInfo
 *
 * @property {String} internalid
 * @property {String} custom_item_option??
 * @property {boolean} isbackorderable
 * @property {boolean} isinstock
 * @property {boolean} ispurchasable
 * @property {boolean} isstorepickupallowed
 * @property {String} itemid
 * @property {String} itemtype
 * @property {String} itemtype
 * @property {Array} options
 * @property {String} outofstockbehavior
 * @property {String} outofstockmessage
 * @property {Number} quantityavailable
 * @property {Location} quantityavailableforstorepickup_detail
 * @property {boolean} showoutofstockmessage
 * @property {String} stockdescription

 * @property {object} keyMapping_attributesRating
 * @property {array} keyMapping_attributesToRateOn
 * @property {Breadcrumb} [keyMapping_breadcrumb]
 * @property {Number} keyMapping_comparePriceAgainst
 * @property {String} keyMapping_comparePriceAgainstFormated
 * @property {String} keyMapping_correlatedItemsDetail
 * @property {String} keyMapping_id
 * @property {Image} [keyMapping_images]
 * @property {String} keyMapping_inStockMessage
 * @property {String} keyMapping_isBackorderable
 * @property {String} keyMapping_isInStock
 * @property {String} keyMapping_isPurchasable
 * @property {boolean} keyMapping_isReturnable
 * @property {boolean} keyMapping_isfulfillable
 * @property {boolean} keyMapping_isstorepickupallowed
 * @property {String} keyMapping_itemType
 * @property {String} keyMapping_keywords
 * @property {String} keyMapping_matrixChilds
 * @property {String} keyMapping_matrixParent
 * @property {String} keyMapping_metaTags
 * @property {Number} keyMapping_minimumQuantity
 * @property {String} keyMapping_name
 * @property {String} keyMapping_optionsDetails
 * @property {String} keyMapping_outOfStockMessage
 * @property {String} [keyMapping_pageHeader]
 * @property {String} [keyMapping_pageTitle]
 * @property {Number} keyMapping_price
 * @property {String} keyMapping_priceDetails
 * @property {String} keyMapping_price_formatted
 * @property {StorePickUpDetail} [keyMapping_quantityavailableforstorepickup_detail]
 * @property {Number} keyMapping_rating
 * @property {Number} keyMapping_ratingsCount
 * @property {object} keyMapping_ratingsCountsByRate
 * @property {String} keyMapping_relatedItems
 * @property {String} keyMapping_relatedItemsDetail
 * @property {boolean} keyMapping_showInStockMessage
 * @property {String} keyMapping_showOutOfStockMessage
 * @property {boolean} keyMapping_showQuantityAvailable
 * @property {boolean} keyMapping_showStockDescription
 * @property {String} keyMapping_sku
 * @property {String} keyMapping_stock
 * @property {String} keyMapping_stockDescription
 * @property {String} keyMapping_stockDescriptionClass
 * @property {*} keyMapping_thumbnail

 * @property {String} [keyMapping_thumbnail.url]
 * @property {String} [keyMapping_thumbnail.altimagetext]

 * @property {String} keyMapping_url
 * @property {*} onlinecustomerprice_detail

 * @property {String} [onlinecustomerprice_detail.onlinecustomerprice_formatted]
 * @property {Number} [onlinecustomerprice_detail.onlinecustomerprice]
 */

/**
 * @typedef {Object} Breadcrumb
 *
 * @property {String} href
 * @property {String} text
 */

/**
 * @typedef {Object} Image
 *
 * @property {String} altimagetext
 * @property {String} url
 */

/**
 * @typedef {Object} StorePickUpDetail
 *
 * @property {Number} internalid
 * @property {Number} qtyavailableforstorepickup
 */

/**
 * @typedef {Object} Item.StockInfo
 * @property {Number} stock
 * @property {String} inStockMessage
 * @property {boolean} isAvailableForPickup
 * @property {boolean} isInStock
 * @property {boolean} isNotAvailableInStore
 * @property {String} outOfStockMessage
 * @property {boolean} showInStockMessage
 * @property {boolean} showQuantityAvailable
 * @property {boolean} showStockDescription
 * @property {String} stockDescription
 * @property {String} stockDescriptionClass
 * @property {StorePickUpDetail} [stockPerLocation]
 */
