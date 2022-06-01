/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PrintStatement.View"/>

import '../../../Commons/Backbone.FormView/JavaScript/Backbone.FormView';
import * as _ from 'underscore';
import '../../../Commons/jQueryExtras/JavaScript/jQuery.serializeObject';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as print_statement_tpl from 'print_statement.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import PrintStatementModel = require('./PrintStatement.Model');

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

// @class PrintStatement.View @extends BackboneView
const PrintStatementView: any = BackboneView.extend({
    // @property {Function} template
    template: print_statement_tpl,

    // @property {String} title
    title: Utils.translate('Print a Statement'),

    // @property {String} page_header
    page_header: Utils.translate('Print a Statement'),

    // @property {Object} attributes
    attributes: {
        id: 'PrintStatement',
        class: 'PrintStatement'
    },

    // @property {Object} events
    events: {
        'submit form': 'printAction',
        'click [data-action="email"]': 'emailAction',
        'click i.print-statement-form-input-icon': 'imgPickerAction'
    },

    // @method initialize
    initialize: function(options) {
        this.application = options.application;
        this.model = options.model || new PrintStatementModel();

        Backbone.Validation.bind(this);
    },

    beforeShowContent: function beforeShowContent() {
        const promise = jQuery.Deferred();

        if (SC.ENVIRONMENT.permissions.transactions.tranStatement === 2) {
            promise.resolve();
        } else {
            promise.reject();
            this.application.getLayout().forbiddenError();
        }

        return promise;
    },

    // @method getSelectedMenu
    getSelectedMenu: function(): string {
        return 'printstatement';
    },
    // @method getBreadcrumbPages
    getBreadcrumbPages: function() {
        return {
            text: Utils.translate('Print Statement'),
            href: '/printstatement'
        };
    },
    // @method printAction
    printAction: function(e) {
        this.printStatement(e, false);
    },
    // @method emailAction
    emailAction: function(e) {
        const self = this;

        this.printStatement(e, true, function(response) {
            jQuery.ajax(response.url).done(function() {
                self.showError(Utils.translate('Email sent successfully'), 'success');
            });
        });
    },
    // @method imgPickerAction
    imgPickerAction: function(e) {
        (<any>jQuery(e.target)
            .parent()
            .find('input')).datepicker('show');
    },
    // @method printStatement
    printStatement: function(e, email, callback) {
        e.preventDefault();
        this.hideError();

        this.model.set('statementDate', this.$('[name="statementDate"]').val());
        this.model.set('startDate', this.$('[name="startDate"]').val());

        if (this.model.isValid(true)) {
            const data = (<any>jQuery(e.target).closest('form')).serializeObject();
            const statementDate = new Date(data.statementDate.replace(/-/g, '/')).getTime();
            const startDate = new Date(data.startDate.replace(/-/g, '/')).getTime();

            data.email = email ? true : null;

            if (!((data.startDate && isNaN(startDate)) || isNaN(statementDate))) {
                data.statementDate = statementDate;

                if (data.startDate) {
                    data.startDate = startDate;
                }

                if (email) {
                    const save_promise = this.saveForm(e, this.model, data);
                    save_promise && save_promise.done(callback);
                } else {
                    data.asset = 'print-statement';
                    window.open(Utils.getDownloadPdfUrl(data));
                }
            }
        }
    },
    // @method getContext @returns PrintStatement.View.Context
    getContext: function() {
        // @class PrintStatement.View.Context
        return {
            // @property {String} pageHeader
            pageHeader: this.page_header,
            // @property {Boolean} showBackToAccount
            showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD'
        };
    }
});

export = PrintStatementView;
