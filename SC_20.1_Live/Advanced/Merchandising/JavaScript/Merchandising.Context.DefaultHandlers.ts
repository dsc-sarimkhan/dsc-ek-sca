/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Merchandising.Context.DefaultHandlers">
import * as _ from 'underscore';

import MerchandisingContext = require('./Merchandising.Context');
import FacetsBrowseView = require('../../../Commons/Facets/JavaScript/Facets.Browse.View');
import ProductDetailsBaseView = require('../../../Commons/ProductDetails/JavaScript/ProductDetails.Base.View');
import CartDetailedView = require('../../../Commons/Cart/JavaScript/Cart.Detailed.View');
import CartConfirmationView = require('../../../Commons/Cart/JavaScript/Cart.Confirmation.View');

/*
@module Merchandising
@class Merchandising.DefaultContextHandlers
Registers a set of 'default handlers', this handlers are called depending on the execution context (current view they are in when being called)

The following handlers are required for correct functionality of the Merchandising Zone module:

 * getFilterValues - returns an array with the values of a specific filter in the current view
 * getIdItemsToExclude - returns an array with the ids of the items in the current view

@extends ApplicationModule
*/

var DefaultContextHandlers = {
    // @method mergeFilterValues
    mergeFilterValues: function(current_values, facet_values) {
        return _.union(
            _.reject(current_values, function(value) {
                return value === '$current';
            }),

            facet_values || []
        );
    },
    // @method parseValues
    // @param {Object} filters
    // @param {Function} callback
    parseValues: function(filters, callback) {
        _.each(filters, function(values: any, key) {
            values = DefaultContextHandlers.mergeFilterValues(values, callback(values, key));

            if (values.length) {
                _.each(values, function(value) {
                    (<any>MerchandisingContext).appendFilterValue(filters, key, value);
                });
            } else {
                delete filters[key];
            }
        });

        return filters;
    },

    // @method includeFacetsToFilters
    // @param {Array} facets
    // @param {Object} filters
    includeFacetsToFilters: function(facets, filters) {
        let facet_id = '';
        let facet_values = [];

        _.each(facets, function(facet: any) {
            facet_id = facet.id;
            facet_values = facet.value;

            facet_values = _.isArray(facet_values) ? facet_values : [facet_values];

            if (filters.hasOwnProperty(facet_id)) {
                facet_values = _.union(filters[facet_id], facet_values);
            }

            filters[facet_id] = facet_values;
        });

        return filters;
    },

    // @property {Merchandising.Context.Handler} itemListHandlers
    itemListHandlers: {
        getFilters: function(filters, isWithin) {
            const { facets } = this.view.translator;

            if (isWithin) {
                filters = DefaultContextHandlers.includeFacetsToFilters(facets, filters);
            }

            return DefaultContextHandlers.parseValues(filters, function(values, key) {
                let facet_values = [];

                if (_.contains(values, '$current')) {
                    const current_facet: any = _.findWhere(facets, { id: key });

                    facet_values = (current_facet && current_facet.value) || [];

                    if (!_.isArray(facet_values)) {
                        facet_values = [facet_values];
                    }
                }

                return facet_values;
            });
        },

        getIdItemsToExclude: function() {
            return this.view.model.get('items').pluck('internalid');
        }
    },

    // @method getItemValues
    // @param {Array} facets
    // @param {String} field_id
    // @return {Array<String>}
    getItemValues: function(facets, field_id) {
        const itemValues = (<any>_.findWhere(facets, { id: field_id })).values;
        return _.pluck(itemValues, 'url');
    },

    // @property {Merchandising.Context.Handler} productDetailsHandlers
    productDetailsHandlers: {
        // depending on the item's attributes
        getFilters: function(filters, isWithin) {
            const facets = this.view.model.get('facets');

            return DefaultContextHandlers.parseValues(filters, function(values, key) {
                if (isWithin || _.contains(values, '$current')) {
                    return DefaultContextHandlers.getItemValues(facets, key);
                }
            });
        },

        // there is only one it, we return its id
        // notice: we are returning it inside of an array
        getIdItemsToExclude: function() {
            return [this.view.model.getItemId()];
        }
    },

    // @method getCartLineItemValue
    // @param {Transaction.Line.Model} line
    // @param {String} field_id
    getCartLineItemValue: function(line, filter_id) {
        let value = line.get('item').get(filter_id);
        const selected_option = line.get('options').findWhere({ itemOptionId: filter_id });

        if (!value) {
            value = selected_option ? selected_option.get('label') : null;
        }

        return value;
    },

    // @method getCartItemValues returns an array with the values
    // @param {Transaction.Line.Collection} lines
    // @param {String} field_id
    // @return {Array<String>}
    getCartItemValues: function(lines, filter_id) {
        return _.compact(
            lines.map(function(line) {
                return (<any>MerchandisingContext).escapeValue(
                    DefaultContextHandlers.getCartLineItemValue(line, filter_id)
                );
            })
        );
    },

    // @property {Merchandising.Context.Handler} cartDetailedHandlers
    cartDetailedHandlers: {
        getFilters: function(filters, isWithin) {
            const lines = this.view.model.get('lines');

            return DefaultContextHandlers.parseValues(filters, function(values, key) {
                if (isWithin || _.contains(values, '$current')) {
                    return DefaultContextHandlers.getCartItemValues(lines, key);
                }
            });
        },

        // for each if the lines in the cart, we return either:
        // * the id of the matrix parent, if its a matrix
        // * the id of the line.item, if its not
        getIdItemsToExclude: function() {
            let item = null;

            return this.view.model.get('lines').map(function(line) {
                item = line.get('item');

                return item.get('_matrixParent').get('_id') || item.get('_id');
            });
        }
    },

    // @property {Merchandising.Context.Handler} cartConfirmationHandlers
    cartConfirmationHandlers: {
        // returns the value of the attribute in the view's line item
        getFilters: function(filters, isWithin) {
            const line = this.view.model;

            return DefaultContextHandlers.parseValues(filters, function(values, key) {
                if (isWithin || _.contains(values, '$current')) {
                    return (<any>MerchandisingContext).escapeValue(
                        DefaultContextHandlers.getCartLineItemValue(line, key)
                    );
                }
            });
        },

        // returns either the matrix parent id or the item id
        // of the view's line item
        getIdItemsToExclude: function() {
            const item = this.view.model.get('item');
            return [item.get('_matrixParent').get('_id') || item.get('_id')];
        }
    },

    mountToApp: function() {
        (<any>MerchandisingContext)
            .registerHandlers(FacetsBrowseView, this.itemListHandlers)
            .registerHandlers(ProductDetailsBaseView, this.productDetailsHandlers)
            .registerHandlers(CartDetailedView, this.cartDetailedHandlers)
            .registerHandlers(CartConfirmationView, this.cartConfirmationHandlers);

        return this;
    }
};

export = DefaultContextHandlers;

// @class Merchandising.Context.Handler This class defines the API used to interact with a particular view.
// @method getFilters
// @param {Object} filters
// @param {Boolean} isWithin Indicate if the specified filter should be applied on the current selections. This value is shown as 'APPLY ON CURRENT SELECTIONS' in the NS Backend
// @return {Object}
//
// @method getIdItemsToExclude
