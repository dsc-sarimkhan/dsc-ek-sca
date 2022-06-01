/**
 * Subset of SuiteCommerce View exposed for Extensions developers for declaring new views, adding child-views, etc.
 *
 * Internally is implemented with `Backbone.View` which is enhanced with handlebars templates, render plugins, context,
 * SEO, composition, navigation, etc.
 *
 * @deprecated
 */
class View {


	
		constructor() {
			/**
			 * The template for this view, in general a function that accepts this view context object and returns an HTML string.
			 * If it is a string an AMD module with that name is tried to be loaded.
			 * If it is undefined the view will be rendered without errors as an empty string
			 * @type {Function|String}
			 */
			this.template = null
	
			/**
			 * @type {{string:string}|{string:Function}}
			 */
			this.events = null
	
			/**
			 * @type {{string:string}}
			 */
			this.bindings = null
	
			// /**
			//  * The container element of this view. The first-level element of this view template is this.$el
			//  * @type {jQuery}
			//  */
			// this.$el = null
		}
	
		/**
		 * this is executed when a new view is instantiated - equivalent to the instance contructor.
		 * @param {...any} options
		 * @return {void}
		 */
		initialize(options) {
			return null;
		}
	
		/**
		 * Generates the HTML of the page.
		 * 
		 * @return {void}
		 */
		render() {
			return null;
		}
	
		/**
		 * Returns the object which will be consumed by this view's template
		 * @return {Object}
		 */
		getContext() {
			return null;
		}
	
	/**
	 * Removes the view from the DOM, as well as all events associated with it. If you override this method, make sure you call the parent class immediately in the child class. 
	 * 
	 * You should call this method in your child class when you want to do additional work at the time the view is destroyed. For example, if you add JQuery events in a view, you will need to stop listening for those same events when the view is destroyed.
	 * 
	 * ```javascript
	 * 			function CardsView() {
	 * 	//... 
	 * 
	 * 	function destroy() {
	 * 		View.call(this);
	 * 
	 * 		// Do other stuff here. For example, stop listening to events...
	 * 	}
	 * }
	 * ```
	 * 
	 * @returns {void}
	 */
	destroy() {
		return null;
	}
	
	/**
	 * @param {View} view_definition an object with some of this class members.
	 * <!-- @return {typeof View} -->
	 */
	extend(view_definition) {
		return null;
	}
	
}
	
	/**
	 * Represents a jQuery object
	 * @typedef {{}} jQuery
	 * @see {@link http://api.jquery.com/jQuery/}
	 */
	