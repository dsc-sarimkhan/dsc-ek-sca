/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Case.Detail.View"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />

import * as _ from 'underscore';
import { CaseModel } from './Case.Model';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import * as case_detail_tpl from 'case_detail.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import CaseFieldsModel = require('./Case.Fields.Model');

import AjaxRequestsKiller = require('../../../Commons/AjaxRequestsKiller/JavaScript/AjaxRequestsKiller');
import BackboneFormView = require('../../../Commons/Backbone.FormView/JavaScript/Backbone.FormView');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
// @class Case.Details.View @extends Backbone.View
const CaseDetailView = BackboneView.extend({
    template: case_detail_tpl,

    title: Utils.translate('Case Details'),

    bindings: {
        '[name="reply"]': 'reply'
    },

    initialize: function(options): void {
        this.application = options.application;
        this.fields = new CaseFieldsModel();
        this.user = ProfileModel.getInstance();
        this.model = new CaseModel();
        const [caseInternalId] = options.routerArguments;
        this.model.set('internalid', caseInternalId);

        BackboneFormView.add(this);
        this.model.on('saveCompleted', _.bind(this.alertOnSave, this));
    },

    beforeShowContent: function(): any {
        return jQuery.when(
            this.model.fetch({
                killerId: AjaxRequestsKiller.getKillerId()
            }),
            this.fields.fetch({
                killerId: AjaxRequestsKiller.getKillerId()
            })
        );
    },

    // @method getSelectedMenu
    getSelectedMenu: function(): string {
        return 'cases';
    },

    // @method getBreadcrumbPages
    getBreadcrumbPages: function() {
        return [
            {
                text: Utils.translate('Support Cases'),
                href: '/cases'
            },
            {
                text: Utils.translate('Case #$(0)', this.model.get('internalid')),
                href: '/case/' + this.model.get('internalid')
            }
        ];
    },

    events: {
        'submit form': 'saveForm',
        'click [data-action="reset"]': 'resetForm',
        'click [data-action="close-case"]': 'closeCase'
    },

    alertOnSave: function(): void {
        this.showContent().then(() => {
            this.showConfirmationMessage(
                Utils.translate(
                    'Good! Your message was sent. A support representative should contact you briefly.'
                )
            );
            jQuery('#reply').val('');
        });
    },

    attributes: {
        class: 'caseDetail'
    },

    closeCase: function(event): void {
        event.preventDefault();

        const self = this;

        this.model.isClosing = true;
        this.model.set('reply', '');
        this.model.set('status', { id: SC.ENVIRONMENT.CASES_CONFIG.defaultValues.statusClose.id });
        this.model.save().done(function() {
            self.model.isClosing = false;
            self.showContent().then(() => {
                self.showConfirmationMessage(Utils.translate('Case successfully closed'));
                jQuery('#reply').val('');
            });
        });
    },

    resetForm: function(e): void {
        e.preventDefault();
        this.showContent();
    },

    // @method getContext @return Case.Details.View.Context
    getContext: function() {
        _.each(this.model.get('grouped_messages'), function(group_message: any) {
            _.each(group_message.messages, function(message: any) {
                message.text = Utils.parseRichText(message.text);
            });
        });
        // @class Case.Details.View.Context
        return {
            // @property {Case.Model} model
            model: this.model,
            // @property {String} pageHeader
            pageHeader: Utils.translate('Case #$(0):', this.model.get('caseNumber')),
            // @property {Boolean} collapseElements
            collapseElements: Configuration.get('sca.collapseElements'),
            // @property {Boolean} closeStatusId
            closeStatusId:
                this.model.get('status').id !==
                SC.ENVIRONMENT.CASES_CONFIG.defaultValues.statusClose.id
        };
    }
});

export = CaseDetailView;
