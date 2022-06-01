/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="LiveOrder.Line.Collection"/>

import * as _ from 'underscore';

import * as Utils from '../../Utilities/JavaScript/Utils';

import TransactionLineCollection = require('../../../Commons/Transaction/JavaScript/Transaction.Line.Collection');
import LiveOrderLineModel = require('../../../Commons/LiveOrder/JavaScript/LiveOrder.Line.Model');
import Backbone = require('../../Core/JavaScript/backbone/backbone');

export = TransactionLineCollection.extend({
    model: LiveOrderLineModel,

    url: Utils.getAbsoluteUrl('services/LiveOrder.Line.Service.ss'),
    sync: function(...args) {
        return Backbone.sync.apply(this, args).always(
            _.bind(function(body, status, xhr) {
                try {
                    if (xhr.getResponseHeader) {
                        this.addOperationId(xhr.getResponseHeader('x-n-operationid'));
                    }
                } catch (e) {
                    console.error('Error fetching Operation Id from header.');
                }
            }, this)
        );
    },

    addOperationId: function(ids) {
        if (!this.operationIds || !Array.isArray(this.operationIds)) {
            this.operationIds = [];
        }

        if (Array.isArray(ids)) {
            this.operationIds = this.operationIds.concat(ids);
        } else {
            this.operationIds.push(ids);
        }
    },

    getOperationIds: function() {
        return this.operationIds;
    },
    getLatestOperationIds: function(lastOperationIdIndex) {
        return this.getOperationIds().slice(lastOperationIdIndex);
    }
});
