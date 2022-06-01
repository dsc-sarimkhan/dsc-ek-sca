/**
 * The PLP (Product List Page) component provides ways to work with the product list page, for example, by setting display options, pagination, filters, and sorting. Some methods will only work when the current view is the search page.
 *
 * Get an instance of this component by calling `container.getComponent("PLP")`.
 * @extends VisualComponent
 * @hideconstructor
 * @global
 */
class PLP extends VisualComponent {

    constructor() {
        super()
		/**
		 * The name of the main view of the PLP component. Use this to refer to the view in methods such as {@link addChildViews}, {@link addToViewContextDefinition}, and so on.
		 * @type {String}
		 */
        this.PLP_VIEW = 'Facets.Browse.View';
    }

    /**
     * Gets information about all display options, including the current display option. This method works only when the current view is the search page.
     * 
     * ```javascript
     *      var plp = container.getComponent("PLP");
     * var allDisplayOptions = plp.getAllDisplay();
     * console.log(allDisplayOptions);
     * ```
     * Example of the array of Display objects returned by this method:
     * ```javascript
     *      [
     *  {
     *      columns: 1,
     *      icon: "icon-display-list",
     *      id: "list",
     *      isDefault: false,
     *      name: "List",
     *      template: "facets_item_cell_list.tpl"
     *  },
     *  {
     *      columns: 2,
     *      icon: "icon-display-table",
     *      id: "table",
     *      isDefault: false,
     *      name: "Table",
     *      template: "facets_item_cell_table.tpl"
     *  } 
     *  {
     *      active: true,
     *      columns: 4,
     *      icon: "icon-display-grid",
     *      id: "grid",
     *      isDefault: true,
     *      name: "Grid",
     *      template: "facets_item_cell_grid.tpl"
     *  } 
     * ]
     * ```
     * 
     * @return {Array<Display>} Returns all the display options of the current search page. The object that corresponds to the current display option on the page has an additional property `active`, which is set to `true`.
     */
    getAllDisplay() {
        return null;
    }

    /**
     * Gets information about all filters that can be applied on the search page. One or more of the filters may be active. This method works only when the current view is the search page.
     * 
     * ```javascript
     * var plp = container.getComponent('PLP');
     * plp.getAllFilters();
     * 
     * // Example of the array of objects returned by getAllFilters();
     * [
     *   {
     *     id: "custitem30",
     *     url: "custitem30",
     *     values: [
     *       {
     *         displayName: "Small",
     *         isActive: false,
     *         isImageTile: false,
     *         label: "Small",
     *         link: "/custitem30/Small"
     *       },
     *       {
     *         displayName: "Medium",
     *         isActive: true,
     *         isImageTile: false,
     *         label: "Medium",
     *         link: "/custitem30/Medium"
     *       }
     *     ] 
     *   },
     *   {
     *     id: "custitem40",
     *     url: "custitem40",
     *     values: [
     *       {
     *         displayName: "Accessories",
     *         isActive: false,
     *         isImageTile: false,
     *         label: "Accessories",
     *         link: "/custitem30/Medium/custitem40/Accessories"
     *       },
     *       {
     *         displayName: "Outerwear",
     *         isActive: false,
     *         isImageTile: false,
     *         label: "Accessories",
     *         link: "/custitem30/Medium/custitem40/Outerwear"
     *       }
     *     ]
     *   }
     * ]
     * ```
     * @return {Array<Filter>} Returns an array of Filter objects. Each Filter object contains a set of properties, including the following:
     * * `id` - The filter ID. Use this when setting filters on the page with {@link PLP#setFilters|setFilters}.
     * * `url` - 
     * * `values` - An array of objects, each of which represents a possible value for the filter. Use the `label` property of the object when setting filters on the page with {@link PLP#setFilters|setFilters}.
     */
    getAllFilters() {
        return null;
    }

