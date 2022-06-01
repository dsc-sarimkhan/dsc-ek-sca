// @module <%= module_name %>
define('<%= module_name %>.View'
,	[
	'<%= tpl_name %>.tpl'
	<% if (ss2) { %>
	,	'<%= module_name %>.SS2Model'
	<% } else { %>
	,	'<%= module_name %>.Model'
	<% } %>
	,	'Backbone'
    ]
, function (
	<%= tpl_dep_name %>_tpl
	<% if (ss2) { %>
	,	<%= module_dep_name %>SS2Model
	<% } else { %>
	,	<%= module_dep_name %>Model
	<% } %>
	,	Backbone
)
{
    'use strict';

	// @class <%= module_name %>.View @extends Backbone.View
	return Backbone.View.extend({

		template: <%= tpl_dep_name %>_tpl

	,	initialize: function (options) {

			/*  Uncomment to test backend communication with an example service
				(you'll need to deploy and activate the extension first)
			*/

			// this.model = new <%= module_dep_name %>Model();
			// var self = this;
         	// this.model.fetch().done(function(result) {
			// 	self.message = result.message;
			// 	self.render();
      		// });
		}

	,	events: {
		}

	,	bindings: {
		}

	, 	childViews: {

		}

		//@method getContext @return <%= module_name %>.View.Context
	,	getContext: function getContext()
		{
			//@class <%= module_name %>.View.Context
			this.message = this.message || 'Hello World!!'
			return {
				message: this.message
			};
		}
	});
});
