// Model.js
// -----------------------
// @module Case
define("<%= module_name %>.Model", ["Backbone", "Utils"], function(
    Backbone,
    Utils
) {
    "use strict";

    // @class Case.Fields.Model @extends Backbone.Model
    return Backbone.Model.extend({

        <% if (ss) { %>
        //@property {String} urlRoot
        urlRoot: Utils.getAbsoluteUrl(
            getExtensionAssetsPath(
                "services/<%=module_dep_name%>.Service.ss"
            )
        )
        <% }%>
});
});
