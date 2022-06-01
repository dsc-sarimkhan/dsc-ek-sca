/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SC.Shopping"/>

import * as _ from 'underscore';
import '../../../Commons/BackboneExtras/JavaScript/Backbone.Model';
import '../../../Commons/BackboneExtras/JavaScript/Backbone.Sync';
import '../../../Commons/Core/JavaScript/backbone/BackboneExtras';
import '../../../Commons/BackboneExtras/JavaScript/Backbone.View';
import '../../../Commons/BackboneExtras/JavaScript/Backbone.View.render';
import '../../../Commons/BackboneExtras/JavaScript/Backbone.View.saveForm';
import '../../../Commons/BackboneExtras/JavaScript/Backbone.View.toggleReset';
import '../../../Commons/BootstrapExtras/JavaScript/Bootstrap.Rate';
import '../../../Commons/BootstrapExtras/JavaScript/Bootstrap.Slider';
import '../../../Commons/jQueryExtras/JavaScript/jQuery.ajaxSetup';
import '../../../Commons/jQueryExtras/JavaScript/jQuery.serializeObject';
import '../../../Commons/jQueryExtras/JavaScript/jQuery.scPush';
import '../../../Commons/NativesExtras/JavaScript/String.format';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import Configuration = require('../../ShoppingApplication/JavaScript/SC.Shopping.Configuration');
import Application = require('../../../Commons/Main/JavaScript/Application');
import ShoppingLayout = require('./SC.Shopping.Layout');

// @class SCA.Shopping  Defines the singleton application instance named 'Shopping' which can be
// obtained with SC.Application('Shopping') @extends ApplicationSkeleton
const Shopping: any = Application('Shopping');

Shopping.Layout = ShoppingLayout;

// Get the layout from the application
const Layout = Shopping.getLayout();

// Applies Configuration
Shopping.Configuration = _.extend(Shopping.Configuration, Configuration);

// This will change the url when a "select" DOM element of the type "navigator" is changed
_.extend(Layout, {
    changeUrl: function(e) {
        // Disable other navigation links before redirection
        this.$('select[data-type="navigator"], .pagination-links a').attr('disabled', 'disabled');

        // Get the value of the select and navigate to it
        // http://backbonejs.org/#Router-navigate
        Backbone.history.navigate(this.$(e.target).val(), { trigger: true });
    }
});

_.extend(Layout.events, {
    'change select[data-type="navigator"]': 'changeUrl'
});

// This is necessary for showing Cases menu option in header_profile_macro menu. Cases should only be available in My Account application.
// By doing so, we are avoiding copying the entire module to ShopFlow but we preserve the same logic. We need to check if backend
// configuration is present and if the feature is enabled, keeping the same behavior My Account currently has.
_.extend(Shopping, {
    CaseModule: {
        // Is Case functionality available for this application?
        isEnabled: function() {
            return (
                !_.isUndefined(SC.ENVIRONMENT.CASES) &&
                !_.isUndefined(SC.ENVIRONMENT.CASES.CONFIG) &&
                SC.ENVIRONMENT.CASES.enabled
            );
        }
    }
});

// Setup global cache for this application
jQuery.ajaxSetup({ cache: true });

jQuery.ajaxPrefilter(function(options) {
    if (options.url) {
        if (options.type === 'GET' && options.data) {
            const join_string = ~options.url.indexOf('?') ? '&' : '?';
            options.url = options.url + join_string + options.data;
            options.data = '';
        }

        options.url = Utils.reorderUrlParams(options.url);
    }

    if ((<any>options).pageGeneratorPreload && SC.ENVIRONMENT.jsEnvironment === 'server') {
        jQuery('<img />', { src: options.url, alt: '', style: 'display: none;' }).prependTo('body');
    }
});

export = Shopping;
