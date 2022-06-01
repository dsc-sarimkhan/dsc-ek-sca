/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PrintStatement"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import PrintStatementView = require('./PrintStatement.View');

// @class PrintStatement
const PrintStatement: any = {
    // @method mountToApp
    mountToApp: function(application) {
        const pageType = application.getComponent('PageType');
        pageType.registerPageType({
            name: 'PrintStatement',
            routes: ['printstatement', 'printstatement?*params'],
            view: PrintStatementView,
            defaultTemplate: {
                name: 'print_statement.tpl',
                displayName: 'PrintStatement Default',
                thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                    'img/default-layout-printStatement.png'
                )
            }
        });
    }
};

export = PrintStatement;
