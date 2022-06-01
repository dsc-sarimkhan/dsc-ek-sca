<div id="site-logo" class="content-banner"></div>

<a class="header-logo" href="{{headerLinkHref}}" data-touchpoint="{{headerLinkTouchPoint}}" data-hashtag="{{headerLinkHashtag}}" title="{{headerLinkTitle}}">

{{#if logoUrl}}
	<img class="header-logo-image dsc-header-mid-logo-image" src="https://6457383.app.netsuite.com/core/media/media.nl?id=9673&c=6457383&h=8d4e73afdba11a16844f" alt="{{siteName}}">
	<img class="header-logo-image dsc-header-top-logo-image" src="{{getThemeAssetsPathWithDefault logoUrl 'img/SC_Logo.png'}}" alt="{{siteName}}">
{{else}}
	<span class="header-logo-sitename">
		{{siteName}}
	</span>
{{/if}}
</a>
<!-- <div class="dsc-header-top-text">CHILLED FOR GOOD TIMES</div> -->



{{!----
Use the following context variables when customizing this template:

	logoUrl (String)
	headerLinkHref (String)
	headerLinkTouchPoint (String)
	headerLinkHashtag (String)
	headerLinkTitle (String)

----}}
