/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Merchandising.View">
import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import * as merchandising_zone_tpl from 'merchandising_zone.tpl';
import * as merchandising_zone_cell_template_tpl from 'merchandising_zone_cell_template.tpl';
import * as merchandising_zone_row_template_tpl from 'merchandising_zone_row_template.tpl';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import ItemRelationsRelatedItemView = require('../../../Commons/ItemRelations/JavaScript/ItemRelations.RelatedItem.View');

// @module Merchandising

// @class Merchandising.View Responsible for rendering the list of item requested by a merchandizing
// rule @extend Backbone.View
export = BackboneView.extend({
    template: merchandising_zone_tpl,

    // @method initialize Creates a new instance of the current view
    // @param {MerchandisingRule.Model} options.model
    // @param {Merchandising.ItemCollection} options.items
    initialize: function(options) {
        this.model = options.model;
        this.items = options.items;

        BackboneView.prototype.initialize.apply(this, arguments);
        BackboneCompositeView.add(this);

        const self = this;
        this.on('afterMerchandAppendToDOM', _.bind(this.initSlider, self));
    },

    childViews: {
        'Zone.Items': function() {
            const itemsCollectionView = new BackboneCollectionView({
                childView: ItemRelationsRelatedItemView,
                viewsPerRow: Infinity,
                cellTemplate: merchandising_zone_cell_template_tpl,
                rowTemplate: merchandising_zone_row_template_tpl,
                collection: _.first(this.items.models, this.model.get('show'))
            });

            return itemsCollectionView;
        }
    },

    // @method initSlider
    initSlider: function() {
        const element = this.$el.find('[data-type="carousel-items"]');
        this.$slider = Utils.initBxSlider(element, Configuration.bxSliderDefaults);
    },

    // @method getContext @returns {Content.LandingPages.View.Context}
    getContext: function() {
        // @class Content.LandingPages.View.Context
        return {
            // @property {String} zoneTitle
            zoneTitle: this.model.get('title'),
            // @property {Boolean} isZoneDescription
            isZoneDescription: !!this.model.get('description'),
            // @property {Stirng} zoneDescription
            zoneDescription: this.model.get('description')
        };
    }
});
