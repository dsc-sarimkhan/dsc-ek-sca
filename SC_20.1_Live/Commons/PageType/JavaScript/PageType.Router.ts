/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PageType.Router"/>

import Backbone = require('../../Utilities/JavaScript/backbone.custom');

// @module Home
// @lass Home.Router @extends Backbone.Router
export = Backbone.Router.extend({
    initialize: function(application) {
        this.application = application;
    }
});
