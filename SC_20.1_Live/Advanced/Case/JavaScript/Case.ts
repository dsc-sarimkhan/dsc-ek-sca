/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Case"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />

import '../../SCA/JavaScript/SC.Configuration';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import CaseListView = require('./Case.List.View');
import CaseDetailView = require('./Case.Detail.View');
import CaseCreateView = require('./Case.Create.View');

// Is Case functionality available for this application?
const isCaseManagementEnabled = function(): boolean {
    return SC && SC.ENVIRONMENT && SC.ENVIRONMENT.casesManagementEnabled;
};

// Encapsulate all Case elements into a single module to be mounted to the application
// Update: Keep the application reference within the function once its mounted into the application
const CaseModule: any = (function() {
    const mountToApp = function(application) {
        const pageType = application.getComponent('PageType');
        pageType.registerPageType({
            name: 'CasesList',
            routes: ['cases', 'cases?:options'],
            view: CaseListView,
            defaultTemplate: {
                name: 'case_list.tpl',
                displayName: 'Cases list default',
                thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                    'img/default-layout-transaction-list.png'
                )
            }
        });
        pageType.registerPageType({
            name: 'CasesDetail',
            routes: ['cases/:id'],
            view: CaseDetailView,
            defaultTemplate: {
                name: 'case_detail.tpl',
                displayName: 'Cases detail default',
                thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                    'img/default-layout-cases-detail.png'
                )
            }
        });
        pageType.registerPageType({
            name: 'NewCase',
            routes: ['newcase'],
            view: CaseCreateView,
            defaultTemplate: {
                name: 'case_new.tpl',
                displayName: 'Cases detail default',
                thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                    'img/default-layout-cases-new.png'
                )
            }
        });
    };
    return {
        isEnabled: isCaseManagementEnabled,
        mountToApp: mountToApp
    };
})();

export = CaseModule;