    /**
     * Gets all page size settings of the current page. This method works only when the current view is the search page.
     * 
     * ```javascript
     * var plp = container.getComponent('PLP');
     * plp.getAllPageSize();
     * 
     * // Example of the array of objects returned with getAllPageSize()
     * [
     *   {
     *     id: "12",
     *     isDefault: true,
     *     items: 12,
     *     name: "$(0) per page"
     *   },
     *   {
     *     active: true,
     *     id: "24",
     *     isDefault: true,
     *     items: 24,
     *     name: "$(0) per page"
     *   },
     *   ...
     * ]
     * ```
     * @return {Array<PageSize>} Returns an array of PageSize objects, one of which has an additional property called 'active' (with the value `true`) that corresponds to the current page size setting. 
     */
    getAllPageSize() {
        return null
    }

    /**
     * Gets information about all sorting options on the page. This method works only when the current view is the search page, otherwise it returns undefined. To get the current sorting option on the page, use {@link PLP#getSorting|getSorting}.
     * 
     * ```javascript
     *      var plp = container.getComponent('PLP');
     * plp.getAllSorting();
     * 
     * // Example of the array of objects returned with getAllSorting()
     * [
     *   {
     *     active: true,
     *     id: relevance:desc,
     *     name: Relevance,
     *     isDefault: true
     *   },
     *   {
     *     id: onlinecustomerprice:asc", 
     *     name: "Price, low to high", 
     *     isDefault: false
     *   }
     * ]
     * 
     * ```
     * 
     * @return {Array<Sorting>} Returns an array of Sorting objects, one of which has an additional property called 'active' (with the value `true`) that corresponds to the current sorting option on the page.  
     */
    getAllSorting() {
        return null
    }

    /**
     * Gets information about the current category, including the parent URL, any sibling categories, and any child categories. This method works only when the view is a category page.
     * 
     * Commerce categories enable you to organize items in a hierarchical structure called a catalog. Items are then displayed on your SuiteCommerce website using the same hierarchichal structure. See {@link https://system.netsuite.com/app/help/helpcenter.nl?fid=chapter_4673202005.html|Commerce Categories} for more information about setting up commerce categories in NetSuite.
     * 
     * ```javascript
     * var plp = container.getComponent('PLP');
     * var categoryinfo = plp.getCategoryInfo();
     * 
     * var categoryname = categoryinfo.name;
     * var categorypage = categoryinfo.fullurl;
     * 
     * if (categroypage.indexOf("sports") >= 0) {
     *   alert("Special offer on all sports clothes and equipment until the end of the month!");
     * }
     * 
     * // Example of the object returned by getCategoryInfo()
     * {
     *   addtohead: "",
     *   breadcrumb: Array [],
     *   categories: [
     *     {
     *       name: "Climbing", 
     *       internalid: "37",
     *       sequencenumber: "0",
     *       ...
     *     },
     *     {
     *       name: "Ski", 
     *       internalid: "38", 
     *       sequencenumber: "1",
     *       ...
     *     }
     *   ],
     *   description: "",
     *   fullurl: "/sports",
     *   internalid: "35",
     *   name: "Sports Clothes and Equipment",
     *   pagetitle: "Sports Clothes and Equipment",
     *   parenturl: "",
     *   ...
     * }
     * ```
     * @return {Object} Returns a CategoryInfo object if the current view is category page. If the view is not a category page, it returns undefined. The CategoryInfo object includes the following properties:
     * * `categories` - An array of child categories of the current category. Each child category is an object with its own set of properties, such as `description`, `fullurl`, `internalid`, and `name`.
     * * `description` - The description of the category.
     * * `internalid` - The internal ID of the commerce category record in NetSuite.
     * * `fullurl` - The full URL of the category. In NetSuite, the full URL of a commerce category is the path part of the URL after the domain name.
     * * `name` - The name of the category.
     * * `pagetitle` - The title of the page.
     * * `parenturl` - The full url of the parent category (if the current category has a parent category).
     */
    getCategoryInfo() {
    	return null;
    }

