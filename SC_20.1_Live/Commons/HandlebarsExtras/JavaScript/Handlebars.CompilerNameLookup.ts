/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Handlebars.CompilerNameLookup"/>

// @module HandlebarsExtra 'Handlebars.CompilerNameLookup' exports a function helper used in the templates to see if an object is a backbone model and access it
// using expressions like 'model.name'. See gulp/tasks/templates.js 'Handlebars.JavaScriptCompiler.prototype.nameLookup'.

/* globals Backbone */
// heads up ! for separate templates from the rest of .js it is optimal that this file don't require backbone with AMD but globally.
declare const Backbone: any;

export = function(parent, name) {
    if (parent instanceof Backbone.Model) {
        if (name === '__customFieldsMetadata') {
            return parent.__customFieldsMetadata;
        }
        return parent.get(name);
    }
    return parent[name];
};
