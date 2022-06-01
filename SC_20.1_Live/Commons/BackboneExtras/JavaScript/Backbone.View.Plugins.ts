/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Backbone.View.Plugins"/>

import ApplyPermissions = require('./Backbone.View.Plugin.ApplyPermissions');
import Bootstrap = require('./Backbone.View.Plugin.Bootstrap');
import DatePicker = require('./Backbone.View.Plugin.DatePicker');
import DebugTemplateName = require('./Backbone.View.Plugin.DebugTemplateName');
import OldIEFix = require('./Backbone.View.Plugin.OldIEFix');
import PageGeneratorImages = require('./Backbone.View.Plugin.PageGeneratorImages');

/*
@module BackboneExtras
#Backbone.View.Plugins
Define the default plugins to execute by Backbone.View.render method. These plugins hook into the Backobne.view
render() life cycle and modify the view's output somehow, for example removing marked nodes that current user
has not permission to see, installing bootstrap widgets after a view is rendered, etc.
*/

const plugins = [
    ApplyPermissions,
    Bootstrap,
    DatePicker,
    DebugTemplateName,
    OldIEFix,
    PageGeneratorImages
];

export = {
    mountToApp: function() {
        for (let i = 0; i < plugins.length; ++i) {
            plugins[i].mountToApp.apply(this, arguments);
        }
    }
};
