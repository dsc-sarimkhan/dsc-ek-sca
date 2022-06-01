/**
 * SCCollectionView is an abstract class that lets you display a collection (list) of items, usually in a grid pattern. Use this class when you want to display a list of elements on the page. It takes an array (of elements) as its only parameter.
 * 
 * To use SCCollectionView, create a component that inherits from the SCCollectionView class. In the child class object, call the parent class constructor with call() or apply(). SCCollectionView takes an array of elements as its only parameter. You will need to pass in the elements to your child class object.
 * 
 * Note that the {@link SCCollectionView#getCellViewInstance|getCellViewInstance()} method, which returns an instance of a cell view, is called once for each element in the array passed to the SCCollection constructor.
 * 
 * The following example shows how to use SCCollectionView. Since SCCollectionView is an abstract class, we must override it with a child class. SCCollectionView has an abstract property, `template`, and an abstract method `getCellViewInstance`, both of which must be overridden.
 * 
 * _FacetsItemsCollectionView.View.js_
 * ```javascript
 * 			define(
 * 	'FacetsItemsCollectionView.View',
 * 	[
 * 		'Backbone',
 * 		'SCCollectionView',
 * 		'Facets.ItemCell.View',
 * 		'RowView',
 * 		'facets_items_collection.tpl',
 * 		'facets_items_collection_view_row.tpl'
 * 	]
 * 	function(Backbone, SCCollectionView_, FacetsItemCellView, RowView, facets_items_collection_tpl, facets_items_collection_view_row_tpl) {
 * 		'use strict';
 * 
 * 		var SCCollectionView = SCCollectionView_.SCCollectionView;
 * 
 * 		function FacetsItemsCollectionView() {
 * 			var collection = ['Hats', 'Scarves', 'Gloves'];
 * 			SCCollectionView.call(this, collection);
 * 		
 * 			this.template = facets_items_collection_tpl;
 * 	}
 * 
 * 	FacetsItemsCollectionView.prototype = Object.create(SCCollectionView.prototype);
 * 
 * 	FacetsItemsCollectionView.prototype.constructor = FacetsItemsCollectionView;
 * 
 * 	FacetsItemsCollectionView.prototype.getContext = function() {
 * 		return {};
 * 	}
 * 
 * 	FacetsItemsCollectionView.prototype.getCellViewsPerRow = function() {
 * 		return 2; //The number of cells to be rendered in a row.
 * 	}
 * 
 * 	FacetsItemsCollectionView.prototype.getCellViewInstance = function(
 * 		element,
 * 		index
 * 	) {
 * 		return new FacetsItemCellView({
 * 			element: element,
 * 			index: index
 * 		});
 * 	}
 * 
 * 	FacetsItemsCollectionView.prototype.getRowViewInstance = function(index) {
 * 		return new RowView({ template: facets_items_collection_view_row_tpl });
 * 	}
 * );
 * ```
 * &nbsp;<br>
 * 
 * When using SCCollectionView, at a minimum, you must override the {@link SCCollectionView#getCellViewInstance|getCellViewInstance()} method and return a instance of an {@link SCView} view.
 * 
 * To render the elements of the collection, you must provide two template files with specific placeholders. The first template file is required by your child class object to display the row container. It must contain a HTML element with the following data attribute: `data-type="backbone.collection.view.rows"`.
 * 
 * _facets_items_collection.tpl_
 * ```html
 * 			<div data-type="backbone.collection.view.rows"></div>
 * ```
 * &nbsp;<br>
 *  
 * The second template file is required by the view instance to display a row. It must contain a HTML element with the following data attribute: `data-type="backbone.collection.view.cells"`.
 * 
 * _facets_items_collection_view_row.tpl_
 * ```html
 * 			<div class="facets-items-collection-view-row">
 * 	<div data-type="backbone.collection.view.cells"></div>
 * </div>
 * ```
 * &nbsp;<br>
 *  
 * **Note**: The SCCollectionView class contains a number of private methods and properties (listed below) that you should not override or use. For example, do not get or set the values of private properties.
 * 
 *  
 * @abstract
 * @extends View
 * @since SuiteCommerce 2020.2
 */
class SCCollectionView extends View {

