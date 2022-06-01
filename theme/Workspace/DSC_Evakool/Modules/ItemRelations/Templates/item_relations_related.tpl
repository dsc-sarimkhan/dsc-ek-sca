{{#if showCells}}
	<aside class="item-relations-related">
		{{#if upsell}}
		<h3 class="dsc-custom-upsell">{{translate 'ADD ACCESSORIES FOR - '}} {{parentItemName}}</h3><br>
		{{else}}
		<h3>{{translate 'ADD ACCESSORIES '}}</h3>
		{{/if}}
		<div class="item-relations-related-row">
			<div data-type="backbone.collection.view.rows"></div>
		</div>
	</aside>
{{/if}}



{{!----
Use the following context variables when customizing this template: 
	
	collection (Array)
	showCells (Boolean)

----}}
