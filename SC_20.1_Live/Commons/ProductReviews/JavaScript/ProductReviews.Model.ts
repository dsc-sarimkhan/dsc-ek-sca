/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductReviews.Model"/>

import * as Utils from '../../Utilities/JavaScript/Utils';

import BackboneCachedModel = require('../../BackboneExtras/JavaScript/Backbone.CachedModel');
import Cookies = require('../../../Commons/Utilities/JavaScript/js.cookie');

// @class ProductReviews.Model It returns a new instance of a Backbone CachedModel
// initializes writer and rating per attribute if null or undefined
// @extends Backbone.CachedModel
export = BackboneCachedModel.extend({
    urlRoot: Utils.getAbsoluteUrl('services/ProductReviews.Service.ss'),
    // conditions for each of the fields to be valid
    // [Backbone.Validation](https://github.com/thedersen/backbone.validation)
    validation: {
        rating: {
            required: true,
            msg: Utils.translate('Rating is required')
        },
        title: {
            fn: function(value) {
                if (!value) {
                    return Utils.translate('Title is required');
                }

                if (value.length >= 199) {
                    return Utils.translate(
                        'The field name cannot contain more than the maximum number (199) of characters allowed.'
                    );
                }
            }
        },
        text: {
            fn: function(value) {
                if (!value) {
                    return Utils.translate('Text is required');
                }

                if (value.length > 1000) {
                    return Utils.translate(
                        'The review field cannot contain more than the maximum number (1000) of characters allowed.'
                    );
                }
            }
        },
        writerName: {
            required: true,
            msg: Utils.translate('Writer is required')
        }
    },

    parse: function(response) {
        response.rated = JSON.parse(Cookies.get('votedReviewsId') || '{}')[response.internalid];
        return response;
    }
});
