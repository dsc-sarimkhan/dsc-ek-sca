/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="GlobalViews.Modal.View"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended.d.ts"/>

import * as _ from 'underscore';
import * as global_views_modal_tpl from 'global_views_modal.tpl';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class GlobalViews.Modal.View @extends Backbone.View
const GlobalViewsModalView: any = BackboneView.extend({
    template: global_views_modal_tpl,

    childViews: {
        'Child.View': function() {
            return this.options.childViewIstance;
        }
    },

    // @method getContext @return GlobalViews.Modal.View.Context
    getContext: function() {
        // @class GlobalViews.Modal.View.Context
        return {
            // @property {String} pageHeader
            pageHeader: this.options.pageHeader || ' ',
            // @property {Boolean} showPageHeader
            showPageHeader: _.isUndefined(this.options.childViewIstance.showModalPageHeader)
                ? !!this.options.pageHeader
                : this.options.childViewIstance.showModalPageHeader,
            // @property {Boolean} modalDialogClass
            modalDialogClass: this.options.childViewIstance.modalClass || '',
            headerModalClass: this.options.childViewIstance.headerClass || '',
            iconHeaderModalClass: this.options.childViewIstance.iconHeaderClass || ''
        };
    }
});

export = GlobalViewsModalView;