	/**
	 * @private
	 */
	cellContainerId;

	/**
	 * @private
	 */
	cellsContainerId
	
	/**
	 * @private
	 */
	cellTemplate;

	/**
	 * @private
	 */
	cellViewInstances;

	/**
	 * @private
	 */
	collection;

	/**
	 * @private
	 */
	rowsContainerId;

	/**
	 * @private
	 */
	rowsCount;

	/**
	 * The template you want to use to display the collection of elements. The HTML returned by the template must contain a HTML tag with the following data attribute: `data-type="backbone.collection.view.rows"`. The data attribute is typically used with a DIV tag, but it does not necessarily have to be a DIV tag. When the template is rendered, the element with the data attribute is replaced with the view content (rows and cells).
	 * 
	 * **Note**: `template` is an abstract property; you must override it in your child class object. 
	 *  
	 * 
	 * @abstract
	 * @protected
	 */
	template;

	/**
	 * @protected
	 * @param {Array<TCollectionElement>} collection A list of elements that will be rendered. 
	 */
	constructor() {
		super(); 
	}

	/**
	 * An internal method. Do not override this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private 
	 */
	appendCellsToRow() {

	}

	/**
	 * An internal method. Do not override this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private 
	 */
	calculateSpanSize() {

	}

	/**
	 * An internal method. Do not override this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private 
	 */
	createCell() {

	}

	/**
	 * An internal method. Do not override this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private 
	 */
	createCellElement() {

	}

	/**
	 * @see SCView
	 */
	destroy() {

	}

	/**
	 * An internal method. Do not override this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private 
	 */
	destroyCellViewInstances() {

	}
 
	/**
	 * Returns an instance of a cell view, which is used to render a cell in a row in the grid. This method is called once for each element in the array passed to SCCollectionView. When the page is rendered, each element is displayed in the cell. The returned cell view instance must extend {@link SCView}.
	 * 
	 * `getCellViewInstance` is an abstract method; you must override it in your child class object. It must return an instance of a cell view.
	 * 
	 * 
	 * @abstract
	 * @param {TCollectionElement} element An element of the array passed to the class contructor. `TCollectionElement` is the type of the element passed in the array.
	 * @param {Number} index The position of the cell in the array.
	 * @returns {SCView} An instance of a cell view. 
	 */
	getCellViewInstance(element, index) {

	}

	/**
	 * Lets you specify the number of cells to display in a row in the grid. The default number of cells displayed per row is three (3). If you override this method, it must return a positive integer.
	 * 
	 * You will only need to override this method if you override {@link SCCollectionView#getRowViewInstance|getRowViewInstance()} and want to display a different number of rows.
	 * 
	 * ```javascript
	 *			MySCCollectionView.prototype.getCellViewsPerRow = function() {
 	 *	return 6; 
 	 * }
	 * ```
	 * 
	 * @protected
	 * @returns {Number} The number of cells to display in a row. Returns '3' by default. If you override this method, it must return a positive integer.
	 */
	getCellViewsPerRow() {

	}

	/**
	 * An internal method. Do not override this method. If you override this method, your SuiteCommerce website might not work as expected.
	 * 
	 * @private
	 */
	getEffectiveCellViewsPerRow() {

	}

	/**
	 * Gets an instance of a row view. The {@link SCCollectionView#render|render()} method uses `getRowViewInstance()` to display a row on the page. You can override this method in your child class to define the view that wraps the cell views (defined with {@link SCCollectionView#getCellViewsPerRow|getCellViewsPerRow()}). If you override this method, it must return an instance of an SCView child class.
	 *
	 * The template of the view instance returned by this method must have a HTML tag with the attribute: data-type="backbone.collection.view.cells". For example, `<div data-type="backbone.collection.view.cells"></div>`.
	 * 
	 * **Note**: If you override this method, and you do **not** want to display the default number of cells per row (3), you will also need to override {@link SCCollectionView#getCellViewsPerRow|getCellViewsPerRow()}.
	 * 
	 * @protected
	 * @param {Number} index The number of the row being rendered. Rows are zero-based.
	 * @returns {SCView} An instance of a row view.
	 */
	getRowViewInstance(index) {

	}

	/**
	 * @see SCView
	 */
	render() {}

}