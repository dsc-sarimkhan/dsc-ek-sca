/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PrintStatement.Model"/>

import * as _ from 'underscore';
import '../../../Commons/BackboneExtras/JavaScript/Backbone.Sync';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import BackboneModel = require('../../../Commons/BackboneExtras/JavaScript/Backbone.Model');

function parseDate(value) {
    if (value && value.replace) {
        return new Date(value.replace(/-/g, '/')).getTime();
    }
    return new Date(value).getTime();
}

function validateStatementDate(value) {
    if (!value || isNaN(parseDate(value))) {
        return Utils.translate('Invalid Statement date');
    }
}

function validateStartDate(value) {
    if (value) {
        if (isNaN(parseDate(value))) {
            return Utils.translate('Invalid Start date');
        }
    }
}

// @class PrintStatement.Model @extends Backbone.Model
const PrintStatementModel: any = BackboneModel.extend({
    validation: {
        statementDate: { fn: validateStatementDate },

        startDate: { fn: validateStartDate }
    },

    // @property {String} urlRoot
    urlRoot: 'services/PrintStatement.Service.ss',

    // @method parse
    parse: function(result) {
        return result;
    }
});

export = PrintStatementModel;
