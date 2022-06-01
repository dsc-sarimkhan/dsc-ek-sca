<!-- Changes menu width and position  -->

{{#unless isStandalone}}
<nav class="header-menu-secondary-nav">
	<!-- <div class="header-logo-wrapper">
		<div data-view="Header.Logo">
		</div>
	</div> -->
	<div class="header-menu-search" data-view="SiteSearch.Button"></div>
	<div class="header-right-menu">
		<div class="header-menu-profile" data-view="Header.Profile"></div>
		{{#unless isStandalone}}
		<div class="header-menu-locator-mobile" data-view="StoreLocatorHeaderLink"></div>
		<div class="header-menu-searchmobile" data-view="SiteSearch.Button"></div>
		<div class="header-menu-cart">
			<div class="header-menu-cart-dropdown" >
				<div data-view="Header.MiniCart"></div>
			</div>
		</div>
		{{/unless}}
	</div>
	<ul class="header-menu-level1">

		{{#each categories}}

		{{#if text}}
		<li {{#if categories}}data-toggle="categories-menu" {{/if}}>
			<a class="{{class}}" {{objectToAtrributes this}}>
				{{translate text}}
			</a>

			{{#if categories}}
			<ul class="header-menu-level-container">
				<li>
					<div class="row" style="padding-left:15px;">
						<div class="col-md-4">
							<ul class="header-menu-level2">
								{{#each categories}}

								<div class="row">
									<li>
										<a class="{{class}} child-level1-{{@index}}"
											{{objectToAtrributes this}}>{{translate text}} {{#if categories}}

											<i class="icon-caret-right pull-right"
												style="font-size: 18px;vertical-align: baseline; margin-right: 10px;"></i>
											{{/if}} </a>
									</li>
								</div>
								{{/each}}
							</ul>
						</div>

						<div class="col-md-8">
							<div class="row" style="padding-left:15px;">
								<div class="col-md-12">
									{{#each categories}}
									<div class="row  thirdlevel-active child-level2-{{@index}}">

										{{#if categories}}
										<ul class="header-menu-level3">
											{{#each categories}}
											<div class="row col-sm-6">
												<li>
													<a class="{{class}}" {{objectToAtrributes this}}>
														<span style="float:left; padding-left: 15px;">
															{{#if this.data-type}}
															{{#if this.additionalFields.thumbnailurl}}
															<img id="" src="{{this.additionalFields.thumbnailurl}}"
																style="border-width:0px; height: 40px;width: 40px;border-radius: 50%;" />
															{{else}}
															<img id=""
																src="{{getThemeAssetsPath 'img/no_image_available.jpeg'}}"
																style="border-width:0px; height: 40px;width: 40px;border-radius: 50%;" />
															{{/if}}
															{{/if}}
														</span>
														<span style="float:left; padding: 7px;">
															<span id="">{{translate text}}</span>
														</span>
														<span class="clear-fix"></span>
													</a>

												</li>
											</div>
											{{/each}}
										</ul>
										{{/if}}

									</div>
									{{/each}}
								</div>
								<div class="col-md-6"></div>
							</div>
						</div>
					</div>
				</li>
			</ul>
			{{/if}}
		</li>
		{{/if}}
		{{/each}}

	</ul>
</nav>

<!-- Script added to handle the menus -->
<script>
	$(document).ready(function () {
		$('.header-menu-level-container').css({
			"width": "36%",
			"left": "auto"
		});
		$('.thirdlevel-active').css('display', 'none');
		var id;
		$('.header-menu-level2 .row > li > a').hover(function (e) {
			$('.thirdlevel-active').css('display', 'none');
			$('.header-menu-level-container').css({
				"width": "36%",
				"left": "auto"
			});

			id = getIdIndex(e.target.className);
			id = getId(id);
			if (id) {

				if ($(this).children().length > 0) {
					$('.header-menu-level-container').css({
						"width": "100%",
						"left": "0"
					});
				} else {
					$('.header-menu-level-container').css({
						"width": "36%",
						"left": "auto"
					});
				}


				$('.child-level2-' + id).css('display', 'block');
			}
		}, function (e) {

			var childid = getIdIndex(e.target.className);
			childid = getId(childid);
			if (childid == id) {
				return;
			} else {

				$('.thirdlevel-active').css('display', 'none');
			}

		})
	});
	$('.header-menu-level1-anchor').hover(function (e) {

		$('.thirdlevel-active').css('display', 'none');
		$('.header-menu-level-container').css({
			"width": "36%",
			"left": "auto"
		});

	});
	// making array of class names
	function getIdIndex(string) {
		var str = string
		var res = str.split(" ");

		return res[res.length - 1];
	}
	// getting id from last class name
	function getId(string) {
		var str = string
		var res = str.split("-");

		return res[res.length - 1];
	}
</script>

{{/unless}}

{{!----
Use the following context variables when customizing this template:

	categories (Array)
	showExtendedMenu (Boolean)
	showLanguages (Boolean)
	showCurrencies (Boolean)

----}}