/**
 * SCCollection is the SuiteCommerce implementation of Backbone.Collection. It extends Backbone.Collection and inherits all methods and properties. See the {@link https://backbonejs.org/|Backbone.js} website for complete documentation.
 * 
 * **In extensions on SuiteCommerce 2020.1 and later, use SCCollection instead of Backbone.Collection.**
 * 
 * The following example shows how you might extend SCCollection to create a basic child class object called 'MyCollection'. Note that SCCollection expects a model, so when calling the parent class with `call()`, we pass a model instance to SCCollection with `models`.
 * 
 *  _MyCollection.Collection.js_
 * ```javascript
 * 			define(
 * 	'MyCollection',
 * 	['SCCollection', 'MyModel'],
 * 	function('SCCollectionComponent, MyModel') {
 * 		var SCCollection = SCCollectionComponent.SCCollection;
 * 
 * 		function MyCollection(models, options) {
 * 			SCCollection.call(this, models, options);
 * 
 * 			this.model = MyModel;
 * 			this.url = function() {return 'services/MyCollection.ss'};
 * 		}
 * 
 * 		// Inherit parent instance methods.
 * 		MyCollection.prototype = Object.create(SCCollection.prototype);
 * 
 * 		MyCollection.prototype.constructor = MyCollection;
 * 
 * 		// Add instance methods here...
 * 
 * 		// Return the AMD constructor
 * 		return MyCollection;
 * 	}
 * );
 * ```
 * 
 * @hideconstructor
 * @global
 * @since SuiteCommerce 2020.1
 */
class SCCollection extends Backbone.Collection {

	/**
	 * This is the URL of the service associated with the collection. By default, it's an empty string. Leaving the string empty means that some operations might not work, such as save, fetch, etc., but you can still do other things with the collection.
	 */
	url;

	/**
	 * 
	 * @param {Array<SCModel>} [models] You can pass in the model(s) at instantiation, or do something else to fetch the model data. `models` is optional.
	 */
	constructor(models) {
	 
	}
}