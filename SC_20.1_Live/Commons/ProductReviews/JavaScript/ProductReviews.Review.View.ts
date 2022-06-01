/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductReviews.Review.View"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as product_reviews_review from 'product_reviews_review.tpl';
import * as jQuery from '../../Core/JavaScript/jQuery';

import GlobalViewsStarRatingView = require('../../GlobalViews/JavaScript/GlobalViews.StarRating.View');
import GlobalViewsMessageView = require('../../GlobalViews/JavaScript/GlobalViews.Message.View');
import Backbone = require('../../Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');
import BackboneCompositeView = require('../../Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import Cookies = require('../../../Commons/Utilities/JavaScript/js.cookie');

// @class ProductReviews.Review.View This view is shown when listing the reviews of an item contains event handlers for voting helpfulness and flaging a review @extend {BackboneView}

export = BackboneView.extend({
    template: product_reviews_review,

    events: {
        'click button[data-action="vote"]': 'markReview'
    },

    initialize: function(options) {
        BackboneCompositeView.add(this);
        this.collection = options.collection;
        this.showActionButtons = options.showActionButtons;
        this.voted = false;
    },

    // @method handleMarkSuccess Handle async logic after marking a review as useful or not useful
    // @param {Number} review_id
    // @param {string} action Indicate if the action was marking the review as useful or not
    // @param {ProductReviews.Model} review Review Model
    // @param {jQuery.Element} $element jQuery element that represent the button
    handleMarkSuccess: function(review_id, action, review, $element) {
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

        this.model = review;

        const global_view_message = new GlobalViewsMessageView({
            message: Utils.translate('<strong>Thank You!</strong> We love your feedback.'),
            type: 'success',
            closable: true
        });

        $element.html(
            action === 'mark-as-useful'
                ? Utils.translate('Yes ($(0))', this.model.get('useful_count'))
                : Utils.translate('No ($(0))', this.model.get('not_useful_count'))
        );

        this.$el.find($element).addClass('product-reviews-review-voted');

        this.$el
            .find('[data-type="alert-placeholder"]')
            .html(global_view_message.render().$el.html());
    },

    // @method handleMarkError Handle the logic after marking a review as useful or not useful in the case the synchronization with the back-end
    // produce an error
    // @param {jQuery} $container jQuery element containing the review
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

        if (!$element.hasClass('disabled') && !this.voted) {
            const rated = {};
            const { proxy } = jQuery;
            const action = $element.data('type');
            const $container = $element.closest('.review-container');
            // we get the review from the collection
            const review_id = $element.data('review-id');
            const review = this.collection.get(review_id);

            $element.addClass('disabled');

            // lock buttons reviews
            this.voted = true;

            // we set the action that we are going to call
            review.set({
                action: action,
                rated: rated
            });

            // and then we do the save the review
            review
                .save()
                .then(
                    proxy(this.handleMarkSuccess, this, review_id, action, review, $element),
                    proxy(this.handleMarkError, this, $container)
                );
        }
    },

    childViews: {
        'ProductReview.Review.Global.StarRating': function() {
            return new GlobalViewsStarRatingView({
                model: this.model,
                showRatingCount: false
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
                childViewOptions: {
                    showRatingCount: false,
                    className: 'pegs text-center'
                },
                viewsPerRow: 1
            });
        }
    },

    // @method getContext @returns {ProductReviews.Review.View.Context}
    getContext: function() {
        const rated = this.model.get('rated') || {};
        rated.voted = this.voted;

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
            reviewText: this.model.get('text'),
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
    }
});
