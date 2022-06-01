/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductReviews.Center.View"/>

import * as _ from 'underscore';
import '../../jQueryExtras/JavaScript/jQuery.scPush';
import * as product_reviews_center from 'product_reviews_center.tpl';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as jQuery from '../../Core/JavaScript/jQuery';
import { JSONObject } from '../../Utilities/JavaScript/Utils.Interfaces';
import {
    Review as JsonldReview,
    Offer as JsonldOffer,
    AggregateRating as JsonldAggregateRating
} from '../../../node_modules/schema-dts/schema';

import UrlHelper = require('../../UrlHelper/JavaScript/UrlHelper');

import Configuration = require('../../Utilities/JavaScript/SC.Configuration');
import ListHeaderView = require('../../ListHeader/JavaScript/ListHeader.View');
import ProductReviewsCollection = require('./ProductReviews.Collection');
import ProductReviewsReviewView = require('./ProductReviews.Review.View');
import GlobalViewsStarRatingView = require('../../GlobalViews/JavaScript/GlobalViews.StarRating.View');
import GlobalViewsRatingByStarView = require('../../GlobalViews/JavaScript/GlobalViews.RatingByStar.View');
import GlobalViewsPaginationView = require('../../GlobalViews/JavaScript/GlobalViews.Pagination.View');
import Backbone = require('../../Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');
import BackboneCompositeView = require('../../Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../Backbone.CollectionView/JavaScript/Backbone.CollectionView');

