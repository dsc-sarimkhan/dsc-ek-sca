/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CustomContentType.Container.View"/>

import * as custom_content_type_container_tpl from 'custom_content_type_container.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @module CustomContentType
// @class CustomContentType.Container.View @extends Backbone.View
// inherits the basic render and destroy methods from Backbone.View
export = BackboneView.extend({
    template: custom_content_type_container_tpl,

    initialize: function initialize(options) {
        this.addChildViewInstances({
            'CCT-View': {
                'CCT-View': {
                    childViewInstance: options.innerCustomContentType,
                    childViewIsExternal: true
                }
            }
        });
    },

    // @method getContext
    // @return {CustomContentType.Container.View.Context}
    getContext: function getContext() {
        // @class CustomContentType.Container.View.Context
        return {
            // @property {String} instanceId
            instanceId: this.options.instanceId,

            // @property {String} classes
            classes: this.options.classes
        };
        // @class CustomContentType.Container.View
    }
});
