/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductList.Deletion.View"/>

import '../../BackboneExtras/JavaScript/Backbone.View.render';
import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as product_list_deletion_tpl from 'product_list_deletion.tpl';

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// @class ProductList.Deletion.View @extends Backbone.View
export = BackboneView.extend({
    template: product_list_deletion_tpl,

    title: Utils.translate('Delete item'),

    attributes: {
        class: 'view product-list-deletion-confirm'
    },

    page_header: Utils.translate('Delete item'),

    events: {
        'click [data-action="delete"]': 'confirmDelete'
    },

    initialize: function(options) {
        this.application = options.application;
        this.parentView = options.parentView;
        this.target = options.target;
        this.title = options.title;
        this.page_header = options.title;
        this.body = options.body;
        this.confirm_delete_method = options.confirm_delete_method;
        this.confirmLabel = options.confirmLabel || Utils.translate('Yes, Remove It');
    },

    render: function() {
        BackboneView.prototype.render.apply(this, arguments);
        const self = this;
        this.$containerModal.on('shown.bs.modal', function() {
            self.$('[data-action="delete"]').focus();
        });
    },

    // @method confirmDelete Invokes parent view delete confirm callback function
    confirmDelete: function() {
        this.parentView[this.confirm_delete_method](this.target);
    },

    // @method getTitle Sets focus con cancel button and returns the title text
    getTitle: function() {
        return Utils.translate('Delete product list');
    },

    // @method getContext @return {ProductList.Deletion.View.Context}
    getContext: function() {
        return {
            // @class ProductList.Deletion.View.Context
            // @property {String} body
            body: this.body,
            // @property {Boolean} hasConfirmLabel
            hasConfirmLabel: !!this.confirmLabel,
            // @property {String} confirmLabel
            confirmLabel: this.confirmLabel,
            // @property {Boolean} hasCancelLabel
            hasCancelLabel: !!this.cancelLabel,
            // @property {String} cancelLabel
            cancelLabel: this.cancelLabel
        };
    }
});
