define(
	'DSC.SEOContent.DisplayContent', [
		'DSC.SEOContent.DisplayContent.View'
	,	'DSC.SEOContent.DisplayContent.Model'
	],
	function (
		DisplayContentView
	,	DisplayContentModel
	) {
		'use strict';

		return {
			mountToApp: function mountToApp(container) {
				var layout = container.getComponent("Layout");
				var plp = container.getComponent("PLP");
				var globalView = null;
				if (plp) {
					plp.on("beforeShowContent", function () {
						if (globalView !== null) {
							layout.removeChildView(
								"cms:facets_facet_browse_cms_area_2",
								globalView
							);
						}
						var categoryinfo = plp.getCategoryInfo();
						var model = new DisplayContentModel();
						model.fetch({
							async: false,
							data: {
								categoryId: categoryinfo.internalid,
							},
						}).done(function (response) {
							if (response.contentDetails) {
								globalView = layout.addChildView(
									"cms:facets_facet_browse_cms_area_2",
									function () {
										return new DisplayContentView({
											container: container,
											contentDetails: response.contentDetails,
										});
									}
								);
							}
						});
					});
				}
			}
		};
	});