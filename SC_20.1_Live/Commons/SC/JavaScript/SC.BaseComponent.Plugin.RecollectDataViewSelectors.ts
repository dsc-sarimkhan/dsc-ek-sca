/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SC.BaseComponent.Plugin.RecollectDataViewSelectors"/>

import * as _ from 'underscore';

import SCBaseComponentChildViewsComponent = require('./SC.BaseComponent.ChildViewsComponent');

/*
	@module SC
	@class SC.BaseComponent.Plugin.RecollectDataViewSelectors

	Loads the recollectDataViewSelectors plugin that iterates through all the tags that contains data-cms in the
	template string.
*/

export = function SCBaseComponentPluginRecollectDataViewSelectors() {
    return {
        name: 'recollectDataViewSelectors',
        priority: 10,
        execute: function(tmpl_str, view): string {
            const regex = /<[^>]*(data-view)=\"([^"\s]+)\"[^>]*>/g;
            const regexCMS = /<[^>]*(data-cms-area)=\"([^"\s]+)\"[^>]*>/g;
            let match = regex.exec(tmpl_str);
            let matchCMS = regexCMS.exec(tmpl_str);
            const selectors_on_ui = [];
            const root_component_id =
                (view.attributes && view.attributes['data-root-component-id']) || '';
            const component_id = view.constructor.componentId;

            while (match !== null) {
                selectors_on_ui.push(match[2]);
                match = regex.exec(tmpl_str);
            }

            while (matchCMS !== null) {
                selectors_on_ui.push('cms:' + matchCMS[2]);
                matchCMS = regexCMS.exec(tmpl_str);
            }

            const components = ['Backbone.View', root_component_id, component_id];

            if (selectors_on_ui.length > 0) {
                _.each(components, function(component) {
                    if (component) {
                        const modifiedChildViews = SCBaseComponentChildViewsComponent.getModifiedChildViews(
                            component,
                            selectors_on_ui
                        );

                        _.each(modifiedChildViews, function(actions: any, data_view) {
                            _.each(actions, function(action: any) {
                                action.call(view);
                            });
                        });
                    }
                });
            }

            return tmpl_str;
        }
    };
};
