/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Backbone.View.render"/>

import * as _ from 'underscore';

import '../../Backbone.CompositeView/JavaScript/Backbone.CompositeView';
import '../../Utilities/JavaScript/backbone.validation';
import '../../Utilities/JavaScript/Handlebars';
import '../../HandlebarsExtras/JavaScript/HandlebarsExtras';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as jQuery from '../../Core/JavaScript/jQuery';

import PluginContainer = require('../../PluginContainer/JavaScript/PluginContainer');

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

/*
@module BackboneExtras
#Backbone.View.render()
This file extends native Backbone.View with a custom rendering method. Basically a View must have the 'template'
property pointing to a Function and that function is evaluated using the result of view.getContext()
@module Backbone
@class Backbone.View
*/

_.extend(BackboneView.prototype, {
    // @method getTemplateContext @return {Object} the exact object that is passed to the template function as parameter
    getTemplateContext: function() {
        let template_context;

        if (this.getContext) {
            template_context = this.getContext();

            if (this.constructor.extraContextProperties) {
                // Item key mapping? >> get item info using item key mapping
                // what about Model property?
                const safe_context = Utils.deepCopy(template_context);

                _.each(this.constructor.extraContextProperties, function contextExtender(
                    property_generator: any,
                    property_name
                ) {
                    template_context[property_name] = property_generator.fn(safe_context);
                });
            }
        } else {
            template_context = {};
            if (this.model) {
                template_context.model = this.model;
            }
            if (this.collection) {
                template_context.collection = this.collection;
            }
        }
        return template_context;
    },

    // @method compileTemplate executes the template passing the context which generates a HTML string. @return {String}
    compileTemplate: function() {
        const template_context = this.getTemplateContext();

        this.template =
            BackboneView.preCompile.executeAll(this.template, this, template_context) ||
            this.template;

        if (!this.template) {
            throw new Error("View doesn't have a template");
        }

        if (!_.isFunction(this.template)) {
            const templateName = this.template + '';
            this.template = Utils.requireModules(templateName);
            if (!this.template) {
                console.log('View render error, template not found: ', templateName);
            }
        }

        let tmpl_str = this.template(template_context);

        tmpl_str = BackboneView.postCompile.executeAll(tmpl_str, this);

        return tmpl_str;
    },

    // @method _initialize
    _initialize: function() {},

    // @method initialize
    initialize: function() {
        this._initialize();
    },

    // @method _render Implements the templates execution, rendering and append to DOM.
    // Plugins can be hooked in these interesting 'template rendering' moments to perform customizations.
    _render: function() {
        if (this.events) {
            this.undelegateEvents();
        }

        const tmpl_str = this.compileTemplate();

        // Rendering: generating DOM from the HTML string
        let $tmpl =
            SC.ENVIRONMENT.jsEnvironment === 'server'
                ? jQuery('<div/>').append(tmpl_str)
                : jQuery(tmpl_str);

        $tmpl = BackboneView.preRender.executeAll($tmpl, this);

        // @property {PluginContainer} preRenderPlugins Instance prerender plugins. Useful for extending the DOM using plugins per instance or per class using JavaScript
        $tmpl = this.preRenderPlugins ? this.preRenderPlugins.executeAll($tmpl, this) : $tmpl;

        this.$el.empty();

        this.trigger('beforeViewRender', this);

        // Appends/render the content HTML string to the view's element
        if (SC.ENVIRONMENT.jsEnvironment === 'server') {
            // If $el[0] doesn't exists it means that the ExtraChildView don't need to be shown on this page
            if (this.$el[0]) {
                // in page generator we append the content this way because of envjs bug.
                this.$el[0].innerHTML = $tmpl[0].innerHTML;
            }
        } else {
            this.$el.append($tmpl);
        }

        this.renderCompositeView();

        BackboneView.postRender.executeAll(this.$el, this);

        this.trigger('afterViewRender', this);

        if (this.events) {
            this.delegateEvents();
        }

        return this;
    },

    // @method render public overridable render method used as a facade for the internal _render method
    render: function() {
        return this._render();
    },

    // @method _destroy "private", shouldn't be overwritten if a custom destroy method is required override the destroy method. This method should still be called
    // @param {Boolean} softDestroy decides if the view should be empty instead of removed
    _destroy: function(softDestroy) {
        this.destroyCompositeView();

        if (this.$el) {
            // http://backbonejs.org/#View-undelegateEvents
            this.undelegateEvents();
        }

        // http://backbonejs.org/#Events-off
        this.model && this.model.off(null, null, this);
        this.collection && this.collection.off && this.collection.off(null, null, this);

        if (this.$el && softDestroy) {
            this.$el.empty();
        } else if (this.$el) {
            // http://backbonejs.org/#View-remove
            this.remove();
            // unbind all DOM events not just delegated ones
            this.$el.unbind();
        }
        this.trigger('destroy');
    },

    // @method destroy
    destroy: function(softDestroy) {
        this._destroy(softDestroy);
    }
});

const isDataTypeValid = function(data_type) {
    const valid_data_types = ['number', 'string', 'object', 'array', 'boolean', 'null'];
    if (_.isString(data_type)) {
        return _.indexOf(valid_data_types, data_type) >= 0;
    }
    if (_.isArray(data_type)) {
        return !_.difference(data_type, valid_data_types).length;
    }
    return false;
};

// Install the plugin containers
_.extend(BackboneView, {
    // @property {PluginContainer} preCompile These hooks are executed before the template function is executed and generates a HTML string
    // Each execute method of each plugin will receive: the template function, the view and the context where the template will execute. @static
    preCompile: new PluginContainer(),

    // @property {PluginContainer} postCompile These hooks are executed after the template the template function is executed and generates a HTML string
    // Each execute method of each plugin will receive: the template string (result of having running the template) and the view. @static
    postCompile: new PluginContainer(),

    // @property {PluginContainer} preRender These hooks are executed before the template result is appended to DOM
    // Each execute method of each plugin will receive: the template  DOM object (without begin insert into the DOM) and the view. @static
    preRender: new PluginContainer(),

    // @property {PluginContainer} postRender These hooks are executed after the template is appended to DOM
    // Each execute method of each plugin will receive: the template DOM object (already in the DOM) and the view. @static
    postRender: new PluginContainer(),

    // @method addExtraContextProperty Allows adding an extra context property into a view.
    // @param {String} property_name Unique name of the extra property to be added
    // @param {String} type Name of the type of the new property
    // @param {Function} callback Function invoked each time the View's UI context is being generated
    // @return {Void}
    // @public
    // @static
    addExtraContextProperty: function addExtraContextProperty(property_name, type, callback) {
        this.extraContextProperties = this.extraContextProperties || {};
        let error: any = {};

        if (!isDataTypeValid(type)) {
            error = new Error(
                'Invalid data type. Please check the json-schema documentation for valid data types.'
            );
            error.name = 'INVALID_DATA_TYPE';
            throw error;
        }
        if (this.extraContextProperties[property_name]) {
            error = new Error(
                'Duplicated property_name. Trying to add more than one extra context property with the same name.'
            );
            error.name = 'DUPLICATED_CONTEXT_PROPERTY';
            throw error;
        }

        this.extraContextProperties[property_name] = {
            type: type,
            fn: callback
        };
    },

    // @method removeExtraContextProperty Removes a previously extra context property
    // @param {String} property_name Name of the property
    // @return {Void}
    // @public
    // @static
    removeExtraContextProperty: function removeExtraContextProperty(property_name) {
        this.extraContextProperties = this.extraContextProperties || {};
        delete this.extraContextProperties[property_name];
    }
});

export = BackboneView;
