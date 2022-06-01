/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="GlobalViews.RatingByStar.View"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended.d.ts" />

import * as global_views_rating_by_star_tpl from 'global_views_rating_by_star.tpl';
import * as jQuery from '../../Core/JavaScript/jQuery';

import Configuration = require('../../../Advanced/SCA/JavaScript/SC.Configuration');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// @class GlobalViews.RatingByStar.View @extends Backbone.View
const GlobalViewsRatingByStarView = BackboneView.extend({
    template: global_views_rating_by_star_tpl,

    initialize: function(options) {
        this.showPercentage = options.showPercentage;
        this.showCount = options.showCount;
        this.queryOptions = options.queryOptions;
        this.baseUrl = options.baseUrl;
    },

    // @method getContext @returns {GlobalViews.RatingByStar.View.Context}
    getContext: function() {
        const maxRate = Configuration.get('productReviews.maxRate');
        const ratingsCountsByRate = this.model.get('_ratingsCountsByRate');
        let count;
        let percentage;
        const rates = [];

        for (let i = maxRate; i > 0; i--) {
            count = ratingsCountsByRate[i] ? parseInt(ratingsCountsByRate[i]) : 0;
            percentage = (count * 100) / this.model.get('_ratingsCount');
            rates.push({
                count: count,
                percentage: percentage,
                percentageRound: Math.round(percentage),
                index: i,
                showLink: !!count,
                url: this.getUrlForOption({ filter: i + 'star' }),
                isOneReview: count === '1'
            });
        }

        // @class GlobalViews.RatingByStar.View.Context
        return {
            // @property {Boolean} showCount
            showCount: this.showCount,
            // @property {Boolean} showPercentage
            showPercentage: this.showPercentage,
            // @property {Array} rates
            rates: rates
        };
    },

    // creates a new url based on a new filter or sorting options
    getUrlForOption: function(option) {
        const options: any = {};
        const sort = (option && option.sort) || this.queryOptions.sort;
        const filter = (option && option.filter) || this.queryOptions.filter;

        if (filter) {
            options.filter = filter;
        }

        if (sort) {
            options.sort = sort;
        }

        return this.baseUrl + '?' + jQuery.param(options);
    }
});

export = GlobalViewsRatingByStarView;
