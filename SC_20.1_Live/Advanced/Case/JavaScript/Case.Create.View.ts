/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Case.Create.View"/>

import { CaseModel } from './Case.Model';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as case_new_tpl from 'case_new.tpl';

import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';
import BackboneFormView = require('../../../Commons/Backbone.FormView/JavaScript/Backbone.FormView');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import CaseFieldsModel = require('./Case.Fields.Model');
import AjaxRequestsKiller = require('../../../Commons/AjaxRequestsKiller/JavaScript/AjaxRequestsKiller');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class Case.Create.View @extends Backbone.View
const CaseCreateView = BackboneView.extend({
    template: case_new_tpl,

    title: Utils.translate('How can we help you?'),

    page_header: Utils.translate('How can we help you?'),

    events: {
        'submit form': 'saveForm',
        'click [data-action="include_email"]': 'includeAnotherEmail',
        'keypress [data-action="text"]': 'preventEnter'
    },

    bindings: {
        '[name="title"]': 'title',
        '[name="category"]': 'category',
        '[name="message"]': 'message',
        '[name="email"]': 'email',
        '[name="include_email"]': 'include_email'
    },

    attributes: {
        id: 'NewCase',
        class: 'newCase'
    },

    initialize: function(options): void {
        this.application = options.application;
        this.fields = new CaseFieldsModel();
        this.model = new CaseModel();
        this.user = ProfileModel.getInstance();
        this.model.on('sync', jQuery.proxy(this, 'showSuccess'));

        this.model.set('isNewCase', true);

        BackboneFormView.add(this);
    },

    beforeShowContent: function() {
        return this.fields.fetch({
            killerId: AjaxRequestsKiller.getKillerId()
        });
    },

    // Prevents not desired behaviour when hitting enter
    preventEnter: function(event): void {
        if (event.keyCode === 13) {
            event.preventDefault();
        }
    },

    // @method getSelectedMenu
    getSelectedMenu: function(): string {
        return 'newcase';
    },
    // @method getBreadcrumbPages
    getBreadcrumbPages: function() {
        return {
            text: this.title,
            href: '/newcase'
        };
    },

    showSuccess: function(): void {
        const case_link_name = Utils.translate('support case #$(0)', this.model.get('caseNumber'));
        const new_case_internalid = this.model.get('internalid');
        const new_case_message = Utils.translate(
            'Good! your <a href="/cases/$(0)">$(1)</a> was submitted. We will contact you briefly.',
            new_case_internalid,
            case_link_name
        );

        this.newCaseId = new_case_internalid;
        this.newCaseMessage = new_case_message;

        Backbone.history.navigate('cases', { trigger: true });
    },

    includeAnotherEmail: function(): void {
        const email_input = this.$('[data-case-email]');
        const status = email_input.prop('disabled');

        email_input.prop('disabled', !status);

        this.$('[data-collapse-content]').collapse(status ? 'show' : 'hide');
    },

    // @method getContext @return Case.Create.View.Context
    getContext: function() {
        // @class Case.Create.View.Context
        return {
            // @property {String} pageHeader
            pageHeader: this.page_header,
            // @property {Array<Object{text:String,id:Number}>} categories
            categories: this.fields.get('categories'),
            // @property {Boolean} showBackToAccount
            showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD'
        };
    }
});

export = CaseCreateView;
