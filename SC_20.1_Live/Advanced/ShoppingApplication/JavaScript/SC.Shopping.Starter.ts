/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SC.Shopping.Starter"/>
// @module ShoppingApplication
// @class SCA.Shopping.Starter the main file to be loaded with requirejs tools. It contains all required dependencies
// to run Shopping and also it will start() the Shopping Applicaiton.
// ---------------MIXINS-----------------
import '../../../Commons/NativesExtras/JavaScript/String.format';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';
// ---------------END-----------------
import Shopping = require('./SC.Shopping');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import entryPointModules = require('./SC.Shopping.Starter.Dependencies');
import extensionsPromise = require('../../../Commons/SC.Extensions/JavaScript/SC.Extensions');

let allEntryPointModules = [];
function startShopping() {
    // we don't want to start the application if it is served externally, like in google cached pages.
    if (SC.isCrossOrigin()) {
        // an user seeing the page in cache.google with js enabled won't see the images unless we unwrap it:
        jQuery('noscript').each(function() {
            jQuery(this)
                .parent()
                .append(jQuery(this).text());
        });
        return;
    }

    Shopping.getConfig().siteSettings = SC.ENVIRONMENT.siteSettings || {};

    // The page generator needs to run in sync in order to work properly
    if (SC.isPageGenerator()) {
        jQuery.ajaxSetup({ async: false });
    }

    (<any>jQuery).fn.modal.Constructor.BACKDROP_TRANSITION_DURATION = 0; // This is in order to prevent Quick View redrawing issues

    // When the document is ready we call the application.start, and once that's done we bootstrap and start backbone
    Shopping.start(allEntryPointModules, function() {
        // Checks for errors in the context
        if (SC.ENVIRONMENT.contextError) {
            // Hide the header and footer.
            Shopping.getLayout()
                .$('#site-header')
                .hide();
            Shopping.getLayout()
                .$('#site-footer')
                .hide();

            // Shows the error.
            Shopping.getLayout().internalError(
                SC.ENVIRONMENT.contextError.errorMessage,
                'Error ' +
                    SC.ENVIRONMENT.contextError.errorStatusCode +
                    ': ' +
                    SC.ENVIRONMENT.contextError.errorCode
            );
        } else {
            const { fragment } = Utils.parseUrlOptions(location.search);

            if (fragment && !location.hash) {
                location.hash = decodeURIComponent(fragment.toString());
            }

            if (Shopping.getUser) {
                Shopping.getUser().done(function() {
                    // Only do push state client side.
                    Backbone.history.start({
                        pushState: !SC.isDevelopment && SC.ENVIRONMENT.jsEnvironment === 'browser'
                    });
                });
            } else {
                // Only do push state client side.
                Backbone.history.start({
                    pushState: !SC.isDevelopment && SC.ENVIRONMENT.jsEnvironment === 'browser'
                });
            }
        }

        Shopping.getLayout().appendToDom();
    });
}

// If the UA is google and main div is not empty (was pre-rendered) then avoid the starter execution
if (
    !navigator.userAgent.match(/googlebot/i) ||
    !jQuery('#main') ||
    !String(jQuery('#main').html()).trim()
) {
    jQuery(document).ready(function() {
        extensionsPromise.then(function(...entryPointExtensionsModules) {
            // At starting time all the modules Array is initialized
            allEntryPointModules = entryPointModules.concat(entryPointExtensionsModules);
            startShopping();
        });
    });
}
