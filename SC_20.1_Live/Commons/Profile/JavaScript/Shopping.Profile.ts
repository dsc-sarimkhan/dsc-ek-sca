/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Shopping.Profile"/>
import * as jQuery from '../../Core/JavaScript/jQuery';

import ProfileModel = require('./Profile.Model');

// -----------------
// Defines the Profile module (Collection, Views, Router)

const ShoppingProfile: any = {
    mountToApp: function(application) {
        application.getUser = function() {
            const profile_promise = jQuery.Deferred();

            ProfileModel.getPromise()
                .done(function() {
                    profile_promise.resolve(ProfileModel.getInstance());
                })
                .fail(function() {
                    profile_promise.reject.apply(this, arguments);
                });

            return profile_promise;
        };
    }
};

export = ShoppingProfile;