    /**
     * Gets information about the current display options, such as the number of columns displayed, the display option ID, and the display option name. This method works only when the current view is the search page. 
     * 
     * ```javascript
     * var plp = container.getComponent('PLP');
     * plp.getDisplay();
     * 
     * // Example of the object returned by getDisplay()
     * {
     *   columns: 2,
     *   icon: "icon-display-table",
     *   id: "table",
     *   isDefault: false,
     *   name: "Table",
     *   template: "facets_item_cell_table.tpl"
     * }
     * ```  
     * 
     * @return {Display} Returns a Display object, which may contain the following properties:
     * * `columns` - The number of columns used to display products on the page. For example, the 'table' layout displays two columns, whereas the 'grid' layout displays four columns.
     * * `icon` - The Sass class of the image.
     * * `id` - The identifier of the display option. Use the value of this property when setting the display option with {@link PLP#setDisplay|setDisplay}.
     * * `isDefault` - Indicates whether the display option is the default display option.
     * * `name` - The name of the display option as shown on the page.
     * * `template` - The template used to render the layout of the display option.
     */
    getDisplay() {
        return null
    }

    /**
     * Gets information about the filters currently applied on the search page. This method works only when the current view is the search page. On the initial page load of the product list page, this method returns an empty array (no filters are set).
     * 
     * ```javascript
     *      var plp = container.getComponent('PLP');
     * plp.getFilters();
     * 
     * // Example of the array of objects returned by getFilters();
     * [
     *   {
     *     config: {},
     *     id: "custitem30",
     *     isParameter: false,
     *     url: "custitem30",
     *     value: [
     *       "Small"
     *     ] 
     *   },
     *   {
     *     config: {},
     *     id: "custitem40",
     *     isParameter: false,
     *     url: "custitem40",
     *     value: [
     *       "Sportswear"
     *     ] 
     *   }
     * ]
     * ```
     * @return {Array<Filter>} Returns an array of Filter objects. If no filters are set, it returns an empty array. 
     */
    getFilters() {
        return null;
    }

    /**
     * Gets information about all items currently displayed on the product list page.
     * 
     * ```javascript
     *      var plp = container.getComponent('PLP');
     * plp.getItemsInfo();
     * 
     * // Example of the array of objects returned by getItemsInfo():
     * [
     *   {
     *     displayname: "Casual Striped Shirt",
     *     internalid: 8034,
     *     isinstock: true,
     *     itemid: OM5235,
     *     onlinecustomerprice: 38.99
     *     quantityavailable: 6,
     *     ...
     *   },
     *   {
     *     displayname: "Casual Chequered Shirt",
     *     internalid: 8109,
     *     isinstock: true,
     *     itemid: OM5337,
     *     onlinecustomerprice: 29.99
     *     quantityavailable: 3,
     *     ...
     *   }
     * ]
     * ```
     * @return {Array<SearchItemInfo>} Returns an array of objects, each of which corresponds to an item on the product list page. If there are no items on the product list page, it returns an empty array.
     */
    getItemsInfo() {
        return null;
    }

    /**
     * Gets the page size setting of the current page. The page size setting determines the maximum number of items to display per page, for example, 12, 24, or 48. It does not get the number of items currently displayed on the page - use {@link PLP#getPagination|getPagination()} for that. This method works only when the current view is the search page.
     * 
     * ```javascript
     *      var plp = container.getComponent('PLP');
     * plp.getPageSize();
     * 
     * // Example of the object returned by getPageSize():
     * {
     *   id: "24",
     *   isDefault: true,
     *   items: 24,
     *   name: "$(0) per page"
     * }
     * ```
     * @return {PageSize} Returns a PageSize object, which contains the following properties.
     * * `id` - The identifier of the page size setting. Use the value of `id` when setting the page size setting - see {@link PLP#setPageSize|setPageSize()}.
     * * `isDefault` - Indicates if the page size setting is the default setting.
     * * `items` - The number of items to display per page.
     * * `name` - The name of the page size setting as shown on the page.
     */
    getPageSize() {
        return null
    }

