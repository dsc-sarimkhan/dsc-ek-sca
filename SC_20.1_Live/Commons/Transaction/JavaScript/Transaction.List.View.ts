/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Transaction.List.View"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');
import Backbone = require('../../Utilities/JavaScript/backbone.custom');
import Configuration = require('../../Utilities/JavaScript/SC.Configuration');

const TransactionListView: any = BackboneView.extend({
    _buildColumns: function(selectedColumns, transaction) {
        function createColumn(transaction, column) {
            switch (column.id) {
                case 'origin':
                    return {
                        label: Utils.translate(column.label),
                        type: 'origin',
                        name: 'origin',
                        value: (<any>_.findWhere(
                            Configuration.get('transactionRecordOriginMapping'),
                            {
                                origin: transaction.get('origin')
                            }
                        )).name
                    };
                case 'status':
                    var value;
                    if (!transaction.get('status')) {
                        value = transaction.get('entitystatus').name;
                    } else {
                        value = transaction.get('status').name;
                    }
                    return {
                        label: Utils.translate(column.label),
                        type: 'status',
                        name: 'status',
                        value: value
                    };
                case 'amount':
                    return {
                        label: Utils.translate(column.label),
                        type: 'currency',
                        name: 'amount',
                        value: transaction.get('amount_formatted')
                    };
                default:
                    var init: any = {
                        label: Utils.translate(column.label),
                        value: transaction.get(column.id)
                    };

                    if (column.type) {
                        init.type = column.type;
                    } else {
                        init.type = 'custom';
                    }

                    if (column.name) {
                        init.name = column.name;
                    } else {
                        init.name = column.id;
                    }
                    return init;
            }
        }
        const initializedColumns = [];

        _.each(selectedColumns, function(column: any) {
            if (!column.composite) {
                initializedColumns.push(createColumn(transaction, column));
            } else {
                const composite = Utils.requireModules(column.composite);
                let model;

                if (column.fields) {
                    const modelFields = {};
                    _.each(column.fields, function(field: any) {
                        const transactionField =
                            transaction.get(field.toLowerCase()) || transaction.get(field); // Some attributes can be returned from the services in camelcase format
                        modelFields[field] = transactionField;
                    });
                    model = new Backbone.Model(modelFields);
                } else {
                    model = transaction;
                }

                const initialized = {
                    label: _(column.label),
                    type: column.type,
                    name: column.id,
                    compositeKey: column.compositeKey,
                    composite: new composite({ model: model })
                };

                initializedColumns.push(initialized);
            }
        });

        return initializedColumns;
    }
});

export = TransactionListView;
