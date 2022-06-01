/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="RequestQuoteWizard.Module.Comments"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as requestquote_wizard_module_comments_tpl from 'requestquote_wizard_module_comments.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import WizardModule = require('../../Wizard/JavaScript/Wizard.Module');

// @class RequestQuoteWizard.Module.Comments @extend Wizard.Module
export = WizardModule.extend({
    // @property {Function} template
    template: requestquote_wizard_module_comments_tpl,

    // @property {Object} events
    events: {
        'keyup [data-action="validate-textarea-length"]': 'validateTextareaLength'
    },

    // @method getMaxLength Auxiliary method to return the max allowed character length
    // @return {Number}
    getMaxLength: function() {
        return _.isNumber(this.options.maxLength) ? this.options.maxLength : 999;
    },

    // @method validateTextareaLength Auxiliary function to control the max length on the text are on IE8
    // It doesnt return anything as it will set the new string when the value exceed the max allowed
    // @return {Void}
    validateTextareaLength: function() {
        const text = this.$('[data-action="validate-textarea-length"]').val();
        const limit = this.getMaxLength();

        if (text.length > limit) {
            this.$('[data-action="validate-textarea-length"]').val(text.substr(0, limit));
        }
    },

    // @method submit Set the memo of the current transaction
    // @returns {jQuery.Deferred}
    submit: function() {
        this.wizard.model.set('memo', this.$('[data-type="memo-input"]').val());
        return jQuery.Deferred().resolve();
    },

    // @method getContext
    // @return {RequestQuoteWizard.Module.Comments.Context}
    getContext: function() {
        // @class RequestQuoteWizard.Module.Comments.Context
        return {
            // @property {Boolean} showTitle
            showTitle: !!(!this.options.hide_title && this.getTitle()),
            // @property {String} title
            title: this.getTitle(),
            // @property {String} memo
            memo: this.wizard.model.get('memo'),
            // @property {Boolean} isReadOnly
            isReadOnly: !!this.options.is_read_only,
            // @property {Boolean} hideContent
            hideContent: this.options.is_read_only && !this.wizard.model.get('memo'),
            // @property {Number} maxLength
            maxLength: this.getMaxLength()
        };
        // @class RequestQuoteWizard.Module.Comments
    }
});
