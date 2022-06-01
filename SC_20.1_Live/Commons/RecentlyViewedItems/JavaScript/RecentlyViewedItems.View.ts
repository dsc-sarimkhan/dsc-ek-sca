/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="RecentlyViewedItems.View"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as recently_viewed_items_tpl from 'recently_viewed_items.tpl';
import * as recently_viewed_row_tpl from 'recently_viewed_row.tpl';
import * as recently_viewed_cell_tpl from 'recently_viewed_cell.tpl';

import * as jQuery from '../../Core/JavaScript/jQuery';

import BackboneCollectionView = require('../../Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import ItemRelationsRelatedItemView = require('../../ItemRelations/JavaScript/ItemRelations.RelatedItem.View');
import RecentlyViewedItemsCollection = require('./RecentlyViewedItems.Collection');
import Configuration = require('../../Utilities/JavaScript/SC.Configuration');
import Tracker = require('../../Tracker/JavaScript/Tracker');
import Backbone = require('../../Utilities/JavaScript/backbone.custom');

const RecentlyViewedItemsView: any = BackboneCollectionView.extend({
    initialize: function() {
        const { application } = this.options;
        const layout = application.getLayout();
        const collection =
            application.getConfig('siteSettings.sitetype') === 'ADVANCED'
                ? RecentlyViewedItemsCollection.getInstance()
                : new Backbone.Collection();
        const self = this;

        BackboneCollectionView.prototype.initialize.call(this, {
            collection: collection,
            viewsPerRow: Infinity,
            cellTemplate: recently_viewed_cell_tpl,
            rowTemplate: recently_viewed_row_tpl,
            childView: ItemRelationsRelatedItemView,
            template: recently_viewed_items_tpl
        });

        layout.once('afterAppendView', self.loadRecentlyViewedItem, self);
    },
    loadRecentlyViewedItem: function loadRecentlyViewedItem() {
        const self = this;

        RecentlyViewedItemsCollection.getInstance().turnOnTracking();

        this.collection.promise &&
            this.collection.promise.done(function() {
                const { application } = self.options;
                const number_of_items_displayed = application.getConfig(
                    'recentlyViewedItems.numberOfItemsDisplayed'
                );

                self.collection = self.collection.first(parseInt(number_of_items_displayed));
                self.render();

                const carousel = self.$el.find('[data-type="carousel-items"]');

                if (
                    Utils.isPhoneDevice() === false &&
                    application.getConfig('siteSettings.imagesizes')
                ) {
                    const thumbnail: any = _.where(
                        application.getConfig('siteSettings.imagesizes'),
                        {
                            name: application.getConfig('imageSizeMapping.thumbnail')
                        }
                    )[0];

                    const img_min_height = thumbnail.maxheight;

                    carousel
                        .find('.item-relations-related-item-thumbnail')
                        .css('minHeight', img_min_height);
                }

                Utils.initBxSlider(carousel, Configuration.bxSliderDefaults);
            });
    }
});

export = RecentlyViewedItemsView;
