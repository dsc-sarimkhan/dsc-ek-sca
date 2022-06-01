/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CMSadapter.Plugin.RecollectCMSSelectors"/>

import * as _ from 'underscore';

/*
	@module CMSadapter
	@class CMSadapter.Plugin.RecollectCMSSelectors

	Loads the recollectCMSSelectors plugin that iterates through all the tags that contains data-cms in the
	template string.
*/

export = function CMSadapterPluginRecollectCMSSelectorsGenerator(application) {
    return {
        name: 'recollectCMSSelectors',
        priority: 20,
        execute: function(tmpl_str, view) {
            const component = application.getComponent('CMS');

            const unregister = function() {
                component.unregisterViewForPlaceholders(view);
            };

            view.off('destroy', unregister).on('destroy', unregister);

            const regex = /<[^>]*(data-cms-area)=\"([^"\s]+)\"[^>]*>/g;
            let match = regex.exec(tmpl_str);
            const selectors_on_ui = [];
            let selector;
            const isEqual = function(obj) {
                return _.isEqual(obj, selector);
            };

            component.unregisterViewForPlaceholders(view);

            while (match !== null) {
                selector = {
                    'data-cms-area': match[2]
                };

                if (!_.find(selectors_on_ui, isEqual)) {
                    selectors_on_ui.push(selector);
                } else {
                    console.warn(
                        'Repeated selector ' +
                            component.selectorToString(selector) +
                            ' in template ' +
                            view.template.Name
                    );
                }

                match = regex.exec(tmpl_str);
            }

            if (selectors_on_ui.length > 0) {
                component.registerViewForPlaceholder(selectors_on_ui, view);
            }

            return tmpl_str;
        }
    };
};
