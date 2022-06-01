/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Backbone.Model"/>
import '../../Utilities/JavaScript/backbone.validation';
import * as _ from 'underscore';

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import SCCancelableEvents = require('../../SC/JavaScript/SC.CancelableEvents');
_.extend(
    Backbone.Model.prototype,
    {
        // @method url SCA Overrides @?method Backbone.Model.url
        // to add model's 'internalid' as parameter @return {String}
        url: function() {
            const base = _.result(this, 'urlRoot') || _.result(this.collection, 'url');

            if (this.isNew()) {
                return base;
            }
            const sep = base.indexOf('?') === -1 ? '?' : '&';
            return base + sep + 'internalid=' + encodeURIComponent(this.id);
        },

        deepCopy: function deepCopy() {
            return this.attributes || {};
        },

        // @method url SCA Overrides @?property Backbone.Model.idAttribute
        // to add model's 'internalid' as parameter @return {String}
        idAttribute: 'internalid',

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
    },
    SCCancelableEvents
);

const BackboneModel: any = Backbone.Model;
export = BackboneModel;
