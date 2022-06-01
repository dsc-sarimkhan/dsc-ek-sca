/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Backbone.View.saveForm"/>

import * as _ from 'underscore';
import * as jQuery from '../../Core/JavaScript/jQuery';

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

/*
@module BackboneExtras
#Backbone.View.saveForm
extends native Backbone.View with a custom saveForm function to be called when forms are submited
@obsolete please use Backbone.FormView
*/
_.extend(BackboneView.prototype, {
    // @module Backbone @class Backbone.View @method saveForm
    // will serialize the input of some form and save() the given model using it
    // @param {HTMLEvent} e @param {Backbone.Model} model @param {Object} props properties to pass to model.save()
    // @return {jQuery.Deferred}
    // @obsolete Please use @?ref Backbone.FormView
    saveForm: function(e, model, props) {
        e.preventDefault();

        model = model || this.model;

        this.$savingForm = jQuery(e.target).closest('form');

        if (this.$savingForm.length) {
            // Disables all for submit buttons, to prevent double submitions
            this.$savingForm
                .find('input[type="submit"], button[type="submit"]')
                .attr('disabled', true);
            // and hides reset buttons
            this.$savingForm.find('input[type="reset"], button[type="reset"]').hide();
        }

        this.hideError();

        const self = this;

        // Returns the promise of the save acction of the model
        return model.save(props || this.$savingForm.serializeObject(), {
            wait: true,

            // Hides error messages, re enables buttons and triggers the save event
            // if we are in a modal this also closes it
            success: function(model, response) {
                if (self.inModal && self.$containerModal) {
                    self.$containerModal
                        .removeClass('fade')
                        .modal('hide')
                        .data('bs.modal', null);
                }

                if (self.$savingForm.length) {
                    self.hideError(self.$savingForm);
                    self.$savingForm
                        .find('[type="submit"], [type="reset"]')
                        .attr('disabled', false);
                    model.trigger('save', model, response);
                }
            },

            // Re enables all button and shows an error message
            error: function(model, response) {
                self.$savingForm.find('*[type=submit], *[type=reset]').attr('disabled', false);

                if (response.responseText) {
                    model.trigger('error', jQuery.parseJSON(response.responseText || 'null'));
                }
            }
        });
    }
});

export = BackboneView.prototype.saveForm;
