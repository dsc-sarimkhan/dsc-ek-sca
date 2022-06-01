/**
 * The base class for all PageType views. Views that render a registered page type must extend this class. In particular, the `PageTypeBaseView` class exposes the `beforeShowContent` method to delay rendering of the view. By overriding this method, you can do additional work before the view is rendered, such as retrieving data for the view. 
 * 
 * *Note:* The `registerPageType()` method of the {@link PageType} component accepts an object as its argument. Use a PageTypeBaseView view as a value of the `view` property of the object.
 * 
 * @extends Backbone.View
 * @since SuiteCommerce 2019.1
 */
class PageTypeBaseView extends Backbone.View {

    /**
     * Postpones rendering of the view so that you can do work beforehand. When you use this method, you must return a resolved promise to render the view. If you return a rejected promise, the view will not be rendered.  
     * 
     * This method is called after the `initialize()` method.
     * 
     * ```javascript
     * var CalendarPageView = PageTypeBaseView.extend({
     *      template: calendarpage_tpl,
     *      beforeShowContent: function() {
     *          promise = JQuery.Deferred();        
     *          // Do something here before the view is rendered, such as retrieving
     *          // data for the view with a jQuery HTTP GET request. 
     *          $.get('https://example.com/data/get/1234').then(function(data) {
     *              if (data) {
     *                  promise.resolve();
     *              }
     *              else {
     *                  promise.reject();
     *              }
     *          });  
     *          
     *          return promise;                 
     *      }
     * }); 
     * ```
     * 
     * @returns {Deferred} By default, this method returns a resolved promise. When you override this method, you must return a rejected promise or a resolved promise. 
     */
    beforeShowContent() {
        return null;
    }

    /**
     * This method is called when an instance of this class is created. 
     */
    initialize() {
        return null;
    }
}

// DATA TYPE DEFINITIONS
// ---------------------

// EVENTS
// ------

 