    /**
     * Gets information about the pagination applied in the product list page. Use only after the search page has rendered (by subscribing to the afterShowContent event).
     * 
     * ```javascript
     *      var plp = container.getComponent('PLP');
     * plp.on("afterShowContent", function() {
     *     var pagination = plp.getPagination();
     * });
     * 
     * // Example of the object returned with getPagination()
     * {
     *   "currentPage": 1,
     *   "display": "grid",
     *   "itemCount": 140,
     *   "pageCount": 6,
     *   "pageSize": 24,
     *   "searchText": "shirt",
     *   "sorting": "relevance:desc"
     * }
     * ```
     * @return {Pagination}
     */
    getPagination() {
        return null;
    }

    /**
     * Gets the search text entered by the visitor on the search page. This method works only when the current view is the search page.
     * 
     * ```javascript
     *      var plp = container.getComponent('PLP');
     * plp.getSearchText();
     * ```
     * @return {String|null} Returns the search text entered on the search page. If no text was entered, it returns an empty string.
     */
    getSearchText() {
        return null;
    }

    /**
     * Gets information about the current sorting options. This method works only when the current view is the search page.
     * 
     * ```javascript
     *      var plp = container.getComponent('PLP');
     * plp.getSorting(); 
     *  
     * // Example of the object returned with getSorting()
     * {
     *   "id": "relevance:desc",
     *   "isDefault": false,
     *   "name": "Relevance"
     * }
     * ```
     * @return {Sorting} Returns a Sorting object, or null if the current page is not the search page.
     */
    getSorting() {
        return null;
    }

    /**
     * Gets the Item Search API URL with the current filters and settings of the search page, such as the page size setting (see {@link PLP#getPageSize|getPageSize()}) or the display options (see {@link PLP#getDisplay|getDisplay()}). To ensure the URL is correctly formed and uses the current filters, sorting, and pagination, pass a Pagination object as an argument to `getUrl()`.
     * 
     * ```javascript
     *      var plp = container.getComponent('PLP');
     * var itemsearchurl = plp.getUrl(plp.getPagination);
     * 
     * // Example of string returned by getUrl() without a Pagination object.
     * "/api/items?c=1010101&country=US&currency=USD&fieldset=search&include=facets&language=en&limit=24&n=2&offset=0&pricelevel=5&q=&sort=relevance%3Adesc"
     * 
     * // Example of string returned by getUrl() with a Pagination object as an argument.
     * "/api/items?c=1010101&country=US&currency=USD&fieldset=search&include=facets&language=en&limit=12&n=2&offset=0&pricelevel5.from=20.00&pricelevel5.to=30.00&pricelevel=5&q=&sort=relevance%3Adesc"
     * ```
     * 
     * See {@link https://system.netsuite.com/app/help/helpcenter.nl?fid=chapter_n2665337.html|Item Search API} for more information about the item search API.
     * @param {Pagination} Pagination 
     * @return {String} Returns the item search API URL as a string. 
     */
    getURL(Pagination) {
    	return null;
    }

    /**
     * Navigates to the specified page in the result set. This method works only when the current view is the search page. Pages use a one-based index; the first page is "1". The page to navigate to must be less than or equal to the total number of pages. Use {@link PLP#getPagination|getPagination} to get the total number of pages.
     * 
     * ```javascript
     *      var plp = container.getComponent('PLP');
     * plp.setCurrentPage({currentPage: 2}).then(function() {
     *   alert("Success");
     *   }, function() {
     *      alert("Fail");
     *      });
     * ```
     * 
     * @param {number} page The page in the result set you want to navigate to. `page` must be greater than or equal to one, and less than or equal to the total page count. See {@link PLP#getPagination|getPagination()}.
     * @return {Deferred} Returns a Deferred object. If navigation to the page could not be completed, the promise is rejected. If navigation to the page was successful, the promise is resolved.
     */
    setCurrentPage(page) {
        return null;
    }

