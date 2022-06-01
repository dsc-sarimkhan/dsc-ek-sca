/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="RequestQuoteWizard.Module.Items.Line.Actions.View"/>

import * as requestquote_wizard_module_items_line_actions_tpl from 'requestquote_wizard_module_items_line_actions.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class RequestQuoteWizard.Module.Items.Line.Actions.View @extend Backbone.View
export = BackboneView.extend({
    // @property {Function} template
    template: requestquote_wizard_module_items_line_actions_tpl,

    // @property {Object} events
    events: {
        'click [data-action="remove"]': 'removeItem'
    },

    // @method removeItem Removed the current item from the list of items
    // @return {Void}
    removeItem: function() {
        this.options.model.collection.remove(this.options.model);
    },

    // @method getContext
    // @return {RequestQuoteWizard.Module.Items.Line.Actions.View.Context}
    getContext: function() {
        // @class RequestQuoteWizard.Module.Items.Line.Actions.View.Context
        return {};
        // @class RequestQuoteWizard.Module.Items.Line.Actions.View
    }
});
