/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SC.CCT.Html.View"/>

import * as sc_cct_html_tpl from 'sc_cct_html.tpl';

import CustomContentTypeBaseView = require('../../CustomContentType/JavaScript/CustomContentType.Base.View');

// @module SC.CCT.Html
// @class SC.CCT.Html.View @extend CustomContentType.Base.View
export = CustomContentTypeBaseView.extend({
    template: sc_cct_html_tpl,

    getContext: function getContext() {
        // @class SC.CCT.Html.View.Context
        return {
            // @property {String} htmlString
            htmlString: this.settings.html_string,
            // @property {Boolean} hasHtmlString
            hasHtmlString: !!this.settings.html_string
        };
        // @class SC.CCT.Html.View
    }
});
