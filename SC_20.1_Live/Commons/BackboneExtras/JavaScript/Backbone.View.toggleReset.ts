/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Backbone.View.toggleReset"/>

import * as _ from 'underscore';
import * as jQuery from '../../Core/JavaScript/jQuery';

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// Backbone.View.toggleReset.js
// -----------------------
// @module Backbone @class Backbone.View @method toggleReset
// Backbones' view extension for showing/hiding a "reset" button that restore all form's fields that have changed
// You have to assign the change event of the inputs of a form to call this function
// For example in the "events" array of a view:
//
//		'change form' : 'toggleReset'
//

_.extend(BackboneView.prototype, {
    // the "debounce" add a small delay between the eventr and the function triggering
    // it's useful when the user is writting so we don't trigger the event after every keypress
    toggleReset: _.debounce(function(e) {
        const $form = jQuery(e.target).closest('form');
        const { model } = this;
        let attribute;
        let value;
        // look for the changed fields
        const fields_changed = _.filter((<any>$form).serializeObject(), function(item: any, key) {
            attribute = model.get(key);
            value = String(item).trim();

            return attribute ? attribute !== value : !!value;
        });

        // if some field changed, the reset button is shown
        $form
            .find('[data-action="reset"]')
            [fields_changed.length ? 'removeClass' : 'addClass']('hide');

        return this;
    }, 300)
});

export = BackboneView.prototype.toggleReset;
