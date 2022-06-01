/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Header.Simplified.View"/>

import * as header_simplified_tpl from 'header_simplified.tpl';

import HeaderLogoView = require('./Header.Logo.View');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');

// @class Header.Simplified.View @extends Backbone.View
export = BackboneView.extend({
    // @property {Function} template
    template: header_simplified_tpl,
    // @method initialize
    initialize: function() {
        BackboneCompositeView.add(this);
    },
    // @property {Object} childViews
    childViews: {
        'Header.Logo': function() {
            return new HeaderLogoView(this.options);
        }
    }
});
