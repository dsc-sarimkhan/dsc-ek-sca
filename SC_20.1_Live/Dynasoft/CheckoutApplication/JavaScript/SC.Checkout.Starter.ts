/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SC.Checkout.Starter"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import applicationPromise = require('./SC.Checkout');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import entryPointModule = require('./SC.Checkout.Starter.Dependencies'); // Auto generated at build time using configuration from distro.json
import extensionsPromise = require('../../../Commons/SC.Extensions/JavaScript/SC.Extensions');

jQuery(function() {
    applicationPromise.then(function(application) {
        extensionsPromise.then(function(...entryPointExtensionsModules) {
            // At starting time all the modules Array is initialized
            const entryPointModules = entryPointModule.concat(entryPointExtensionsModules);

            application.getConfig().siteSettings = SC.ENVIRONMENT.siteSettings || {};

            if (SC.ENVIRONMENT.CHECKOUT.skipLogin) {
                application.Configuration.checkout = application.Configuration.checkout || {};
                application.Configuration.checkout.skipLogin = SC.ENVIRONMENT.CHECKOUT.skipLogin;
                delete SC.ENVIRONMENT.CHECKOUT.skipLogin;
            }

            application.start(entryPointModules, function() {
                // Checks for errors in the context
                if (SC.ENVIRONMENT.contextError) {
                    // Shows the error.
                    if (SC.ENVIRONMENT.contextError.errorCode === 'ERR_WS_EXPIRED_LINK') {
                        application
                            .getLayout()
                            .expiredLink(SC.ENVIRONMENT.contextError.errorMessage);
                    } else {
                        application
                            .getLayout()
                            .internalError(
                                SC.ENVIRONMENT.contextError.errorMessage,
                                'Error ' +
                                    SC.ENVIRONMENT.contextError.errorStatusCode +
                                    ': ' +
                                    SC.ENVIRONMENT.contextError.errorCode
                            );
                    }
                } else {
                    const { fragment } = Utils.parseUrlOptions(location.search);

                    if (fragment && !location.hash) {
                        location.hash = decodeURIComponent(fragment.toString());
                    }

                    Backbone.history.start();
                }

                application.getLayout().appendToDom();
            });
        });
    });
});
