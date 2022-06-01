/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SiteSearch.Button.View"/>

import '../../SCA/JavaScript/SC.Configuration';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as site_search_button from 'site_search_button.tpl';

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');

// @class Site.Search.Button.View @extends Backbone.View
export = BackboneView.extend({
    events: {
        'click [data-action="show-itemsearcher"]': 'toggleSiteSearch'
    },

    // @property {Function} template
    template: site_search_button,

    // @method initialize
    // @param {Site.Search.Button.View.Initialize.Options} options
    // @return {Void}
    initialize: function() {
        this.application = this.options.application;

        Backbone.history.on('all', this.verifyShowSiteSearch, this);

        BackboneCompositeView.add(this);
    },

    // @method toggleSiteSearch
    toggleSiteSearch: function(ev) {
        ev && ev.preventDefault();

        // This add a class 'active' to change button color
        this.$('[data-action="show-itemsearcher"]').toggleClass('active');
        const self = this;

        this.application.getLayout().trigger('toggleItemSearcher');
    },

    // @method verifyShowSiteSearch expand the site search only if hash===home and (phone or tablet)
    verifyShowSiteSearch: function() {
        let hash = Backbone.history.getFragment() || '';
        hash = hash.indexOf('?') === -1 ? hash : hash.substring(0, hash.indexOf('?'));
        const is_home: boolean = hash === '' || hash === '/';

        if (Utils.getDeviceType() !== 'desktop' && is_home) {
            this.toggleSiteSearch(null, true);
        } else {
            // This hide sitesearch when navigate
            this.application.getLayout().trigger('hideItemSearcher');
        }
    }
});
