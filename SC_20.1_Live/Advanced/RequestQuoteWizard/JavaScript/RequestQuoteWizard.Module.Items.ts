/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="RequestQuoteWizard.Module.Items"/>

import * as requestquote_wizard_module_items_tpl from 'requestquote_wizard_module_items.tpl';

import WizardModule = require('../../Wizard/JavaScript//Wizard.Module');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import TransactionLineViewsCellActionableExpandedView = require('../../../Commons/Transaction.Line.Views/JavaScript/Transaction.Line.Views.Cell.Actionable.Expanded.View');
import RequestQuoteWizardModuleItemsLineActionsView = require('./RequestQuoteWizard.Module.Items.Line.Actions.View');
import RequestQuoteWizardModuleItemsLineQuantityView = require('./RequestQuoteWizard.Module.Items.Line.Quantity.View');

// @class RequestQuoteWizard.Module.Items @extend Wizard.Module
export = WizardModule.extend({
    // @property {Function} template
    template: requestquote_wizard_module_items_tpl,

    // @method initialize
    // @return {Void}
    initialize: function() {
        WizardModule.prototype.initialize.apply(this, arguments);
        BackboneCompositeView.add(this);

        this.wizard.model.get('lines').on('add remove change', this.render, this);
    },

    // @property {Object} childViews
    childViews: {
        'Items.Collection': function(options) {
            return new BackboneCollectionView({
                collection: this.model.get('lines'),
                viewsPerRow: 1,
                childView: TransactionLineViewsCellActionableExpandedView,
                childViewOptions: {
                    navigable: true,
                    application: this.wizard.application,
                    SummaryView: RequestQuoteWizardModuleItemsLineQuantityView,
                    ActionsView: RequestQuoteWizardModuleItemsLineActionsView,
                    showAlert: false,
                    generalClass: options.generalClass || 'requestquote-wizard-module-items-item'
                }
            });
        }
    },

    // @method getContext
    // @return {RequestQuoteWizard.Module.Items.Context}
    getContext: function() {
        // @class RequestQuoteWizard.Module.Items.Context
        return {
            // @property {Boolean} showTitle
            showTitle: !!(!this.options.hide_title && this.getTitle()),
            // @property {String} title
            title: this.getTitle(),
            // @property {Boolean} showHeaders
            showHeaders: !this.options.hideHeaders,
            // @property {Boolean} hasItems
            hasItems: !!this.wizard.model.get('lines').length
        };
        // @class RequestQuoteWizard.Model.Items
    },

    // @method destroy Override default implementation to detach form wizard's model events
    // @return {Void}
    destroy: function() {
        this.wizard.model.get('lines').off('add remove', this.render);

        WizardModule.prototype.destroy.apply(this, arguments);
    }
});
