/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="jQuery.html"/>
/*
@module jQueryExtras

#jQuery.html

ONLY FOR PAGE GENERATOR.

ReDefines jQuery html and appends functions to control how and what new content
is added into the DOM. If in page generator we also override jQuery.html() and jQuery.append() so html
output is minified. Also remove scripts - so content scripts don't appear in SEO output.

*/
import * as utils from '../../Utilities/JavaScript/Utils';

import * as jQuery from '../../Core/JavaScript/jQuery';

const jQueryHtmlModule: any = {
    mountToApp: function() {
        if (utils.isPageGenerator()) {
            const jQuery_originalHtml = jQuery.fn.html;

            jQuery.fn.html = <any>function(html: any) {
                if (typeof html === 'string') {
                    html = utils.minifyMarkup(html);
                    html = utils.removeScripts(html);
                }
                return jQuery_originalHtml.apply(this, [html]);
            };

            const jQuery_originalAppend: any = jQuery.fn.append;

            jQuery.fn.append = function(html: any) {
                if (typeof html === 'string') {
                    html = utils.minifyMarkup(html);
                    html = utils.removeScripts(html);
                }
                return jQuery_originalAppend.apply(this, [html]);
            };
        }
    }
};

export = jQueryHtmlModule;
