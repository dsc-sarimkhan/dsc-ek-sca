/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductReviews.Preview.View"/>

import '../../Utilities/JavaScript/SC.Configuration';
import './ProductReviews.Collection';

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as jQuery from '../../Core/JavaScript/jQuery';

import * as product_reviews_preview_review from 'product_reviews_preview_review.tpl';

import GlobalViewsStarRatingView = require('../../GlobalViews/JavaScript/GlobalViews.StarRating.View');
import GlobalViewsMessageView = require('../../GlobalViews/JavaScript/GlobalViews.Message.View');
import Backbone = require('../../Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');
import BackboneCompositeView = require('../../Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import Cookies = require('../../../Commons/Utilities/JavaScript/js.cookie');

// @class ProductReviews.Review.View This view is shown when listing the reviews of an item contains event handlers for voting helpfulness and flaging a review @extend {BackboneView}

export = BackboneView.extend({
    template: product_reviews_preview_review,

    events: {
        'click [data-action="vote"]': 'markReview'
    },

    initialize: function(options) {
        BackboneCompositeView.add(this);
        this.collection = options.collection;
        this.showActionButtons = options.showActionButtons;
    },

    childViews: {
        'Global.StarRating': function() {
            return new GlobalViewsStarRatingView({
                model: this.model,
                showRatingCount: false,
                showLabelRating: true,
                isReviewMode: true
            });
        },
        'Global.StarRatingAttribute': function() {
            const collection = new Backbone.Collection(
                _.map(this.model.get('rating_per_attribute'), function(value, key) {
                    return {
                        label: key,
                        rating: value
                    };
                })
            );
            return new BackboneCollectionView({
                collection: collection,
                childView: GlobalViewsStarRatingView,
                childViewOptions: { showRatingCount: false, className: 'pegs text-center' },
                viewsPerRow: 1
            });
        }
    },

    // @method getContext @returns {ProductReviews.Review.View.Context}
    getContext: function() {
        const rated = this.model.get('rated') || {};
        rated.voted = rated['mark-as-useful'] || rated['mark-as-not-useful'];

        // @class ProductReviews.Review.View.Context
        return {
            // @property {String} reviewCreatedOn
            reviewCreatedOn: this.model.get('created_on') || new Date().toDateString(),
            // @property {String} reviewTitle
            reviewTitle: this.model.get('title'),
            // @property {String} reviewAuthor
            reviewAuthor: this.model.get('writer').name || Utils.translate('anonymous'),
            // @property {Boolean} isReviewVerified
            isReviewVerified: !!this.model.get('isVerified'),
            // @property {String} reviewText
            reviewText: this.model.get('text').replace(/\n/g, '<br>'),
            // @property {Boolean} isReviewRatingPerAttributesLegthGreaterThan0
            isReviewRatingPerAttributesLegthGreaterThan0: !!_.values(
                this.model.get('rating_per_attribute')
            ).length,
            // @property {Boolean} showActionButtons
            showActionButtons: this.showActionButtons,
            // @property {String} usefulButtonClass
            usefulButtonClass: rated.voted
                ? 'disabled' + (rated['mark-as-useful'] ? ' btn-success' : '')
                : '',
            // @property {Number} reviewId
            reviewId: this.model.get('internalid'),
            // @property {Boolean} usefulCountGreaterThan0
            usefulCountGreaterThan0: this.model.get('useful_count') > 0,
            // @property {Number} usefulCount
            usefulCount: this.model.get('useful_count'),
            // @property {String} notUsefulButtonClass
            notUsefulButtonClass: rated.voted
                ? 'disabled' + (rated['mark-as-not-useful'] ? ' btn-success' : '')
                : '',
            // @property {Boolean} notusefulCountGreater
            notusefulCountGreater: this.model.get('not_useful_count') > 0,
            // @property {Number} notUsefulCount
            notUsefulCount: this.model.get('not_useful_count')
        };
    },

    // @mehtod handleMarkSuccess Handle async logic after marking a review as useful or not useful
    // @param {Number} review_id
    // @param {string} action Indicate if the action was marking the review as useful or not
    // @parma {ProductReviews.Model} review Review Model
    // @parma {jQuery} $container jQuery element containing the review
    handleMarkSuccess: function(review_id, action, review, $container) {
        // const currentReviewedItems = JSON.parse(jQuery.cookie('votedReviewsId') || '{}');
        const currentReviewedItems = JSON.parse(Cookies.get('votedReviewsId') || '{}');

        // this should be always false because you cannot mark an already marked review
        if (!currentReviewedItems[review_id]) {
            currentReviewedItems[review_id] = {};
            currentReviewedItems[review_id][action] = true;
            Cookies.set('votedReviewsId', JSON.stringify(currentReviewedItems), { expires: 365 });

            const rated: any = {};
            rated[action] = true;
            rated.voted = true;
            review.set('rated', rated);
        }

        const global_view_message = new GlobalViewsMessageView({
            message: Utils.translate('<strong>Thank You!</strong> We love your feedback.'),
            type: 'success',
            closable: true
        });

        this.model = review;
        this.render();

        $container
            .find('[data-id="' + review_id + '"] [data-type="alert-placeholder"]')
            .html(global_view_message.render().$el.html());
    },

    // @method handleMarkError Hadle the logic after marking a review as useful or not usefull in the case the synchronization with the backend
    // produce an error
    // @parma {jQuery} $container jQuery element containing the review
    handleMarkError: function($container) {
        const global_view_message = new GlobalViewsMessageView({
            message: Utils.translate(
                '<b>We are sorry!</b> There has been an error, please try again later.'
            ),
            type: 'warning',
            closable: true
        });

        // otherwise we show an error message
        $container
            .find('[data-action="vote"]')
            .removeClass('disabled')
            .end()
            .find('[data-type="alert-placeholder"]')
            .html(global_view_message.render().$el.html());
    },

    // @method markReview Handles the ajax call to vote or flag a review //@param {Event} e
    markReview: function(e) {
        const $element = jQuery(e.target);

        if (!$element.hasClass('disabled')) {
            const rated = {};
            const { proxy } = jQuery;
            const action = $element.data('type');
            const $container = $element.closest('.review-container');
            // we get the review from the collection
            const review_id = $element.data('review-id');
            const review = this.collection.get(review_id);

            $element.addClass('disabled');

            rated[action] = true;

            // we set the action that we are going to call
            review.set({
                action: action,
                rated: rated
            });

            // and then we do the save the review
            review
                .save()
                .then(
                    proxy(this.handleMarkSuccess, this, review_id, action, review, $container),
                    proxy(this.handleMarkError, this, $container)
                );
        }
    }
});
