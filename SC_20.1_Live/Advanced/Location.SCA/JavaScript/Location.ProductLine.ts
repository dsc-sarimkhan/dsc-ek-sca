/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Location.ProductLine"/>

import * as _ from 'underscore';

import ProductModel = require('../../../Commons/Product/JavaScript/Product.Model');
import TransactionLineModel = require('../../../Commons/Transaction/JavaScript/Transaction.Line.Model');
import ProductLineCommon = require('../../../Commons/ProductLine/JavaScript/ProductLine.Common');
import LocationModel = require('./Location.Model');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

const initialize_location = function(attributes) {
    this.on('change:location', function(model, location) {
        let value;

        if (location instanceof LocationModel || location instanceof Backbone.Model) {
            value = location.clone();
        } else if (_.isObject(location)) {
            value = new LocationModel(location);
        } else {
            value = new LocationModel({ internalid: location });
        }

        model.set('location', value, { silent: true });
    });

    this.trigger('change:location', this, (attributes && attributes.location) || {});
};

const original_product_model_initialize_fn = ProductModel.prototype.initialize;

ProductModel.prototype.initialize = function initialize() {
    original_product_model_initialize_fn.apply(this, arguments);

    initialize_location.apply(this, arguments);
};

const original_transaction_line_model_initialize_fn = TransactionLineModel.prototype.initialize;

TransactionLineModel.prototype.initialize = function initialize() {
    original_transaction_line_model_initialize_fn.apply(this, arguments);

    initialize_location.apply(this, arguments);
};

const original_to_json_product_line_common_fn = ProductLineCommon.toJSON;

ProductLineCommon.toJSON = function toJSON() {
    const result = original_to_json_product_line_common_fn.apply(this, arguments);

    // @class Transaction.Line.Model.JSON
    // @property {Object} location
    result.location =
        (this.attributes.location &&
            this.attributes.location.attributes &&
            this.attributes.location.attributes.internalid) ||
        '';
    // @property {Object} fulfillmentChoice
    result.fulfillmentChoice = this.attributes.fulfillmentChoice || 'ship';

    return result;
};
