/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Overview.Profile.View"/>
// Overview.Profile.View.js
// -----------------------

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as overview_profile_tpl from 'overview_profile.tpl';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

const OverviewProfileView: any = BackboneView.extend({
    template: overview_profile_tpl,

    initialize: function() {},
    // @method getContext @returns {Overview.Banner.View.Context}
    getContext: function() {
        const first_name = this.model.get('firstname') || '';
        const middle_name = this.model.get('middlename') || '';
        const last_name = this.model.get('lastname') || '';
        const company_name = this.model.get('companyname');

        // @class Overview.Banner.View.Context
        return {
            // @property {String} name
            name: first_name + ' ' + middle_name + ' ' + last_name,
            // @property {Boolean} isCompany
            isCompany: !!company_name,
            // @property {Boolean} isNameTitle
            isNameTitle: !company_name,
            // @property {String} companyName
            companyName: company_name || '',
            // @property {String} email
            email: this.model.get('email'),
            // @property {String} phone
            phone: Utils.formatPhone(
                this.model.get('phone') || '',
                Configuration.get('siteSettings.phoneformat')
            )
        };
    }
});

export = OverviewProfileView;
