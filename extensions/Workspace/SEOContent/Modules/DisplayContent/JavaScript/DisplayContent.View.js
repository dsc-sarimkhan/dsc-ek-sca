// @module DSC.SEOContent.DisplayContent
define('DSC.SEOContent.DisplayContent.View'
,	[
	'dsc_seocontent_displaycontent.tpl'
	
	,	'DSC.SEOContent.DisplayContent.Model'
	
	,	'Backbone'
    ]
, function (
	dsc_seocontent_displaycontent_tpl
	
	,	DisplayContentModel
	
	,	Backbone
)
{
    'use strict';

	// @class DSC.SEOContent.DisplayContent.View @extends Backbone.View
	return Backbone.View.extend({

		template: dsc_seocontent_displaycontent_tpl

	,	initialize: function (options) {
			this.options = options;
		}

	,	events: {
		}

	,	bindings: {
		}

	, 	childViews: {

		}

		//@method getContext @return DSC.SEOContent.DisplayContent.View.Context
	,	getContext: function getContext()
		{
			return {
				contentDetails: this.options.contentDetails,
			};
		}
	});
});
