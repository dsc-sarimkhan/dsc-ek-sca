/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="QuoteToSalesOrderWizard.Module.QuoteDetails"/>

import * as quote_to_salesorder_wizard_module_quotedetails_tpl from 'quote_to_salesorder_wizard_module_quotedetails.tpl';

import WizardModule = require('../../Wizard/JavaScript//Wizard.Module');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');

// @class QuoteToSalesOrderWizard.Module.QuoteDetails @extend Wizard.Module
export = WizardModule.extend({
    // @property {Function} template
    template: quote_to_salesorder_wizard_module_quotedetails_tpl,

    // @method getContext
    // @return {QuoteToSalesOrderWizard.Module.QuoteDetails.Context}
    getContext: function() {
        // @class QuoteToSalesOrderWizard.Module.QuoteDetails.Context
        return {
            // property {QuoteToSalesOrder.Model} model
            model: this.model,
            // @property {String} quoteId
            quoteId:
                this.model.get('recordtype') === 'salesorder' &&
                this.model.get('internalid') !== 'tempid'
                    ? this.model.get('createdfrom').internalid
                    : this.model.get('quoteid'),
            // @property {String} quoteTranId
            quoteTranId: this.model.get('quoteDetails').tranid
                ? this.model.get('quoteDetails').tranid
                : this.model.get('createdfrom').tranid
        };
    }
});
