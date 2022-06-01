/**
 * The Search component enables you to retrieve the URL of the item search API of the SuiteCommerce website. See the {@link https://system.netsuite.com/app/help/helpcenter.nl?fid=chapter_N2665337.html|Item Search API} topic in the Help Center for more information about this API.
 * 
 * Get an instance of this component by calling `container.getComponent("Search")`.
 * 
 * @since SuiteCommerce 21.1
 */
class Search {

    /**
     * Retrieves the URL of the item search API of the SuiteCommerce website. Note that this method only retrieves the item search API URL; it does not execute the search.
     * 
     * You can append parameters to the returned URL by passing in an object of property/value pairs to the method. The property name can be any parameter accepted by the item search API. For example, to specify a list of fields, use the property name 'fields' with the field names as a comma separated list of fields: `{fields: "dimensions,finish"}`. For comprehensive information about item search parameters, see the {@link https://system.netsuite.com/app/help/helpcenter.nl?fid=section_N2665676.html|Item Search API Input Parameters} topic in the Help Center.
     * 
     * You can also append a special property called `apiMasterOptions`, which lets you use search API fieldsets as defined on the SuiteCommerce configuration page in the NetSuite account. The value of `apiMasterOptions` is the ID of a search API fieldset. When `getUrl` is called, it gets the values of the **Fieldset** and **Includes** columns for the specified ID and appends them to the URL in the format _fieldset=[Fieldset]&include=[Includes]_. See {@link https://system.netsuite.com/app/help/helpcenter.nl?fid=bridgehead_4667044776.html|Search Results Subtab} in the Help Center for more information.
     * 
     * If you include both `apiMasterOptions` and the property name 'fieldset' as parameters, the `apiMasterOptions` parameters takes preference and sets the value of 'fieldset' in the returned URL. 
     * 
     * The following example shows how to get the item search URL with search parameters for a keyword (`q`), additional fields (`fieldset`), and a facet field name (`dimensions`). The returned URL includes the specified parameters and might look like the following:
     * 
     * `/api/items?language=en&country=US&currency=USD&pricelevel=5&use_pcv=F&q=frames&fieldset=relateditems&dimensions=52x30`
     * 
     * ```javascript
     *          var search = container.getComponent("Search");
     * var searchParams = {
     *  q: "frames", 
     *  fieldset: "relateditems", 
     *  dimensions: "52x30"
     * };
     * 
     * var searchUrl = search.getUrl(searchParams);
     * ```
     * &nbsp;
     * 
     * The following example shows how to get the item search URL with search parameters for a keyword (`q`), additional fields (`fieldset`), and a facet field name (`dimensions`). We have also included the `apiMasterOptions` parameter, which will take preference over the `fieldset` parameter. The returned URL might look like the following:
     * 
     * `/api/items?language=en&country=US&currency=USD&pricelevel=5&use_pcv=F&q=frames&dimensions=52x30&fieldset=details&includes=facets`
     * 
     * ```javascript
     *          var search = container.getComponent("Search");
     * var searchParams = {
     *  q: "frames", 
     *  fieldset: "relateditems", 
     *  dimensions: "52x30", 
     *  apiMasterOptions: "itemDetails"
     * };
     * 
     * var searchUrl = search.getUrl(searchParams);
     * ```
     * &nbsp;
     * 
     * Some parameters, which correspond to data from the user session such as the language and country, may be automatically appended to the URL. `language`, `country`, `currency`, `pricelevel`, and `use_pcv` from the two sample URLs above are examples of user session data. 
     * 
     * @since SuiteCommerce 21.1
     * @param {Object} [search_filters] One or more filters to append to the item search URL.
     * @param {Boolean|Number|String} [search_filters.*] The name of any valid search API input parameter.
     * @param {String} [search_filters.apiMasterOptions] The ID of a search API fieldset.
     * @returns {String} Returns the item search API URL of the SuiteCommerce website. The domain name of the website is not included in the returned URL.
     */
    getUrl(search_filters) {
        return null;
    }
}

// DATA TYPE DEFINITIONS
// ---------------------

/*
 * THIS DATA TYPE DEFINITION IS DOCUMENTED IN THE getUrl() METHOD.
 *
 * A filter to apply when getting the search API URL.
 * 
 * @typedef {Object} searchFilter
 * @property {Boolean|Number|String} [*] Any valid search API input parameter. 
 * @property {String} [apiMasterOptions] The ID of a search API fieldset.
 */