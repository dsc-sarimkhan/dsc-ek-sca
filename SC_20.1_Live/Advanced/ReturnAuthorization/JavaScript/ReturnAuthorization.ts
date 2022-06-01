/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ReturnAuthorization"/>
// @module ReturnAuthorization

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import ReturnAuthorizationListView = require('./ReturnAuthorization.List.View');
import ReturnAuthorizationDetailView = require('./ReturnAuthorization.Detail.View');
import ReturnAuthorizationFormView = require('./ReturnAuthorization.Form.View');
import ReturnAuthorizationConfirmationView = require('./ReturnAuthorization.Confirmation.View');

// Defines the Return Authorization module (Model, Collection, Views, Router)
const ReturnAuthorization: any = {
    mountToApp: function(application) {
        const pageType = application.getComponent('PageType');
        pageType.registerPageType({
            name: 'ReturnsHistory',
            routes: ['returns', 'returns?:options'],
            view: ReturnAuthorizationListView,
            defaultTemplate: {
                name: 'return_authorization_list.tpl',
                displayName: 'Return authorization list default',
                thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                    'img/default-layout-transaction-list.png'
                )
            }
        });
        pageType.registerPageType({
            name: 'ReturnsDetail',
            routes: ['returns/:recordtype/:id', 'returns/:recordtype/:id?:options'],
            view: ReturnAuthorizationDetailView,
            defaultTemplate: {
                name: 'return_authorization_detail.tpl',
                displayName: 'Return authorization details default',
                thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                    'img/default-layout-return-detail.png'
                )
            }
        });
        pageType.registerPageType({
            name: 'returnAuthorizationFrom',
            routes: ['returns/new/:recordtype/:id'],
            view: ReturnAuthorizationFormView,
            defaultTemplate: {
                name: 'return_authorization_form.tpl',
                displayName: 'Return authorization form default',
                thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                    'img/default-layout-return-authorization-form.png'
                )
            }
        });
        pageType.registerPageType({
            name: 'returnAuthorizationConfirmation',
            routes: ['returns/confirmation/:recordtype/:id'],
            view: ReturnAuthorizationConfirmationView,
            defaultTemplate: {
                name: 'return_authorization_confirmation.tpl',
                displayName: 'Return authorization confirmation default',
                thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                    'img/default-layout-return-authorization-confirmation.png'
                )
            }
        });
    }
};

export = ReturnAuthorization;
