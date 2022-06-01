/**
 * The SCModel component lets you define models in SuiteCommerce extensions. It is the SuiteCommerce implementation of Backbone.Model. Similar to other components in the extensibility API, such as SCFormView and SCCollectionView, you must define your model in a file with the AMD module specification.
 * 
 * The SCModel component provides an abstract class called `SCModel`. To use SCModel, create a child class object that extends from it. To inherit from the parent class, immediately call the parent constructor with `call()` in your child class object.
 *
 * **Important: In extensions on SuiteCommerce 2020.1 and later, use SCModel instead of Backbone.Model.**
 *  
 * 
 * _MySCModel.Model.js_
 * ```javascript
 * 			define(
 *	'MySCModel.Model',
 *	[
 *		'SCModel', 
 *		'Utils'
 *	], 
 *	function(SCModelComponent, Utils){
 * 		'use strict';
 *
 *		var SCModel = SCModelComponent.SCModel;
 *
 *		function MySCModel() {
 *			SCModel.call(this);
 *
 *			// Define properties of the model.
 *			this.urlRoot = function() {
 *				return Utils.getAbsoluteUrl(
 *					getExtensionAssetsPath("services/MainModule.Service.ss")
 *				)		 	 
 *			}
 *		}
 *
 *		MySCModel.prototype = Object.create(SCModel.prototype);
 *
 *		MySCModel.prototype.constructor = MySCModel;
 *
 * 		// Return the AMD constructor.
 *		return MySCModel;
 *	}
 * );
 * ```
 * 
 * 
 * @abstract
 * @since SuiteCommerce 2020.1
 */
class SCModel {

	constructor() {
		super(); 

		// /**
		//  * Lets you use an arbitrary attribute (instead of the default `id` attribute) to store a model's identifier. 
		//  */
		// this.idAttribute;
	}
	

	// /**
	//  * Returns the URL of the model. See the {@link Backbone} website for more information. 
    //  * @returns {String} url The URL of the model.
	//  */
	// url() {
	// 	return null;
	// }

	// /**
	//  * Lets you specify the root for URLs. 
	//  */
	// urlRoot() {
	// 	return null;
	// }
}