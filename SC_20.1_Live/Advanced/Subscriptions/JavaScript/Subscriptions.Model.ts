/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Subscriptions.Model"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />

import * as _ from 'underscore';

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import SubscriptionLineCollection = require('./Subscriptions.Line.Collection');

// @class Subscriptions.Model
// Model for showing information about past orders @extend Transaction.Model
const SubscriptionsModel: any = Backbone.CachedModel.extend({
    // @property {String} urlRoot
    urlRoot: Utils.getAbsoluteUrl('SC/Subscriptions/Subscriptions.ss', true),

    // @property {Boolean} cacheSupport
    // enable or disable the support for cache (Backbone.CachedModel)
    cacheSupport: true,

    initialize: function() {
        this.on('change:nonIncludedLinesCollection', function(model, lines) {
            if (!!lines.length) {
                model.set('nonIncludedLinesCollection', new SubscriptionLineCollection(lines), {
                    silent: true
                });
            }
        });

        this.on('change:optionalSubscriptionLines', function(model, lines) {
            if (!!lines.length) {
                model.set('optionalSubscriptionLines', new SubscriptionLineCollection(lines), {
                    silent: true
                });
            }
        });

        this.on('change:requiredSubscriptionLines', function(model, lines) {
            if (!!lines.length) {
                model.set('requiredSubscriptionLines', new SubscriptionLineCollection(lines), {
                    silent: true
                });
            }
        });
    },

    getTypeUrl: function() {
        const record_root_url = '/subscription';

        return record_root_url + '/' + this.get('internalId');
    },

    getStatusLabel: function() {
        if (this.get('isProcessing') || this.get('status') === 'PENDING_ACTIVATION') {
            return 'PROCESSING';
        } else {
            return this.get('status');
        }
    },

    findLineInUnifiedCollection: function findLineInUnifiedCollection(internalId: number) {
        const ALLCOLLECTIONSINONE = [];
        ALLCOLLECTIONSINONE.push(...this.get('nonIncludedLinesCollection').models);
        ALLCOLLECTIONSINONE.push(...this.get('optionalSubscriptionLines').models);
        ALLCOLLECTIONSINONE.push(...this.get('requiredSubscriptionLines').models);

        return _.find(ALLCOLLECTIONSINONE, function(item) {
            return item.get('internalId') === internalId;
        });
    },

    hasAddOnByLineNumber(lineNumber: number): boolean {
        return !_.isUndefined(
            _.find(this.get('optionalSubscriptionLines').models, (item: any) => {
                return item.get('lineNumber') === lineNumber;
            })
        );
    }
});

export = SubscriptionsModel;
