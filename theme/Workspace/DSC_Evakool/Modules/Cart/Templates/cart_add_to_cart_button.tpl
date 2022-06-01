
{{#if isCurrentItemPurchasable}}
	<div class="cart-add-to-cart-button-container">
		<div class="cart-add-to-cart-button">
			<button type="submit" id="add_to_cart"  data-type="add-to-cart" data-action="sticky" class="cart-add-to-cart-button-button">
				{{#if isUpdate}}{{translate 'Update'}}{{else}}{{translate 'Add to Cart'}}{{/if}}
			</button/>
		</div>
	</div>

{{/if}}

<script type="text/javascript">
    $('.cart-add-to-cart-button-button').mousedown(function() {
    fbq('track', 'AddToCart');
    });
  </script>



{{!----
Use the following context variables when customizing this template: 
	
	isCurrentItemPurchasable (Boolean)
	isUpdate (Boolean)

----}}
