/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.TermsAndConditions"/>

/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended.d.ts" />
import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as order_wizard_termsandconditions_module_tpl from 'order_wizard_termsandconditions_module.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import WizardModule = require('../../Wizard/JavaScript/Wizard.Module');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class OrderWizard.Module.TermsAndConditions @extends WizardModule
export = WizardModule.extend({
    template: order_wizard_termsandconditions_module_tpl,

    events: {
        'click [data-toggle="show-terms"]': 'showTerms',
        'click input[name="termsandconditions"]': 'acceptTerms'
    },

    errors: ['ERR_CHK_ACCEPT_TERMS'],

    initialize: function(options) {
        this.wizard = options.wizard;
        this.step = options.step;
        this.model = options.wizard.model;
        this.options = _.extend(
            {
                show_checkbox: true
            },
            this.options || {}
        );
    },

    render: function() {
        // the module is rendered only if the site requires agreement to the terms and conditions
        if (Configuration.get('siteSettings.checkout.requiretermsandconditions') === 'T') {
            this._render();
            const is_ready: boolean =
                Configuration.get('siteSettings.checkout.requiretermsandconditions') !== 'T' ||
                !this.options.show_checkbox ||
                this.$('input[name=termsandconditions]').is(':checked');
            this.trigger('ready', is_ready);
        } else {
            this.trigger('ready', true);
        }
    },

    submit: function() {
        const value =
            Configuration.get('siteSettings.checkout.requiretermsandconditions') !== 'T' ||
            !this.options.show_checkbox ||
            this.$('input[name=termsandconditions]').is(':checked');
        this.model.set('agreetermcondition', value);

        return this.isValid();
    },

    showTerms: function() {
        const TermsView = BackboneView.extend({
            title: Utils.translate('Terms and Conditions'),
            render: function() {
                this.$el.html(Configuration.get('siteSettings.checkout.termsandconditionshtml'));
                return this;
            }
        });

        this.wizard.application.getLayout().showInModal(new TermsView());
    },

    acceptTerms: function(data) {
        const isSelected = jQuery(data.target).prop('checked');
        const boxes = jQuery('input[name=termsandconditions]');

        jQuery.each(boxes, function(index) {
            jQuery(boxes[index]).prop('checked', isSelected);
        });
    },

    isValid: function() {
        const promise = jQuery.Deferred();
        const value =
            Configuration.get('siteSettings.checkout.requiretermsandconditions') !== 'T' ||
            !this.options.show_checkbox ||
            this.model.get('agreetermcondition');

        if (!value) {
            return promise.reject({
                errorCode: 'ERR_CHK_ACCEPT_TERMS',
                errorMessage: Utils.translate('You must accept the Terms and Conditions')
            });
        }
        return promise.resolve();
    },

    // @method getContext @return OrderWizard.Module.TermsAndConditions.Context
    getContext: function() {
        // @class OrderWizard.Module.TermsAndConditions.Context
        return {
            // @property {Boolean} showCheckbox
            showCheckbox: this.options.show_checkbox,
            // @property {Boolean} isAgreeTermCondition
            isAgreeTermCondition: this.wizard.model.get('agreetermcondition'),
            // @property {Boolean} showWrapper
            showWrapper: !!this.options.showWrapper,
            // @property {String} wrapperClass
            wrapperClass: this.options.wrapperClass
        };
    }
});
