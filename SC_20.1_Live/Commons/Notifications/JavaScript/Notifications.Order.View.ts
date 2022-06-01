/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Notifications.Order.View"/>
// @module Notifications.Order.View

import * as _ from 'underscore';
import * as notifications_order_tpl from 'notifications_order.tpl';
import * as jQuery from '../../Core/JavaScript/jQuery';

import NotificationsOrderPromocodesView = require('./Notifications.Order.Promocodes.View');
import LiveOrderModel = require('../../../Commons/LiveOrder/JavaScript/LiveOrder.Model');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');

// @class Notifications.Order.View @extends Backbone.View
const NotificationsOrderView: any = BackboneView.extend({
    template: notifications_order_tpl,

    initialize: function() {
        this.model = LiveOrderModel.getInstance();

        this.model.on('change', this.render, this);
        this.model.get('lines').on('add remove', this.render, this);

        this.model.on('promocodeNotificationShown', this.removePromocodeNotification, this);

        this.notification_shown = false;

        this.on('afterCompositeViewRender', function() {
            if (this.notification_shown) {
                jQuery('body').animate(
                    {
                        scrollTop: this.$el.offset().top
                    },
                    600
                );

                this.notification_shown = false;
            }
        });
    },

    removePromocodeNotification: function(promocode_id) {
        const promocode: any = _.findWhere(this.model.get('promocodes'), {
            internalid: promocode_id
        });

        delete promocode.notification;
    },
    // @property {ChildViews} childViews
    childViews: {
        'Promocode.Notifications': function() {
            const promotions = _.filter(this.model.get('promocodes') || [], function(promocode) {
                return (<any>promocode).notification === true;
            });

            if (promotions.length) {
                this.notification_shown = true;

                return new BackboneCollectionView({
                    collection: promotions,
                    viewsPerRow: 1,
                    childView: NotificationsOrderPromocodesView,
                    childViewOptions: {
                        parentModel: this.model
                    }
                });
            }
        }
    },

    // @method getContext @return Notifications.Order.View.Context
    getContext: function() {
        // @class Notifications.Order.View.Context
        return {};
    }
});

export = NotificationsOrderView;
