/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SC.Extensions"/>
/// <reference path="../../Utilities/JavaScript/GlobalDeclarations.d.ts" />

import * as _ from 'underscore';

import * as Utils from '../../Utilities/JavaScript/Utils';
import '../../BackboneExtras/JavaScript/Backbone.View';
import * as jQuery from '../../Core/JavaScript/jQuery';

let ext_promise = jQuery.Deferred().resolve();
if (SC && SC.extensionModules) {
    ext_promise = jQuery.when.apply(
        jQuery,
        _.map(SC.extensionModules, function(appModuleName) {
            const promise = jQuery.Deferred();
            try {
                Utils.requireModules([appModuleName], promise.resolve, function(error) {
                    console.error(error);
                    promise.resolve();
                });
            } catch (error) {
                console.error(error);
                promise.resolve();
            }
            return promise;
        })
    );
}
export = ext_promise;
