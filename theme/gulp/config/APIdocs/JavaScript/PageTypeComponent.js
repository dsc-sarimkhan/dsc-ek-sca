/**
 * The PageType component has two main purposes. It lets you:
 * * Register page types in NetSuite.
 * * Register page templates with page types. 
 * 
 * After page types and page templates are registered in an extension, they become available in Site Management Tools (SMT). See {@link https://system.netsuite.com/app/help/helpcenter.nl?fid=book_4080362047.html|Site Management Tools} in the NetSuite Help Center for more information.
 * 
 * *Note:* The PageType component registers page types in an extension. It does not let you *create* page type records in NetSuite. To create page type records, you can either specify the page types in the extension manifest, or log in to NetSuite and create the page type records. For more information about the editing the manifest file, see the {@link https://system.netsuite.com/app/help/helpcenter.nl?fid=section_1511302363.html|Extension Manifest} help topic in the NetSuite Help Center.
 * 
 * Get an instance of this component by calling `container.getComponent("PageType")`.
 * 
 * @extends BaseComponent
 * @since SuiteCommerce 2019.1
 */
class PageType {

    /**
     * Register a page type in NetSuite. A page type is a SuiteCommerce website page with a set of unique attributes, designed for content of a particular type. For example, if you wanted to show delivery dates for orders, you might create a page type that can display a calendar. See the {@link https://system.netsuite.com/app/help/helpcenter.nl?fid=subsect_1547242730.html|Register a Page Type} help topic in the NetSuite Help Center for more information about page types.
     * 
     * In the following example, we register a page type that shows a page with a calendar. In the PageTypeData object, we specify the name of the CMS page type record in NetSuite; in this case 'pagetype_calendar'. The `view` property references a view called 'CalendarPageView'. Views for page types are based on {@link PageTypeBaseView}. The `options` property lets us pass data to the view, in this case, a Backbone collection that contains a list of order delivery dates. The `defaultTemplate` property lets us associate a default template with the page type. 
     * 
     * Note that the `thumbnail` property must point to an absolute URL. If the image is in the NetSuite file cabinet, you can use utility functions to get the absolute URL of the file. 
     * 
     * ```javascript
     *      var pageTypeComponent = container.getComponent("PageType");
     * var availableDeliveryDates = new Backbone.Collection;
     * // ... do additional work with the collection
     *  
     * var pageType = {
     *     name: 'pagetype_calendar',
     *     view: CalendarPageView,
     *     options: {collection: availableDeliveryDates},
     *     defaultTemplate: {
     *         name: 'pagetype_calendar.tpl',
     *         displayName: 'Calendar Page',
     *         thumbnail: 'https://example.com/assets/imgs/calendar_page.png'
     *     }
     * }
     * 
     * pageTypeComponent.registerPageType(pageType);
     * ```
     * 
     * @param {PageTypeData} PageType The page type you want to register.
     */
    registerPageType(PageType) {
        return null;
    }

    /**
     * Register a template with a page type in NetSuite. A page template is a layout that can be applied to a page type. An extension can register a template for multiple page types at the same time. All page types must already exist as CMS page type records in NetSuite. 
     * 
     * In the following example, a page template is registered with two page types ('calendar-page' and 'quoteslist'), specified as an array in the `pageTypes` property of the object passed to the `registerTemplate()` method. 
     * ```javascript
     *      var pageTypeComponent = container.getComponent("PageType");
     *  var pageTemplate = {
     *      pageTypes: ['calendar-page', 'quoteslist'],
     *      template: {
     *          name: 'page_type_calendar_page_workweek.tpl',
     *          displayName: 'Calendar Page - Work Week',
     *          thumbnail: 'https://example.com/assets/imgs/calendar_page_workweek.png'
     *      }
     *  }
     *  pageTypeComponent.registerTemplate(pageTemplate);
     *  ```
     * 
     * @param {PageTemplate} PageTemplate The page template to register with one or more page types.
     */
    registerTemplate(PageTemplate) {
        return null;
    }
}

// DATA TYPE DEFINITIONS
// ---------------------

/**
 * @typedef {Object} PageTypeData A page type to register.
 * @property {String} name The name of the page type. `name` must the same as the name of the CMS page type record in NetSuite, or the name of the page type as specified in the extension manifest.
 * @property {Object} options Options to make available in the view. `options` is an object that may contain any number of properties you want to pass to the view. Note that a number of properties are added to the object at runtime. If you add any of the following properties in your extension code, they will be overwritten:
 * * *container*
 * * *pageInfo*
 * * *routerArguments*
 * @property {PageTypeBaseView} view A constructor function that creates an instance of a {@link PageTypeBaseView} view class.
 * @property {Object} defaultTemplate Specifies the defaut page template to use for the page type. `defaultTemplate` is an object with the following properties:
 * * *name* - The template file name. 
 * * *displayName* - The name of the page template as it will appear in the list of available layouts in Site Management Tools (SMT) in NetSuite.
 * * *thumbnail* - The absolute URL of an image file. 
 */

 /**
 * @typedef {Object} PageTemplate A page template to register with one or more page types.
 * @property {Array} PageTypes The page types to register the template with. 
 * @property {Object} template Specifies the template to register. `template` is an object with the following properties:
 * * *name* - The template file name.
 * * *displayName* - The name of the page template as it will appear in the list of available layouts in Site Management Tools (SMT) in NetSuite.
 * * *thumbnail* - The absolute URL of an image file. 
 */