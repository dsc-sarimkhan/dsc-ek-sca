/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SC.CCT.Html"/>

import SCCCTHtmlView = require('./SC.CCT.Html.View');

// @module SC.CCT.Html
export = {
    mountToApp: function mountToApp(application) {
        const component = application.getComponent('CMS');

        if (!component) {
            return;
        }

        component.registerCustomContentType({
            id: 'CMS',
            view: SCCCTHtmlView
        });
    }
};
