/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.PromocodeForm"/>
import * as _ from 'underscore';
import * as order_wizard_promocodeform_tpl from 'order_wizard_promocodeform.tpl';

import WizardModule = require('../../Wizard/JavaScript/Wizard.Module');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import CartPromocodeFormView = require('../../../Commons/Cart/JavaScript/Cart.PromocodeForm.View');

// @module OrderWizard.Module.PromocodeForm

// @class OrderWizard.Module.PromocodeForm @extends Wizard.Module
export = WizardModule.extend({
    // @property {Function} template
    template: order_wizard_promocodeform_tpl,

    // @property {Object} events
    events: {
        'shown [data-action="show-promo-code-container"]': 'onPromocodeFormShown'
    },

    // @method initialize
    initialize: function initialize() {
        WizardModule.prototype.initialize.apply(this, arguments);

        BackboneCompositeView.add(this);

        this.promocodeFormComponent = new CartPromocodeFormView({
            model: this.wizard.model,
            application: this.wizard.application
        });

        this.promocodeFormComponent.on(
            'applying_promocode',
            function() {
                this.isSaving = true;
                this.trigger('change_enable_continue', false);
            },
            this
        );

        // this.promocodeFormComponent.on('apply_promocode_finished', function ()
        this.promocodeFormComponent.on(
            'apply_promocode_failed',
            function() {
                this.isSaving = false;
                this.trigger('change_enable_continue', true);
            },
            this
        );

        this.promocodeFormComponent.on(
            'apply_promocode_succeeded',
            function() {
                this.isSaving = false;
                this.trigger('change_enable_continue', true);
                this.render();
            },
            this
        );
    },

    // @method render
    // @return {Void}
    render: function render() {
        if (this.state === 'present' && !this.isSaving) {
            this._render();
            this.trigger('ready', true);
        }
    },

    // @method onPromocodeFormShown Handles the shown of promocode form
    // @param {jQuery.Element} e
    // @return {Void}
    onPromocodeFormShown: function onPromocodeFormShown(e) {
        this.$(e.target)
            .find('input[name="promocode"]')
            .focus();
    },
    // @property {Object} childViews
    childViews: {
        'Cart.PromocodeForm': function() {
            return this.promocodeFormComponent;
        }
    },

    // @method getContext
    // @returns {OrderWizard.Module.PromocodeForm.Context}
    getContext: function getContext() {
        const promocodes = this.wizard.model.get('promocodes') || [];
        const promocodes_applied = _.filter(promocodes, function(promo: any) {
            return (
                (promo.isautoapplied == true && promo.isvalid == true) ||
                promo.isautoapplied == false
            );
        });

        // @class OrderWizard.Module.PromocodeForm.Context
        return {
            // @property {LiveOrder.Model} model
            model: this.wizard.model,
            // @property {Boolean} showPromocodeForm
            showPromocodeForm:
                Configuration.get('promocodes.allowMultiples', true) || !promocodes_applied.length
        };
        // @class OrderWizard.Module.PromocodeForm
    }
});
