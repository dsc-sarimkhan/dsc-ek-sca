/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CMSadapter.Plugin.PostRender"/>

import * as _ from 'underscore';

/*
	@module CMSadapter
	@class CMSadapter.Plugin.PostRender

	Loads the cmsPostRender plugin responsible of re-rendering CCTs when views are being updated.
*/

export = function CMSadapterPluginPostRender(application) {
    return {
        name: 'cmsPostRender',
        priority: 10,
        execute: function(_tmpl_str, view) {
            const cms_component = application.getComponent('CMS');
            const cct_generators = cms_component.getViewCctsToRerender(view);

            _.each(cct_generators, function(cct_generator) {
                view.addChildViewInstances(cct_generator, false);
            });
        }
    };
};
