/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="GlobalViews.HostSelector.View"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as jQuery from '../../Core/JavaScript/jQuery';

import * as global_views_host_selector_tpl from 'global_views_host_selector.tpl';

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');
import Configuration = require('../../../Advanced/SCA/JavaScript/SC.Configuration');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

// @class GlobalViews.HostSelector.View @extends Backbone.View
const GlobalViewsHostSelectorView: any = BackboneView.extend({
    template: global_views_host_selector_tpl,

    events: {
        'change select[data-toggle="host-selector"]': 'selectHost',
        'click select[data-toggle="host-selector"]': 'selectHostClick'
    },

    // @method selectHostClick @param {HTMLEvent} e
    selectHostClick: function(e) {
        e.stopPropagation();
    },

    // @method selectHost @param {HTMLEvent} e
    selectHost: function(e) {
        if (Configuration.currentTouchpoint === 'home') {
            this.setHost(e);
        } else {
            this.setLang(e);
        }
    },

    // @method setHref @param {String} url
    setHref: function(url) {
        window.location.href = Utils.getAbsoluteUrl(
            'redirections.ssp?location=' + location.protocol + '//' + url
        );
    },

    // @method setSearch @param {String} search
    setSearch: function(search) {
        window.location.search = search;
    },

    // @method getCurrentPath @returns {String}
    getCurrentPath: function() {
        return location.pathname;
    },

    // @method setHost @param {HTMLEvent} e
    setHost: function(e) {
        const host = jQuery(e.target).val();
        let url;

        const BackboneHistory: any = Backbone.History;
        if (BackboneHistory._hasPushState) {
            // Seo Engine is on, send him to the root
            url = host;
        } else {
            // send it to the current path, it's probably a test site
            url = host + this.getCurrentPath();
        }

        // redirects to url
        this.setHref(url);
    },

    // @method setLang @param {HTMLEvent} e
    setLang: function(e) {
        const selected_host = jQuery(e.target).val();
        const available_hosts = SC.ENVIRONMENT.availableHosts;
        let selected_language;

        for (let i = 0; i < available_hosts.length; i++) {
            const host = available_hosts[i];
            const lang: any = _(host.languages).findWhere({ host: selected_host });

            if (lang && lang.locale) {
                selected_language = lang;
                break;
            }
        }

        // use the param **"lang"** to pass this to the ssp environment
        if (selected_language && selected_language.locale) {
            const current_search = Utils.parseUrlOptions(window.location.search);

            current_search.lang = selected_language.locale;

            const search = _.reduce(
                current_search,
                function(memo, val, name) {
                    return val ? memo + name + '=' + val + '&' : memo;
                },
                '?'
            );

            this.setSearch(search);

            return search;
        }
    },

    // @method getContext @return GlobalViews.HostSelector.View.Context
    getContext: function() {
        const is_home_touchpoint = Configuration.currentTouchpoint === 'home';

        const use_parameter = !is_home_touchpoint;
        const current_host = is_home_touchpoint
            ? SC.ENVIRONMENT.currentHostString
            : SC.ENVIRONMENT.currentLanguage.locale;
        const available_hosts: any = _.map(SC.ENVIRONMENT.availableHosts, function(host: any) {
            // @class GlobalViews.HostSelector.View.Context.Host
            return {
                // @property {Boolean} hasLanguages
                hasLanguages: host.languages && host.languages.length,
                // @property {String} title
                title: host.title,
                // @property {Array<GlobalViews.HostSelector.View.Context.Host.Language>} languages
                languages: _.map(host.languages, function(language: any) {
                    // @class GlobalViews.HostSelector.View.Context.Host.Language
                    return {
                        // @property {String} host
                        host: language.host,
                        // @property {String} displayName
                        displayName: language.title || language.name,
                        // @property {Boolean} isSelected
                        isSelected: !!(
                            (use_parameter && language.locale === current_host) ||
                            language.host === current_host
                        )
                    };
                })
            };
        });

        // @class GlobalViews.HostSelector.View.Context
        return {
            // @property {Boolean} showHosts
            showHosts: !!(available_hosts && available_hosts.length > 1),
            // @property {Array<GlobalViews.HostSelector.View.Context.Host>} availableHosts
            availableHosts: available_hosts,
            // @property {String} currentHost
            currentHost: current_host,
            // @param {Boolean} useParameter
            useParameter: use_parameter
        };
    }
});

export = GlobalViewsHostSelectorView;
