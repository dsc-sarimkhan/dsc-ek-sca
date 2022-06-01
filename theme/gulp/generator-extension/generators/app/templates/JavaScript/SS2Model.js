// Model.js
// -----------------------
// @module Case
define("<%= module_name %>.SS2Model", ["Backbone", "Utils"], function(
    Backbone,
    Utils
) {
    "use strict";

    // @class Case.Fields.Model @extends Backbone.Model
    return Backbone.Model.extend({
        //@property {String} urlRoot
        urlRoot: Utils.getAbsoluteUrl(
            getExtensionAssetsPath(
                "Modules/<%= module_dep_name%>/SuiteScript2/<%=module_dep_name%>.Service.ss"
            ),
            true
        )
});
});