// @class ProductReviews.Center.View
// This view is shown when listing the reviews of an item contains event handlers for voting
// helpfulness and flaging a review
// @extends Backbone.View
export = BackboneView.extend({
    template: product_reviews_center,

    attributes: {
        id: 'item-product-reviews',
        class: 'item-product-reviews item-detailed-reviews'
    },

    initialize: function(options): void {
        BackboneCompositeView.add(this);

        this.item = options.item;
        this.baseUrl = 'product/' + options.item.get('internalid');

        this.queryOptions = Utils.parseUrlOptions(window.location.href);
        this.application = options.application;

        this.collection = new ProductReviewsCollection();
        this.collection.itemid = this.item.get('internalid');

        const self = this;
        const reviews_params = this.collection.getReviewParams(this.queryOptions);

        reviews_params.itemid = this.item.get('internalid');

        // return the fetch 'promise'
        this.reviewsPromise = jQuery.Deferred();
        this.collection
            .fetch({
                data: reviews_params,
                killerId: this.killerId
            })
            .done(function(): void {
                self.updateCannonicalLinks();

                // append and render the view
                // $placeholder.empty().append(this.$el);
                self.render();

                self.collection.on('reset', function(): void {
                    self.render();
                });
                self.reviewsPromise.resolve();
            });
    },

    render: function render(): void {
        this._render();
        this.$('[data-action="pushable"]').scPush();
    },

    // @method getRelPrev
    // @return {String?}
    getRelPrev: function getRelPrev(): string | null {
        const current_page = (this.queryOptions && parseInt(this.queryOptions.page, 2)) || 1;

        if (current_page > 1) {
            if (current_page === 2) {
                return this.baseUrl;
            }

            if (current_page > 2) {
                return this.baseUrl + '?page=' + (current_page - 1);
            }
        }
        return null;
    },

    // @method getRelNext
    // @return {String}
    getRelNext: function getRelNext(): string | null {
        const current_page = (this.queryOptions && this.queryOptions.page) || 1;

        if (current_page < this.collection.totalPages) {
            this.baseUrl += '?page=' + (current_page + 1);
            return this.baseUrl;
        }
        return null;
    },

    // @method getUrlForOption creates a new url based on a new filter or sorting options
    // @param {filter:String,sort:String} option
    getUrlForOption: function getUrlForOption(option: any = {}): string {
        const options: any = {};
        const sort = option.sort || this.queryOptions.sort;
        const filter = option.filter || this.queryOptions.filter;

        if (filter) {
            options.filter = filter;
        }

        if (sort) {
            options.sort = sort;
        }

        return this.baseUrl + '?' + jQuery.param(options);
    },

    // @method setupListHeader @param {Backbone.Collection} collection
    setupListHeader: function setupListHeader(collection): any {
        const sorts = _(Configuration.get('productReviews.sortOptions')).map(function(
            sort: any
        ): any {
            sort.value = sort.id;
            return sort;
        });
        const filters = _(Configuration.get('productReviews.filterOptions')).map(function(
            filter: any
        ): any {
            filter.value = filter.id;
            return filter;
        });

        return {
            view: this,
            application: this.application,
            collection: collection,
            sorts: sorts,
            filters: filters,
            avoidFirstFetch: true,
            totalCount: this.item.get('_ratingsCount'),
            customFilterHandler: this.filterOptionsHandler
        };
    },

    // @method updateCannonicalLinks
    updateCannonicalLinks: function updateCannonicalLinks(): void {
        const $head = jQuery('head');
        const previous_page = this.getRelPrev();
        const next_page = this.getRelNext();

        $head.find('link[rel="next"], link[rel="prev"]').remove();

        if (previous_page) {
            jQuery('<link/>', {
                rel: 'prev',
                href: previous_page
            }).appendTo($head);
        }

        if (next_page) {
            jQuery('<link/>', {
                rel: 'next',
                href: next_page
            }).appendTo($head);
        }
    },

    filterOptionsHandler: function filterOptionsHandler(element, elem_sort): any {
        if (element.id !== 'all') {
            elem_sort.find('option[value="date"]').prop('selected', true);
            elem_sort.prop('disabled', true);
        } else {
            elem_sort.prop('disabled', false);
        }
    },
    childViews: {
        'ProductReviews.Review': function(): any {
            return new BackboneCollectionView({
                collection: this.collection,
                childView: ProductReviewsReviewView,
                childViewOptions: _.extend(
                    {
                        showActionButtons: true,
                        collection: this.collection
                    },
                    Configuration.get('productReviews')
                ),
                viewsPerRow: 1
            });
        },

        'Global.StarRating': function(): any {
            return new GlobalViewsStarRatingView({
                model: this.item,
                showRatingCount: false,
                showValue: true
            });
        },

        'Global.RatingByStar': function(): any {
            return new GlobalViewsRatingByStarView({
                model: this.item,
                queryOptions: this.queryOptions,
                baseUrl: this.baseUrl,
                showPercentage: true,
                showCount: true
            });
        },

        'GlobalViews.Pagination': function(): any {
            return new GlobalViewsPaginationView(
                _.extend(
                    {
                        currentPage: this.collection.page || 0,
                        totalPages: this.collection.totalPages || 0,
                        pager: (page): any => {
                            return (
                                '/' +
                                (page > 1
                                    ? UrlHelper.setUrlParameter(
                                          Backbone.history.fragment,
                                          'page',
                                          page
                                      )
                                    : UrlHelper.removeUrlParameter(
                                          Backbone.history.fragment,
                                          'page'
                                      ))
                            );
                        },
                        extraClass: 'pull-right no-margin-top no-margin-bottom'
                    },
                    Configuration.get('defaultPaginationSettings')
                )
            );
        },

        'ListHeader.View': function(): any {
            return new ListHeaderView(this.setupListHeader(this.collection));
        }
    },

    // @method Create JsonLd object with reviews info
    // @return {JQuery.Deferred<JsonldOffer>}
    getJsonLd: function getJsonLd(): JQuery.Deferred<JsonldOffer> {
        if (Configuration.get('structureddatamarkup.type') !== 'JSON-LD') {
            return jQuery.Deferred().resolve(null);
        }
        return this.reviewsPromise.then(
            (): JQuery.Deferred<JsonldOffer> => {
                const reviewsToAdd: JsonldReview[] = [];
                const ratingValue = this.item.get('_rating') || this.item.get('rating') || 0;
                const ratingCount = this.item.get('_ratingsCount') || 0;
                // Get Reviews
                if (this.collection.length > 0) {
                    this.collection.each(
                        (reviewItem: any): void => {
                            const review: JSONObject = Utils.deepCopy(reviewItem);
                            const newReview: JsonldReview = {
                                '@type': 'Review',
                                author: (review.writer as JSONObject).name.toString(),
                                datePublished: review.created_on.toString(),
                                description: review.text.toString(),
                                name: review.title.toString(),
                                reviewRating: {
                                    '@type': 'Rating',
                                    ratingValue: review.rating.toString()
                                }
                            };
                            reviewsToAdd.push(newReview);
                        }
                    );
                    const aggregateRating: JsonldAggregateRating = {
                        '@type': 'AggregateRating',
                        ratingValue: ratingValue.toString(),
                        reviewCount: ratingCount.toString()
                    };
                    const jsonLd: JsonldOffer = {
                        '@type': 'Offer',
                        aggregateRating: aggregateRating,
                        review: reviewsToAdd
                    };
                    return jQuery.Deferred().resolve(jsonLd);
                }
                return jQuery.Deferred().resolve({});
            }
        );
    },

    // @method getContext
    // @returns {ProductReviews.Center.View.Context}
    getContext: function getContext(): any {
        // @class ProductReviews.Center.View.Context
        return {
            // @property {Number} itemCount
            itemCount: this.item.get('_ratingsCount'),
            // @property {Boolean} hasOneReview
            hasOneReview: this.item.get('_ratingsCount') === 1,
            // @property {String} itemUrl
            itemUrl: this.item.get('_url'),
            // @property {String} pageHeader
            pageHeader: this.page_header,
            // @property {Number} totalRecords
            totalRecords: this.collection.totalRecordsFound
        };
        // @class ProductReviews.Center.View
    }
});
