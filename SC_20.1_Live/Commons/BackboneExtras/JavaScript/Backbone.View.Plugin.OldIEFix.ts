/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Backbone.View.Plugin.OldIEFix"/>

import * as Utils from '../../Utilities/JavaScript/Utils';

import BackboneView = require('./Backbone.View.render');

export = {
    mountToApp: function() {
        if (Utils.oldIE()) {
            BackboneView.postCompile.install({
                name: 'oldIEFix',
                priority: 20,
                // Workaround for internet explorer 7. href is overwritten with the absolute path so we save the original href
                // in data-href (only if we are in IE7)
                // IE7 detection courtesy of Backbone
                // More info: http://www.glennjones.net/2006/02/getattribute-href-bug/
                execute: function(tmpl_str) {
                    return (tmpl_str || '').replace(/href="(.+?)(?=")/g, '$&" data-href="$1');
                }
            });
        }
    }
};
