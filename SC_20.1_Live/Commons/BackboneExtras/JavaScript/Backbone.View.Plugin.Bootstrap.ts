/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Backbone.View.Plugin.Bootstrap"/>

import * as _ from 'underscore';

import BackboneView = require('./Backbone.View.render');

export = {
    mountToApp: function() {
        if (!_.result(SC, 'isPageGenerator')) {
            BackboneView.postRender.install({
                name: 'HTMLBootstrap',
                priority: 10,
                // Fix all HTML bootstrap tooltips
                execute: function(_$el, view) {
                    if (view.$('[data-toggle="tooltip"]').length != 0)
                        view.$('[data-toggle="tooltip"]').tooltip({ html: true });
                    view.$('[data-toggle="dropdown"]').dropdown();
                    // view.$('[data-toggle="collapse"]').collapse();
                }
            });
        }
    }
};