    /**
     * Lets you set the display option of the product list page and updates the display if the display option is valid. This method works only when the current view is the search page.
     * 
     * ```javascript
     *      var plp = container.getComponent("PLP");
     * plp.setDisplay({display: "list"});
     * ```
     * 
     * @param {Object} options The display option to set for the page. `options` is an object with a single property `display`. The value of `display` is the internal identifier of the display option. Display options can be configured on the SuiteCommerce Configuration page in your NetSuite account. See {@link https://system.netsuite.com/app/help/helpcenter.nl?fid=bridgehead_4667040161.html|Result Display Options Subtab} for more information about display options.
     * @return {Deferred} Returns a Deferred object. If the promise is resolved, but the current page is not the search page or an error occurs, it returns false. If the promise is rejected (for example, when an invalid display option is specified), it returns an error message.
     */
    setDisplay(options) {
        return null;
    }

    /**
     * Sets the filters on the product list page.
     * @param {Array<Filter>} filters An object with one property called `filters`.
     * @return {Deferred} Returns a Deferred object. If the promise is resolved, but the current page is not the search page or an error occurs, it returns false.
     */
    setFilters(filters) {
        return null;
    }

    /**
     * Sets the page size setting of the page. This method works only when the current view is the search page.
     * 
     * ```javascript 
     *      var plp = container.getComponent('PLP');
     * plp.setPageSize({pageSize: "12"});
     * ```
     * @param {Object} options An object with one property `pageSize`. The value of `pageSize` must be a valid page size setting ID. Use {@link PLP#getAllPageSize|getAllPageSize} to get a list of all page size settings.
     * @return {Deferred} Returns a Deferred object.  If the promise is resolved, but the current page is not the search page or an error occurs, it returns false.
     */
    setPageSize(options) {
        return null
    }

    /**
     * Sets the search text and performs the search on the current search page.
     * 
     * ```javascript
     *      var plp = container.getComponent('PLP');
     * plp.setSearchText({searchText: "shirt"});
     * ```
     * @param {{searchText: String}} options An object with one property called `searchText`. Its value is the search string. If the object is empty, all products are returned in the search.
     * @return {Deferred} Returns a Deferred object. If the promise is resolved, but the current page is not the search page or an error occurs, it returns false.
     */
    setSearchText(options) {
        return null;
    }

    /**
     * Sets the sorting options of the current search page. This method works only when the current view is the search page. If the sorting option was applied successfully, the product list is updated on the page.
     * 
     *  ```javascript
     *      var plp = container.getComponent('PLP');
     * plp.setSorting({sorting: "onlinecustomerprice:asc"});
     * ```
     * 
     * @param {Sorting} sorting An object with one property `sorting`. The value must be a valid sorting option on the page - use {@link PLP#getAllSorting|getAllSorting} to get a list of all available sorting options and then use the value of the `id` property as the value of `sorting`.
     * @return {Deferred} Returns a Deferred object. If the promise is resolved, but the current page is not the search page or an error occurs, it returns false.
     */
    setSorting(sorting) {
        return null
    }

}


/**
 * @typedef {Object} Filter
 * @property {String} id
 * @property {String} url
 * @property {String} value
 * @property {Boolean} active
 * @property  {Object} config
 * @property {String} config.id
 * @property {String} config.name
 * @property {String} config.url
 * @property {String} config.behavior
 * @property {Number} config.max
 * @property {String} config.titleToken
 */


/**
 * @typedef {Object} PageSize
 * @property {Number} items
 * @property {String} name
 * @property {Boolean} isDefault
 * @property {String} id
 * @property {Boolean} active
 */


/**
 * @typedef {Object} Display
 * @property {String} id
 * @property {String} name
 * @property {String} template
 * @property {Number} columns
 * @property {String} icon
 * @property {Boolean} isDefault
 * @property {Boolean} active
 */


