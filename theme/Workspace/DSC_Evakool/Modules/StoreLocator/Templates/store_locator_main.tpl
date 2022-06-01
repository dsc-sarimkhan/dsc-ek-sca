<div class="store-locator-main">
	<div class="store-locator-main-title">
		<h1>{{title}}</h1>
	</div>

	<div class="store-locator-main-layout">
		<div class="store-locator-main-layout-left">
			{{#if service_msg}}
			<div class="service-agent-msg">EvaKool recommends calling ahead prior to visiting a service agent to query availability and suitable times to visit. Please keep in mind that if you are unable to visit a service agent, and require a call out, the call out fee charge is payable by you directly.</div><br>
			{{/if}}
			<div class="store-locator-main-search" data-view="StoreLocatorSearch"></div>
			<div class="store-locator-main-results" data-view="StoreLocatorResults"></div>
			<div class="store-locator-main-see-all-stores">
				<a data-hashtag="stores/all" href="stores/all">{{translate 'See complete list of stores'}}</a>
			</div>
		</div>
		<div class="store-locator-main-layout-right">
			<div class="store-locator-main-map" data-view="StoreLocatorMap" data-type="map-view"></div>
		</div>
	</div>
</div>



{{!----
Use the following context variables when customizing this template: 
	
	touchpoint (String)

----}}
