/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="RequestQuoteWizard.View"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as requestquote_wizard_layout_tpl from 'requestquote_wizard_layout.tpl';

import WizardView = require('../../Wizard/JavaScript/Wizard.View');
import WizardStepNavigationView = require('../../Wizard/JavaScript/Wizard.StepNavigation.View');

// @class RequestQuoteWizard.View @extends Wizard.View
export = WizardView.extend({
    // @property {Function} template
    template: requestquote_wizard_layout_tpl,

    attributes: {
        id: 'request-quote-wizard',
        'data-root-component-id': 'Wizard.View'
    },

    // @property {String} page_header
    page_header: Utils.translate('Request a Quote'),

    // @property {String} bodyClass This property indicate the class used on the body to remove the My Account side menu
    bodyClass: 'force-hide-side-nav',

    initialize: function initialize() {
        this.wizard = this.constructor.wizard;

        WizardView.prototype.initialize.apply(this, arguments);
    },

    beforeShowContent: function beforeShowContent() {
        return this.wizard.runStep();
    },

    // @method getBreadcrumbPages
    // @return {BreadcrumbPage}
    getBreadcrumbPages: function() {
        return { href: '/request-a-quote', text: Utils.translate('Request a Quote') };
    },

    // @property {ChildViews} childViews
    childViews: {
        'Wizard.StepNavigation': function() {
            return new WizardStepNavigationView({ wizard: this.wizard });
        }
    },

    // @method getContext
    // @return {RequestQuoteWizard.View.Context}
    getContext: function() {
        // @class RequestQuoteWizard.View.Context
        return {
            // @property {String} pageHeader
            pageHeader: this.page_header
        };
        // @class RequestQuoteWizard.View
    }
});
