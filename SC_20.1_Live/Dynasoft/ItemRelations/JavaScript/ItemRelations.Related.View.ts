/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ItemRelations.Related.View"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as item_relations_related_tpl from 'item_relations_related.tpl';
import * as item_relations_row_tpl from 'item_relations_row.tpl';
import * as item_relations_cell_tpl from 'item_relations_cell.tpl';

import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import ItemRelationsRelatedItemView = require('./ItemRelations.RelatedItem.View');
import ItemRelationsRelatedCollection = require('./ItemRelations.Related.Collection');
import Configuration = require('../../../Commons/Utilities/JavaScript/SC.Configuration');
import Tracker = require('../../../Commons/Tracker/JavaScript/Tracker');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import { collect } from 'underscore';
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');

const ItemRelationsRelatedView = BackboneCollectionView.extend({
    initialize: function() {
        this.upsell=false;
        const is_sca_advance =
            this.options.application.getConfig('siteSettings.sitetype') === 'ADVANCED';
        const collection = is_sca_advance
            ? new ItemRelationsRelatedCollection({ itemsIds: this.options.itemsIds })
            : new Backbone.Collection();
            var profile = ProfileModel.getInstance();
            var custId = null
           if(profile.get('isLoggedIn')=== 'T'){
            custId = profile.get('internalid')
           }
        let promotions_data = null;
        jQuery.ajax({
            url: Utils.getAbsoluteUrl('services/ItemPromotion.Service.ss') + '?itemId=' + this.options.itemsIds + '&custId='+custId,
            type: 'get',
            async: false,
            success: function (data) {
                promotions_data = data.length > 0 ? data : "No Data";
            }
        });

        BackboneCollectionView.prototype.initialize.call(this, {
            collection: collection,
            viewsPerRow: Infinity,
            cellTemplate: item_relations_cell_tpl,
            rowTemplate: item_relations_row_tpl,
            childView: ItemRelationsRelatedItemView,
            template: item_relations_related_tpl,
            childViewOptions: {
                promotions: promotions_data,
                showIncludeCheckbox: (this.options.context && this.options.context == 'PDP') ? true : false
            }
        });

        this.view_tracked = false;

        if (is_sca_advance) {
            this.once('afterCompositeViewRender', this.loadRelatedItem, this);
        }
        if(window.location.href.indexOf('upsell')!=-1 && window.location.href.indexOf('cart')!=-1)
        {
            this.upsell=true;
        }
    },

    loadRelatedItem: function loadRelatedItem() {
        const self = this;

        self.collection.fetchItems().done(function() {
            if (self.collection.length) {
                if (!self.view_tracked) {
                    Tracker.getInstance().trackProductListEvent(self.collection, 'Related Items');
                    self.view_tracked = true;
                }
            }

            self.render();

            const carousel = self.$el.find('[data-type="carousel-items"]');

            if (
                Utils.isPhoneDevice() === false &&
                self.options.application.getConfig('siteSettings.imagesizes', false)
            ) {
                const img_min_height = (<any>_.where(
                    self.options.application.getConfig('siteSettings.imagesizes', []),
                    {
                        name: self.options.application.getConfig('imageSizeMapping.thumbnail', '')
                    }
                )[0]).maxheight;

                carousel
                    .find('.item-relations-related-item-thumbnail')
                    .css('minHeight', img_min_height);
            }

            Utils.initBxSlider(carousel, Configuration.get('bxSliderDefaults', {}));
        });
    },

    destroy: function destroy() {
        this._destroy();
        this.off('afterCompositeViewRender', this.loadRelatedItems, this);
    },

    getContext:function getContext() {
        return _.extend({
            parentItemName:this.options.itemName,
            upsell:this.upsell
        }, BackboneCollectionView.prototype.getContext.call(this));
    }
});

export = ItemRelationsRelatedView;