/**
 * @typedef {Object} Sorting
 * @property {String} id
 * @property {String} name
 * @property {Boolean} isDefault
 * @property {Boolean} [active]
 */

/**
 * @typedef  {Object} Pagination
 * @property {Number} currentPage
 * @property {Number} pageCount
 * @property {Number} itemCount
 * @property {Number} pageSize
 * @property {String} sorting
 * @property {String} display
 * @property {Object} filters
 * @property {String} searchText
 */








/**
 * @typedef  {Object} SearchItemInfo
 * @property {Boolean} [isinstock]
 * @property {Number} [onlinecustomerprice]
 * @property {matrixchilditems_detail[]} [matrixchilditems_detail]
 * @property {String} [itemid]
 * @property {Boolean} [ispurchasable]
 * @property {String} [onlinecustomerprice_formatted]
 * @property {String} [stockdescription]
 * @property {Boolean} [isbackorderable]
 * @property {Object} [itemimages_detail]
 * @property {onlinecustomerprice_detail} [onlinecustomerprice_detail]
 * @property {String} [custitem_automation_item_field_001]
 * @property {String} [onlinematrixpricerange]
 * @property {Number} [internalid]
 * @property {Boolean} [showoutofstockmessage]
 * @property {String} [outofstockbehavior]
 * @property {String} [custitem_automation_item_field_002]
 * @property {itemoptions_detail} [itemoptions_detail]
 * @property {String} [outofstockmessage]
 * @property {String} [displayname]
 * @property {String} [storedisplayname2]
 * @property {String} [storedescription]
 * @property {String} [urlcomponent]
 * @property {SearchItemInfo_options[]} [options]
 */
/**
 * @typedef  {Object} matrixchilditems_detail
 * @property {Boolean} [isinstock]
 * @property {String} [itemid]
 * @property {Boolean} [ispurchasable]
 * @property {String} [stockdescription]
 * @property {Boolean} [isbackorderable]
 * @property {onlinecustomerprice_detail} [onlinecustomerprice_detail]
 * @property {Number} [internalid]
 * @property {Boolean} [showoutofstockmessage]
 * @property {String} [outofstockbehavior]
 * @property {String} [itemtype]
 * @property {String} [outofstockmessage]
 */
/**
 * @typedef  {Object} onlinecustomerprice_detail
 * @property {String} [onlinecustomerprice_formatted]
 * @property {Number} [onlinecustomerprice]
 */
/**
 * @typedef  {Object} itemimages_detail
 * @property {itemimages_detail_urls[]} [urls]
 */
/**
 * @typedef  {Object} itemimages_detail_urls
 * @property {String} [altimagetext]
 * @property {String} [url]
 */
/**
 * @typedef  {Object} itemoptions_detail
 * @property {String} matrixtype
 * @property {itemoptions_detail_fields[]} fields
 */
/**
 * @typedef  {Object} itemoptions_detail_fields
 * @property {Boolean} [ismandatory]
 * @property {String} [internalid]
 * @property {Boolean} [ismatrixdimension]
 * @property {itemoptions_detail_fields_values[]} [values]
 * @property {String} [label]
 * @property {String} [type]
 * @property {String} [sourcefrom]
 */
/**
 * @typedef  {Object} itemoptions_detail_fields_values
 * @property {String} [label]
 * @property {Boolean} [isAvailable]
 * @property {String} [url]
 */
/**
 * @typedef  {Object} SearchItemInfo_options
 * @property {String} label
 * @property {SearchItemInfo_options_values[]} values
 * @property {String} type
 * @property {String} cartOptionId
 * @property {String} itemOptionId
 * @property {Boolean} isMatrixDimension
 * @property {Boolean} isMandatory
 * @property {String} urlParameterName
 * @property {Boolean} useLabelsOnUrl
 * @property {Number} index
 */
/**
 * @typedef  {Object} SearchItemInfo_options_values instance
 * @property {String} label
 * @property {Boolean} isAvailable
 * @property {String} url
 */

