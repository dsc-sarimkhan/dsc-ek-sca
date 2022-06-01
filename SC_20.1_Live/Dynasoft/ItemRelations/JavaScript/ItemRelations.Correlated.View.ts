/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ItemRelations.Correlated.View"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as item_relations_cell_tpl from 'item_relations_cell.tpl';
import * as item_relations_row_tpl from 'item_relations_row.tpl';
import * as item_relations_correlated_tpl from 'item_relations_correlated.tpl';

import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import ItemRelationsRelatedItemView = require('./ItemRelations.RelatedItem.View');
import ItemRelationsCorrelatedCollection = require('./ItemRelations.Correlated.Collection');
import Tracker = require('../../../Commons/Tracker/JavaScript/Tracker');
import Configuration = require('../../../Commons/Utilities/JavaScript/SC.Configuration');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

// @class ItemRelations.Correlated.View @extends Backbone.CollectionView
const ItemRelationsCorrelatedView = BackboneCollectionView.extend({
    initialize: function() {
        const is_sca_advanced = Configuration.get('siteSettings.sitetype') === 'ADVANCED';
        const collection = is_sca_advanced
            ? new ItemRelationsCorrelatedCollection({ itemsIds: this.options.itemsIds })
            : new Backbone.Collection();

        BackboneCollectionView.prototype.initialize.call(this, {
            collection: collection,
            viewsPerRow: Infinity,
            cellTemplate: item_relations_cell_tpl,
            rowTemplate: item_relations_row_tpl,
            childView: ItemRelationsRelatedItemView,
            template: item_relations_correlated_tpl
        });

        this.view_tracked = false;

        if (is_sca_advanced) {
            this.once('afterCompositeViewRender', this.loadRelatedItems, this);
        }
    },

    loadRelatedItems: function loadRelatedItems() {
        const self = this;

        self.collection.fetchItems().done(function() {
            if (self.collection.length) {
                if (!self.view_tracked) {
                    Tracker.getInstance().trackProductListEvent(
                        self.collection,
                        'Correlated Items'
                    );
                    self.view_tracked = true;
                }
            }

            self.render();

            const carousel = self.$el.find('[data-type="carousel-items"]');

            if (
                Utils.isPhoneDevice() === false &&
                self.options.application.getConfig('siteSettings.imagesizes')
            ) {
                const img_min_height = (<any>_.where(
                    self.options.application.getConfig('siteSettings.imagesizes'),
                    {
                        name: self.options.application.getConfig('imageSizeMapping.thumbnail')
                    }
                )[0]).maxheight;

                carousel
                    .find('.item-relations-related-item-thumbnail')
                    .css('minHeight', img_min_height);
            }

            Utils.initBxSlider(carousel, Configuration.bxSliderDefaults);
        });
    },

    destroy: function destroy() {
        this._destroy();
        this.off('afterCompositeViewRender', this.loadRelatedItems, this);
    }
});

export = ItemRelationsCorrelatedView;
