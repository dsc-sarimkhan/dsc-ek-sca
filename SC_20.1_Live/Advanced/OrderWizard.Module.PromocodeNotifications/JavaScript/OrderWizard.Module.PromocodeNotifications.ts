/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.PromocodeNotifications"/>

import * as _ from 'underscore';
import * as order_wizard_promocodenotifications_tpl from 'order_wizard_promocodenotifications.tpl';
import * as notifications_tpl from 'notifications.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import WizardModule = require('../../Wizard/JavaScript/Wizard.Module');
import CartPromocodeNotificationsView = require('../../../Commons/Cart/JavaScript/Cart.Promocode.Notifications.View');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');

// @class OrderWizard.Module.PromocodeNotifications @extends Wizard.Module
export = WizardModule.extend({
    // @property {Function} template
    template: order_wizard_promocodenotifications_tpl,

    // @method initialize
    initialize: function initialize() {
        WizardModule.prototype.initialize.apply(this, arguments);

        if (this.isActive()) {
            this.wizard.model.on('change:promocodes', this.render, this);

            this.wizard.model.on(
                'promocodeNotificationShown',
                this.removePromocodeNotification,
                this
            );
        }
    },

    isActive: function isActive(): boolean {
        return !notifications_tpl && !!order_wizard_promocodenotifications_tpl;
    },

    render: function() {
        if (this.isActive()) {
            if (!this.was_rendered) {
                this.was_rendered = true;
                this._render();
            }

            const promocodes = _.filter(this.wizard.model.get('promocodes') || [], function(
                promocode: any
            ) {
                return promocode.notification === true;
            });

            if (promocodes.length) {
                const message_collection_view = new BackboneCollectionView({
                    collection: promocodes,
                    viewsPerRow: 1,
                    childView: CartPromocodeNotificationsView,
                    childViewOptions: {
                        parentModel: this.wizard.model
                    }
                });

                message_collection_view.render();

                jQuery('[data-type="Promocode.Notifications"]').html(
                    message_collection_view.$el.html()
                );
            }
        }
    },

    // @method removePromocodeNotification
    // @param String promocode_id
    // @return {Void}
    removePromocodeNotification: function(promocode_id) {
        const promocode: any = _.findWhere(this.wizard.model.get('promocodes'), {
            internalid: promocode_id
        });

        delete promocode.notification;
    },

    // @method getContext
    // @returns {OrderWizard.Module.PromocodeNotifications.Context}
    getContext: function getContext() {
        // @class OrderWizard.Module.PromocodeNotifications.Context
        return {};
        // @class OrderWizard.Module.PromocodeNotifications
    }
});
