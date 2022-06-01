/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Product.Option.Model"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';

import ProductLineOptionModel = require('../../ProductLine/JavaScript/ProductLine.Option.Model');
import Backbone = require('../../Utilities/JavaScript/backbone.custom');
import jQuery = require('../../Core/JavaScript/jQuery');

// @class Product.Option.Model @extend ProductLine.Option.Model
export = ProductLineOptionModel.extend({
    // @method initialize Override default method to convert the current model "validate-able"
    // @return {Void}
    initialize: function initialize() {
        ProductLineOptionModel.prototype.initialize.apply(this, arguments);

        // Extend the model with Backbone.Validation.mixin to validate it without a View
        _.extend(this, Backbone.Validation.mixin);
    },

    // @property {Object} validation
    validation: {
        'value.internalid': {
            fn: function optionValueValidator() {
                const value = this.get('value') && this.get('value').internalid;

                if (this.get('isMandatory') && !value) {
                    return Utils.translate('Please specify a value for this option');
                }
                if (value) {
                    const max_length = 160;

                    if (this.get('type') === 'text' || this.get('type') === 'textarea') {
                        if (
                            this.get('isMandatory') &&
                            (!String(value).trim() || value.length > max_length)
                        ) {
                            return Utils.translate('Please enter a valid input for this string');
                        }
                        if (value.length > max_length) {
                            return Utils.translate(
                                'Please enter a string shorter (maximum length: $(0))',
                                max_length
                            );
                        }
                    } else if (
                        this.get('type') === 'email' &&
                        !Backbone.Validation.patterns.email.test(value)
                    ) {
                        return Utils.translate('Please enter a valid email');
                    } else if (
                        this.get('type') === 'integer' &&
                        !Backbone.Validation.patterns.netsuiteInteger.test(value)
                    ) {
                        return Utils.translate('Please enter a valid integer number');
                    } else if (
                        this.get('type') === 'float' &&
                        !Backbone.Validation.patterns.netsuiteFloat.test(value)
                    ) {
                        return Utils.translate('Please enter a valid decimal number');
                    } else if (
                        this.get('type') === 'currency' &&
                        !Backbone.Validation.patterns.netsuiteFloat.test(value)
                    ) {
                        return Utils.translate('Please enter a valid currency number');
                    } else if (
                        this.get('type') === 'phone' &&
                        !Backbone.Validation.patterns.netsuitePhone.test(value)
                    ) {
                        return Utils.translate('Please enter a valid phone');
                    } else if (
                        this.get('type') === 'percent' &&
                        !Backbone.Validation.patterns.netsuitePercent.test(value)
                    ) {
                        return Utils.translate('Please enter a valid percent');
                    } else if (
                        this.get('type') === 'url' &&
                        !Backbone.Validation.patterns.netsuiteUrl.test(value)
                    ) {
                        return Utils.translate('Please enter a valid url');
                    } else if (
                        this.get('type') === 'select' &&
                        !_.findWhere(this.get('values'), { internalid: value })
                    ) {
                        return Utils.translate('Please select a valid value for this option');
                    }
                }
            }
        }
    }
});
