/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SC.Checkout"/>

import * as _ from 'underscore';

import '../../../Commons/BackboneExtras/JavaScript/Backbone.Model';
import '../../../Commons/BackboneExtras/JavaScript/Backbone.Sync';
import '../../../Commons/Core/JavaScript/backbone/BackboneExtras';
import '../../../Commons/BackboneExtras/JavaScript/Backbone.View';
import '../../../Commons/BackboneExtras/JavaScript/Backbone.View.render';
import '../../../Commons/BackboneExtras/JavaScript/Backbone.View.saveForm';
import '../../../Commons/BackboneExtras/JavaScript/Backbone.View.toggleReset';
import '../../../Commons/BootstrapExtras/JavaScript/Bootstrap.Slider';
import '../../../Commons/jQueryExtras/JavaScript/jQuery.ajaxSetup';
import '../../../Commons/jQueryExtras/JavaScript/jQuery.serializeObject';
import '../../../Commons/NativesExtras/JavaScript/String.format';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import ConfigurationPromise = require('./SC.Checkout.Configuration');
import Application = require('../../../Commons/Main/JavaScript/Application');
import CheckoutLayout = require('./SC.Checkout.Layout');
import Session = require('../../../Commons/Session/JavaScript/Session');

/* !
 * Description: SuiteCommerce Reference Checkout
 *
 * @copyright (c) 2000-2013, NetSuite Inc.
 * @version 1.0
 */

// Application.js
// --------------
// Extends the application with Checkout specific core methods

const app_promise: any = jQuery.Deferred();

const Checkout = Application('Checkout');

Checkout.Layout = CheckoutLayout;
if (SC.ENVIRONMENT.standalone) {
    _.extend(Checkout, { isStandalone: true });
}

// This makes that Promo codes and GC travel to different servers (secure and unsecure)
Checkout.on('afterStart', function() {
    // Fix sitebuilder links, Examines the event target to check if its a touchpoint
    // and replaces it with the new version ot the touchpoint
    function fixCrossDomainNavigation(e) {
        const $element = jQuery(e.target).closest('a');
        if (!$element.closest('#main').length) {
            const { href } = e.target;
            const url_prefix = href && href.split('?')[0];
            // get the value of the "is" url parameter
            const href_parameter_value_is = Utils.getParameterByName(href, 'is');
            const touchpoints = Session.get('touchpoints');

            _.each(touchpoints, function(touchpoint: any) {
                const touchpoint_parameter_value_is = Utils.getParameterByName(touchpoint, 'is');
                // If the href of the link is equal to the current touchpoint then update the link with the
                // parameters of the touchpoint. To check if are equals is been used the url without
                // parameters and the parameter "is"
                if (url_prefix && ~touchpoint.indexOf(url_prefix)) {
                    // If the "is" parameter exist in the link, then must exist in the
                    // touchpoint and his values need to be equals.
                    if (
                        !(
                            href_parameter_value_is &&
                            (!touchpoint_parameter_value_is ||
                                touchpoint_parameter_value_is !== href_parameter_value_is)
                        )
                    ) {
                        e.target.href = touchpoint;
                    }
                }
            });
        }
    }
    // As this fixCrossDomainNavigation only alters the href of the a we can append it
    // to the mouse down event, and not to the click thing will make us work a lot more :)
    jQuery(document.body).on('mousedown', 'a', fixCrossDomainNavigation);
    jQuery(document.body).on('touchstart', 'a', fixCrossDomainNavigation);
});

// Setup global cache for this application
jQuery.ajaxSetup({ cache: false });

ConfigurationPromise.then(function(Configuration) {
    Checkout.Configuration = _.extend(Checkout.Configuration, Configuration);

    app_promise.resolve(Checkout);
});

export = app_promise;
