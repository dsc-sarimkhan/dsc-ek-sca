  
<div class="product-details-image-gallery">
	{{#if showImages}}
	{{#if showImageSlider}}
	<ul class="bxslider" data-slider>
	
		{{#each images}}
			{{#if iframe}}
			<li class="product-details-image-gallery-container">
				<iframe class="responsive-iframe" style="width: 100%; height:100%;" src="{{iframe}}"></iframe>
			</li>
			{{else}}
			<li data-zoom class="product-details-image-gallery-container">
				<img src="{{resizeImage url ../imageResizeId}}" alt="{{altimagetext}}" itemprop="image" data-loader="false">
			</li>
			{{/if}}
		{{/each}}
	</ul
	{{else}}
	{{#with firstImage}}
	<div class="product-details-image-gallery-detailed-image" data-zoom>
		<img class="center-block" src="{{resizeImage url ../imageResizeId}}" alt="{{altimagetext}}" itemprop="image"
			data-loader="false">
	</div>
	{{/with}}
	{{/if}}
	{{/if}}
	<div data-view="SocialSharing.Flyout.Hover"></div>
</div>



{{!----
Use the following context variables when customizing this template:
	imageResizeId (String)
	images (Array)
	firstImage (Object)
	firstImage.altimagetext (String)
	firstImage.url (String)
	showImages (Boolean)
	showImageSlider (Boolean)
----}}