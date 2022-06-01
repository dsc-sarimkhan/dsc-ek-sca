/*
    © 2020 NetSuite Inc.
    User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
    provided, however, if you are an authorized user with a NetSuite account or log-in, you
    may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ItemRelations.RelatedItem.View"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as item_relations_related_item_tpl from 'item_relations_related_item.tpl';
import * as _ from 'underscore';
import GlobalViewsMessageView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Message.View');
import ProductViewsPriceView = require('../../ProductViews/JavaScript/ProductViews.Price.View');
import GlobalViewsStarRatingView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.StarRating.View');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import ProductModel = require('../../../Commons/Product/JavaScript/Product.Model')
import TransactionLineModel = require('../../../Commons/Transaction/JavaScript/Transaction.Line.Model');
import BackboneFormView = require('../../../Commons/Backbone.FormView/JavaScript/Backbone.FormView');
import QuickAddModel = require('../../../Advanced/QuickAdd/JavaScript/QuickAdd.Model');
import LiveOrderModel = require('../../LiveOrder/JavaScript/LiveOrder.Model');

var itemSelectedId = null;
// @class ItemViews.RelatedItem.View Responsible for rendering an item details. The idea is that the item rendered is related to another one in the same page
// @extend Backbone.View
const ItemRelationsRelatedItemView = BackboneView.extend({
    // @property {Function} template
    template: item_relations_related_item_tpl,

    // @method initialize Override default method to make this view composite
    // @param {ItemViews.RelatedItem.View.Initialize.Options} options
    // @return {Void}
    initialize: function () {
        this.upsell=false;
        BackboneView.prototype.initialize.apply(this, arguments);
        BackboneCompositeView.add(this);
        const original_save_form = this.saveForm1;
        this.saveForm1 = original_save_form;
        this.tempModel = new QuickAddModel();
        if(window.location.href.indexOf('cart?upsell=true')!=-1)
        {
            this.upsell=true;
        }

    },

    events: {
        'submit form': 'customSaveAdd',
    },
    contextData: {
        item: function () {
            return Utils.deepCopy(this.model);
        }
    },

    childViews: {
        'Item.Price': function () {
            return new ProductViewsPriceView({
                model: this.model,
                origin: 'RELATEDITEM',
                promotions: this.options.promotions
            });
        },
        'Global.StarRating': function () {
            return new GlobalViewsStarRatingView({
                model: this.model,
                showRatingCount: false
            });
        },
    },
    customSaveAdd: function (e) {
        e.preventDefault();
        this.product = new ProductModel();
        this.product.set('item', this.model);
        this.product.set('quantity', '1');
        if (this.product.isValid(true) && this.product) {
            // this.product.set('quantity', parseInt(this.model.get('quantity'), 10));
            const selected_line = new TransactionLineModel(this.product.toJSON());

            selected_line.set('internalid', _.uniqueId('item_line'));
            selected_line.set('item', this.product.getItem().clone());
            selected_line.set('options', this.product.get('options').clone());
            // if the item is a matrix we add the parent so when saving the item in a product list (request a quote case)
            // we have the parent

            if (this.product.get('item').get('_matrixChilds').length) {
                selected_line.get('item').set('_matrixParent', this.product.get('item'));
            }
            // selected_line.unset('selectedProduct');
            // selected_line.unset('quickaddSearch');
            // @event {QuickAdd.View.SelectedLine.Properties} selectedLine


            if (itemSelectedId == null || itemSelectedId != selected_line.get('item').id) {
                itemSelectedId = selected_line.get('item').id;
                LiveOrderModel.getInstance().addLine(selected_line).then(function (res) {
                    //Success Message
                    if(res){
                        location.reload();
                    }
                    itemSelectedId = null
                })
            }
        }
    },


    // @method getContext
    // @returns {ItemViews.RelatedItem.View.Context}
    getContext: function () {
       
        // @class ItemViews.RelatedItem.View.Context
        return {
            // @property {String} itemURL
            itemURL: this.model.getFullLink(),
            // @property {String} itemName
            itemName: this.model.get('_name') || this.model.Name,
            // @property {ImageContainer} thumbnail
            thumbnail: this.model.getThumbnail(),
            // @property {String} sku
            sku: this.model.get('_sku'),
            // @property {String} itemId
            itemId: this.model.get('_id'),
            // @property {Item.Model} model
            model: JSON.stringify(this.model),
            // @property {Boolean} showRating
            showRating: SC.ENVIRONMENT.REVIEWS_CONFIG && SC.ENVIRONMENT.REVIEWS_CONFIG.enabled,
            // @property {String} track_productlist_list
            track_productlist_list: this.model.get('track_productlist_list'),
            // @property {String} track_productlist_position
            track_productlist_position: this.model.get('track_productlist_position'),
            // @property {String} track_productlist_category
            track_productlist_category: this.model.get('track_productlist_category'),
            
            upsell:this.upsell,

            showIncludeCheckbox: this.options.showIncludeCheckbox
        };
        // @class ItemViews.RelatedItem.View
    }
});

// @class ItemViews.RelatedItem.View.Initialize.Options
// @property {Item.Model} model

export = ItemRelationsRelatedItemView;
