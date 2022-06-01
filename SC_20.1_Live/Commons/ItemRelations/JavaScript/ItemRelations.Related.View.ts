/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ItemRelations.Related.View"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as item_relations_related_tpl from 'item_relations_related.tpl';
import * as item_relations_row_tpl from 'item_relations_row.tpl';
import * as item_relations_cell_tpl from 'item_relations_cell.tpl';

import BackboneCollectionView = require('../../Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import ItemRelationsRelatedItemView = require('./ItemRelations.RelatedItem.View');
import ItemRelationsRelatedCollection = require('./ItemRelations.Related.Collection');
import Configuration = require('../../Utilities/JavaScript/SC.Configuration');
import Tracker = require('../../Tracker/JavaScript/Tracker');
import Backbone = require('../../Utilities/JavaScript/backbone.custom');

const ItemRelationsRelatedView = BackboneCollectionView.extend({
    initialize: function() {
        const is_sca_advance =
            this.options.application.getConfig('siteSettings.sitetype') === 'ADVANCED';
        const collection = is_sca_advance
            ? new ItemRelationsRelatedCollection({ itemsIds: this.options.itemsIds })
            : new Backbone.Collection();

        BackboneCollectionView.prototype.initialize.call(this, {
            collection: collection,
            viewsPerRow: Infinity,
            cellTemplate: item_relations_cell_tpl,
            rowTemplate: item_relations_row_tpl,
            childView: ItemRelationsRelatedItemView,
            template: item_relations_related_tpl
        });

        this.view_tracked = false;

        if (is_sca_advance) {
            this.once('afterCompositeViewRender', this.loadRelatedItem, this);
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
    }
});

export = ItemRelationsRelatedView;
