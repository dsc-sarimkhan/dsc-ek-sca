/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Facets.Browse.View"/>

import * as _ from 'underscore';

import '../../BootstrapExtras/JavaScript/Bootstrap.Slider';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as facets_facet_browse_tpl from 'facets_facet_browse.tpl';
import * as facets_items_collection_tpl from 'facets_items_collection.tpl';
import * as facets_items_collection_view_cell_tpl from 'facets_items_collection_view_cell.tpl';
import * as facets_items_collection_view_row_tpl from 'facets_items_collection_view_row.tpl';
import * as jQuery from '../../Core/JavaScript/jQuery';

import Configuration = require('../../Utilities/JavaScript/SC.Configuration');
import LiveOrderModel = require('../../../Commons/LiveOrder/JavaScript/LiveOrder.Model');

import Categories = require('../../../Commons/Categories/JavaScript/Categories');
import CategoriesModel = require('../../../Commons/Categories/JavaScript/Categories.Model');
import CategoriesUtils = require('../../../Commons/Categories/JavaScript/Categories.Utils');

import FacetsHelper = require('./Facets.Helper');
import FacetsModel = require('./Facets.Model');
import FacetsFacetedNavigationView = require('./Facets.FacetedNavigation.View');
import FacetsFacetsDisplayView = require('./Facets.FacetsDisplay.View');
import FacetsItemListDisplaySelectorView = require('./Facets.ItemListDisplaySelector.View');
import FacetsItemListSortSelectorView = require('./Facets.ItemListSortSelector.View');
import FacetsItemListShowSelectorView = require('./Facets.ItemListShowSelector.View');
import FacetsItemCellView = require('./Facets.ItemCell.View');
import FacetsEmptyView = require('./Facets.Empty.View');
import FacetsBrowseCategoryHeadingView = require('./Facets.Browse.CategoryHeading.View');
import FacetsCategoryCellView = require('./Facets.CategoryCell.View');
import FacetsFacetedNavigationItemView = require('../../../Commons/Facets/JavaScript/Facets.FacetedNavigationItem.View');
import FacetsFacetedNavigationItemCategoryView = require('./Facets.FacetedNavigationItemCategory.View');

import GlobalViewsPaginationView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Pagination.View');

import Tracker = require('../../../Commons/Tracker/JavaScript/Tracker');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import AjaxRequestsKiller = require('../../../Commons/AjaxRequestsKiller/JavaScript/AjaxRequestsKiller');

// statuses stores the statuses of the collapsible facets
const statuses = ((<any>window).statuses = {});
// collapsable_elements stores the statuses of the collapsible elements. This store elements collapsable that are not facets
/*
	each object should be of the form
	{
		selector: '' //id of the element that will collapsed/expanded
	,	collapsed: true/false
	}
	*/
const collapsable_elements = ((<any>window).collapsable_elements = {});

// @class Facets.Browse.View View that handles the item list @extends Backbone.View
export = BackboneView.extend({
    template: facets_facet_browse_tpl,

    description: Utils.translate('This is a description'),

    enhancedEcommercePage: true,

    attributes: {
        id: 'facet-browse',
        class: 'view facet-browse',
        'data-root-component-id': 'Facets.Browse.View'
    },

    events: {
        'click [data-toggle="facet-navigation"]': 'toggleFacetNavigation',
        'click [data-action="toggle-filters"]': 'toggleFilters',

        'click [data-view="Facets.FacetsDisplay"] a': '_gotoFacets',
        'click [data-view="Facets.FacetedNavigation"] a': '_gotoFacets',
        'click [data-view="GlobalViews.Pagination"] a': '_gotoPage',
        'click [data-view="Facets.ItemListDisplaySelector"] a': '_gotoDisplay',
        'change [data-view="Facets.ItemListShowSelector"] select': '_gotoShow',
        'change [data-view="Facets.ItemListSortSelector"] select': '_gotoOrder'
    },

    initialize: function(options) {
        this.options = options;
        this.application = options.application;
        this.statuses = statuses;
        this.collapsable_elements = collapsable_elements;
        this.translatorConfig = this.application.translatorConfig;

        const fullurl = Backbone.history.fragment;
        const url = fullurl.split('?')[0];

        this.categoriesTopLevelUrl = Categories.getTopLevelCategoriesUrlComponent();
        this.isCategoryPage = !!_.find(this.categoriesTopLevelUrl, function(categoryUrl: string) {
            categoryUrl = Utils.correctURL(categoryUrl);
            const caturl = Utils.correctURL(url);

            return caturl.indexOf(categoryUrl) === 0;
        });

        this.model = new FacetsModel();
        this.translator = FacetsHelper.parseUrl(
            fullurl,
            this.translatorConfig,
            this.isCategoryPage
        );
        this.router = this.constructor.router;

        this.setOptionsTranslator();

        this.model.options = {
            data: this.translator.getApiParams(),
            killerId: AjaxRequestsKiller.getKillerId(),
            pageGeneratorPreload: true
        };

        if (this.isCategoryPage) {
            const categoryModel = new CategoriesModel();

            categoryModel.options = {
                data: { fullurl: this.translator.getCategoryUrl() },
                killerId: AjaxRequestsKiller.getKillerId()
            };

            this.model.set('category', categoryModel);
        }

        this.itemsDisplayOptions = Utils.deepCopy(
            this.application.getConfig('itemsDisplayOptions')
        );
        this.resultsPerPage = Utils.deepCopy(this.application.getConfig('resultsPerPage'));
        this.sortOptions = Utils.deepCopy(this.application.getConfig('sortOptions'));

        _.each(this.resultsPerPage, function(perPage: any) {
            perPage.id = String(perPage.items);
        });

        this.cart = LiveOrderModel.getInstance();

        this.collapsable_elements['facet-header'] = this.collapsable_elements['facet-header'] || {
            selector: 'this.collapsable_elements["facet-header"]',
            collapsed: false
        };
    },

    beforeShowContent: function beforeShowContent() {
        const promise = jQuery.Deferred();

        // if prices aren't to be shown we take out price related facet
        // and clean up the url
        if (ProfileModel.getInstance().hidePrices()) {
            this.translator = this.translator.cloneWithoutFacetId('onlinecustomerprice');
        }

        const self = this;
        const models = [this.model];
        const categoryModel = this.model.get('category');

        if (categoryModel) {
            models.push(categoryModel);
        }

        jQuery.when
            .apply(null, _.invoke(models, 'fetch', {}))
            .then(function(facetResponse) {
                facetResponse = categoryModel ? facetResponse[0] : facetResponse;

                if (facetResponse.corrections && facetResponse.corrections.length > 0) {
                    const unaliased_url = self.router.unaliasUrl(null, facetResponse.corrections);
                    promise.reject();

                    if (SC.ENVIRONMENT.jsEnvironment === 'server') {
                        nsglobal.statusCode = 301;
                        nsglobal.location = '/' + unaliased_url;
                    } else {
                        Backbone.history.navigate('#' + unaliased_url, { trigger: true });
                    }
                } else {
                    self.translator.setLabelsFromFacets(self.model.get('facets') || []);
                    promise.resolve();
                }
            })
            .fail(function(jqXhr) {
                promise.reject();

                if (jqXhr.status + '' === '404') {
                    self.application.getLayout().notFound();
                }
            });

        return promise;
    },

    // @method getPagination Return the info of the current options in the PLP
    // @return {Object}
    getPagination: function getPagination() {
        return {
            currentPage: this.translator.getOptionValue('page'),
            pageCount: this.totalPages,
            itemCount: this.model.get('total'),
            pageSize: parseInt(this.translator.getOptionValue('show'), 10),
            sorting: this.translator.getOptionValue('order'),
            display: this.translator.getOptionValue('display'),
            filters: this._getFacetsTranslator(this.translator),
            searchText: this.translator.getOptionValue('keywords')
        };
    },

    _setEvent: function _setEvent(options) {
        this.setEvent(options.eventName, options.value).fail(function() {
            if (options.event.currentTarget.nodeName === 'SELECT') {
                options.event.currentTarget.value = options.valueOriginal;
            }

            options.event.stopPropagation();
            options.event.preventDefault();
        });
    },

    _getFacetsTranslator: function(translator) {
        const facets = {};
        const allFacets = translator.getAllFacets();

        _.each(allFacets, function(facet: any) {
            facets[facet.url] = facet.value;
        });

        return facets;
    },

    _gotoFacets: function _gotoFacet(e) {
        const url = e.currentTarget.href;
        const translator = FacetsHelper.parseUrl(
            url,
            this.translator.configuration,
            !!this.model.get('category')
        );

        this._setEvent({
            event: e,
            eventName: 'Filters',
            value: this._getFacetsTranslator(translator)
        });
    },

    _gotoDisplay: function gotoDisplay(e) {
        const default_value = _.find(this.itemsDisplayOptions, function(result: any) {
            return result.isDefault;
        }).id;
        const display = Utils.getParameterByName(e.currentTarget.href, 'display') || default_value;

        this._setEvent({ event: e, eventName: 'Display', value: display });
    },

    _gotoShow: function gotoShow(e) {
        const original = this.translator.getUrl();
        const default_value = _.find(this.resultsPerPage, function(result: any) {
            return result.isDefault;
        }).id;
        const show =
            parseInt(Utils.getParameterByName(e.currentTarget.value, 'show'), 10) || default_value;

        this._setEvent({
            event: e,
            eventName: 'PageSize',
            value: show,
            valueOriginal: original
        });
    },

    _gotoOrder: function gotoOrder(e) {
        const original = this.translator.getUrl();
        const default_value = _.find(this.sortOptions, function(result: any) {
            return result.isDefault;
        }).id;
        const order = Utils.getParameterByName(e.currentTarget.value, 'order') || default_value;

        this._setEvent({
            event: e,
            eventName: 'Sorting',
            value: order,
            valueOriginal: original
        });
    },

    _gotoPage: function gotoPage(e) {
        const order = parseInt(Utils.getParameterByName(e.currentTarget.href, 'page'), 10) || 1;

        this._setEvent({ event: e, eventName: 'CurrentPage', value: order });
    },

    setEvent: function setEvent(event_name, value) {
        const self = this;
        const pagination = this.getPagination();

        pagination['set' + event_name] = value;

        return this.model
            .cancelableTrigger('before:FacetModel.set' + event_name, pagination)
            .done(function() {
                Backbone.history.once('route', function() {
                    const pagination = self.getPagination();

                    pagination[event_name.charAt(0).toLowerCase() + event_name.slice(1)] = value;
                    self.model.cancelableTrigger('after:FacetModel.set' + event_name, pagination);
                });
            });
    },

    // @method toggleFilters
    toggleFilters: function(e) {
        e.preventDefault();

        const current_target = jQuery(e.currentTarget);

        this.collapsable_elements['facet-header'].collapsed = !this.collapsable_elements[
            'facet-header'
        ].collapsed;

        current_target.find('.filter-icon').toggleClass('icon-chevron-up');

        current_target
            .parents('[data-type="accordion"]')
            .toggleClass('well')
            .toggleClass('facet-header-white-well')
            .find('[data-type="accordion-body"]')
            .stop()
            .slideToggle();
    },

    // @method getPath
    getPath: function() {
        const base_url = window.location.protocol + '//' + window.location.hostname;
        if (this.model.get('category')) {
            const category_canonical =
                this.model.get('category').get('canonical') ||
                this.model.get('category').get('fullurl');
            return (category_canonical.indexOf('/') === 0 ? base_url : '') + category_canonical;
        }
        const canonical = base_url + '/' + Backbone.history.fragment;
        const index_of_query = canonical.indexOf('?');

        // !~ means: indexOf == -1
        return !~index_of_query ? canonical : canonical.substring(0, index_of_query);
    },

    // @method getCanonical
    getCanonical: function() {
        let canonical_url = this.getPath();
        const current_page = this.translator.getOptionValue('page');

        if (current_page > 1) {
            canonical_url += '?page=' + current_page;
        }

        return canonical_url;
    },

    // @method getRelPrev
    getRelPrev: function() {
        let previous_page_url = this.getPath();
        const current_page = this.translator.getOptionValue('page');

        if (current_page > 1) {
            if (current_page === 2) {
                return previous_page_url;
            }

            if (current_page > 2) {
                return (previous_page_url += '?page=' + (current_page - 1));
            }
        }

        return null;
    },

    // @method getRelNext
    getRelNext: function() {
        let next_page_url = this.getPath();
        const current_page = this.translator.getOptionValue('page');

        if (current_page < this.totalPages) {
            return (next_page_url += '?page=' + (current_page + 1));
        }

        return null;
    },

    // @method formatFacetTitle: accepts a facet object and returns a string formatted to be displayed on the document's title according with user facet configuration property titleToken
    // @param {Object} facet @returns {String}
    formatFacetTitle: function(facet) {
        const defaults = {
            range: '$(2): $(0) to $(1)',
            multi: '$(1): $(0)',
            single: '$(1): $(0)'
        };

        if (!facet.config.titleToken) {
            facet.config.titleToken = defaults[facet.config.behavior] || defaults.single;
        }
        if (_.isFunction(facet.config.titleToken)) {
            return facet.config.titleToken(facet);
        }
        if (facet.config.behavior === 'range') {
            return Utils.translate(
                facet.config.titleToken,
                facet.value.to,
                facet.value.from,
                facet.config.name
            );
        }
        if (facet.config.behavior === 'multi') {
            const buffer = [];
            _.each(facet.value, function(val) {
                buffer.push(val);
            });
            return Utils.translate(facet.config.titleToken, buffer.join(', '), facet.config.name);
        }
        const value = this.translator.getLabelForValue(facet.config.id, facet.value);

        return Utils.translate(facet.config.titleToken, value, facet.config.name);
    },

    // @method getTitle overrides Backbone.Views.getTitle
    getTitle: function() {
        if (this.title) {
            return this.title;
        }

        const { facets } = this.translator;
        const category = this.model.get('category');
        let title = category
            ? category.get('pagetitle') || _.pluck(this.getBreadcrumbPages(), 'text').join(' > ')
            : this.title;

        if (facets && facets.length) {
            const buffer = [];
            let facet = null;

            for (let i = 0; i < facets.length; i++) {
                facet = facets[i];
                buffer.push(this.formatFacetTitle(facet));

                if (i < facets.length - 1) {
                    buffer.push(facet.config.titleSeparator || ', ');
                }
            }

            title = title ? title + ' - ' : '';

            title =
                this.application.getConfig('searchTitlePrefix', '') +
                buffer.join('') +
                this.application.getConfig('searchTitleSuffix', '');
        } else if (this.translator.getOptionValue('keywords')) {
            title = Utils.translate(
                'Search results for "$(0)"',
                this.translator.getOptionValue('keywords')
            );
        } else {
            title = title || this.application.getConfig('defaultSearchTitle', '');
        }

        // Update the meta tag 'twitter:title'
        this.setMetaTwitterTitle(title);

        return title;
    },

    // @method getMetaDescription Get view's SEO attributes @return {String}
    getMetaDescription: function() {
        const category = this.model.get('category');

        return (category && category.get('metadescription')) || this.metaDescription;
    },

    // @method getMetaKeywords @return {String}
    getMetaKeywords: function() {
        const category = this.model.get('category');

        return (category && category.get('metakeywords')) || this.metaKeywords;
    },

    getAddToHead: function() {
        const category = this.model.get('category');

        return (category && category.get('addtohead')) || this.addToHead;
    },

    // @method setMetaTwitterTitle @param {Strnig}title
    setMetaTwitterTitle: function(title) {
        const seo_twitter_title = jQuery('meta[name="twitter:title"]');
        seo_twitter_title && seo_twitter_title.attr('content', title);
    },

    // @method setOptionsTranslator Set up the default option for displaying the facets.
    // If we are in a small device, we've got to omit the 'grid' display option,
    // for it is not showing in this kind of devices. We must change it for 'table'
    setOptionsTranslator: function() {
        if (this.translator.options.display === 'grid' && Utils.isPhoneDevice()) {
            this.translator.options.display = 'table';
        }
    },

    // @method showContent overrides Backbone.View.showContent to works with the title to find the proper wording and calls the layout.showContent
    showContent: function() {
        // If its a free text search it will work with the title
        const self = this;
        let keywords = this.translator.getOptionValue('keywords');
        const resultCount = this.model.get('total');

        if (keywords) {
            keywords = decodeURIComponent(keywords);

            if (resultCount > 0) {
                this.subtitle =
                    resultCount > 1
                        ? Utils.translate('Results for "$(0)"', keywords)
                        : Utils.translate('Result for "$(0)"', keywords);
            } else {
                this.subtitle = Utils.translate(
                    'We couldn\'t find any items that match "$(0)"',
                    keywords
                );
            }
        }

        this.totalPages = Math.ceil(resultCount / this.translator.getOptionValue('show'));

        return this.application
            .getLayout()
            .showContent(this)
            .done(function() {
                if ((<any>jQuery.fn).scPush) {
                    self.$el.find('[data-action="pushable"]').scPush({ target: 'tablet' });
                }
            });
    },

    render: function() {
        let list_type = 'Facets';

        if (this.model.get('category')) {
            list_type = 'Category';
        } else if (this.translator.getOptionValue('keywords')) {
            list_type = 'Search';
        }

        Tracker.getInstance().trackProductList(this.model.get('items'), list_type);

        this._render();
    },

    // @method getBreadcrumbPages
    // It will generate an array suitable to pass it to the breadcrumb macro
    // It looks in the category facet value
    // @return {Array<Object>}
    getBreadcrumbPages: function() {
        const breadcrumb = [];

        if (this.model.get('category')) {
            const list = this.model.get('category').get('breadcrumb');
            const self = this;

            _.each(list, function(bread: any) {
                breadcrumb.push({
                    text: bread.name,
                    href: bread.fullurl,
                    additionalFields: CategoriesUtils.getAdditionalFields(
                        self.model.get('category').attributes,
                        'categories.breadcrumb.fields'
                    )
                });
            });

            return breadcrumb;
        }
        if (this.translator.getOptionValue('keywords')) {
            breadcrumb.push({
                href: '#',
                text: Utils.translate('Search Results')
            });
        } else {
            breadcrumb.push({
                href: this.application.translatorConfig.fallbackUrl
                    ? `/${this.application.translatorConfig.fallbackUrl}`
                    : '#',
                text: Utils.translate('Shop')
            });
        }

        return breadcrumb;
    },

    // @method toggleFacetNavigation Hides/Shows the facet navigation area
    toggleFacetNavigation: function() {
        this.$el.toggleClass('narrow-by');
        this.toggleNavigationListener(this.$el.hasClass('narrow-by'));
    },

    // @method toggleNavigationListener
    // adds/removes event listeners to the HTML to hide the facet navigation area
    // @param {Boolean} isOn
    toggleNavigationListener: function(isOn) {
        const self = this;
        let touch_started = null;

        // turn listeners on
        if (isOn) {
            jQuery('html')
                // we save the time when the touchstart happened
                .on('touchstart.narrow-by', function() {
                    touch_started = new Date().getTime();
                })
                // code for touchend and mousdown is the same
                .on('touchend.narrow-by mousedown.narrow-by', function(e) {
                    // if there wasn't a touch event, or the time difference between
                    // touch start and touch end is less that 200 miliseconds
                    // (this is to allow scrolling without closing the facet navigation area)
                    if (!touch_started || new Date().getTime() - touch_started < 200) {
                        const $target = jQuery(e.target);

                        // if we are not touching the narrow by button or the facet navigation area
                        if (
                            !$target.closest('[data-toggle="facet-navigation"]').length &&
                            !$target.closest('#faceted-navigation').length
                        ) {
                            // we hide the navigation
                            self.toggleFacetNavigation();
                        }
                    }
                });
        } else {
            jQuery('html')
                // if the navigation area is hidden, we remove the event listeners from the HTML
                .off('mousedown.narrow-by touchstart.narrow-by touchend.narrow-by');
        }
    },

    contextData: {
        itemList: function() {
            return Utils.deepCopy(this.model.get('items'));
        },
        category: function() {
            return Utils.deepCopy(this.model.get('category'));
        }
    },

    childViews: {
        'Facets.FacetedNavigation': function(options) {
            const exclude = _.map((options.excludeFacets || '').split(','), function(
                facet_id_to_exclude: any
            ) {
                return String(facet_id_to_exclude).trim();
            });
            const has_categories = !!(this.category && this.category.categories);
            const has_items = this.model.get('items').length;
            const has_facets =
                has_items && this.model.get('facets') && this.model.get('facets').length;
            const applied_facets = this.translator.cloneWithoutFacetId('category').facets;
            const has_applied_facets = applied_facets.length;

            return new FacetsFacetedNavigationView({
                categoryItemId: this.category && this.category.itemid,
                clearAllFacetsLink: this.translator.cloneWithoutFacets().getUrl(),
                hasCategories: has_categories,
                hasItems: has_items,

                // facets box is removed if don't find items
                hasFacets: has_facets,

                hasCategoriesAndFacets: has_categories && has_facets,

                // Categories are not a real facet, so lets remove those
                appliedFacets: applied_facets,

                hasFacetsOrAppliedFacets: has_facets || has_applied_facets,

                // ,	translatorUrl: this.translator.getUrl()
                translator: this.translator,

                // ,	translatorConfig: this.options.translatorConfig
                facets: _.filter(this.model.get('facets'), function(facet: any) {
                    return !_.contains(exclude, facet.id);
                }),

                totalProducts: this.model.get('total'),
                keywords: this.translator.getOptionValue('keywords')
            });
        },

        'Facets.FacetsDisplay': function() {
            const facets = this.translator
                .cloneWithoutFacetId('category')
                .getAllFacets()
                .sort(function(a, b) {
                    return b.config.priority - a.config.priority;
                });

            return new FacetsFacetsDisplayView({
                facets: facets,
                translator: this.translator
            });
        },

        'Facets.ItemListDisplaySelector': function() {
            return new FacetsItemListDisplaySelectorView({
                configClasses: 'pull-right',
                options: this.itemsDisplayOptions,
                translator: this.translator
            });
        },

        'Facets.ItemListSortSelector': function() {
            return new FacetsItemListSortSelectorView({
                options: this.sortOptions,
                translator: this.translator
            });
        },
        // Show 'XX products per page' View
        'Facets.ItemListShowSelector': function() {
            return new FacetsItemListShowSelectorView({
                options: this.resultsPerPage,
                translator: this.translator
            });
        },
        // Extra Facet filter View
        'Facets.FacetedNavigation.Item': function(options) {
            const facet_config = this.translator.getFacetConfig(options.facetId);
            const contructor_options: any = {
                model: new Backbone.Model(
                    _.findWhere(this.model.get('facets'), { id: options.facetId })
                ),
                translator: this.translator
            };

            if (facet_config.template) {
                contructor_options.template = facet_config.template;
            }

            return new FacetsFacetedNavigationItemView(contructor_options);
        },
        'Facets.Items': function() {
            const self = this;
            const display_option: any = _.find(this.itemsDisplayOptions, function(option) {
                return option.id === self.translator.getOptionValue('display');
            });

            return new BackboneCollectionView({
                childTemplate: display_option.template,
                childView: FacetsItemCellView,
                childViewOptions: {
                    application: this.application
                },
                viewsPerRow: parseInt(display_option.columns, 10),
                collection: this.model.get('items'),
                cellTemplate: facets_items_collection_view_cell_tpl,
                rowTemplate: facets_items_collection_view_row_tpl,
                template: facets_items_collection_tpl,
                context: {
                    keywords: this.translator.getOptionValue('keywords')
                }
            });
        },
        'Facets.Items.Empty': function() {
            return new FacetsEmptyView({
                keywords: this.translator.getOptionValue('keywords')
            });
        },
        'GlobalViews.Pagination': function() {
            const { translator } = this;

            return new GlobalViewsPaginationView(
                _.extend(
                    {
                        currentPage: translator.getOptionValue('page'),
                        totalPages: this.totalPages,
                        pager: function(page) {
                            return translator.cloneForOption('page', page).getUrl();
                        }
                    },
                    Configuration.defaultPaginationSettings
                )
            );
        },

        'Facets.Browse.CategoryHeading': function() {
            return new FacetsBrowseCategoryHeadingView({
                model: this.model.get('category'),
                showDescription:
                    this.translator.cloneWithoutFacetId('category').getAllFacets().length === 0
            });
        },

        'Facets.CategoryCells': function() {
            return new BackboneCollectionView({
                childView: FacetsCategoryCellView,
                collection: this.model.get('category')
                    ? this.model.get('category').get('categories')
                    : []
            });
        },

        'Facets.CategorySidebar': function() {
            return new FacetsFacetedNavigationItemCategoryView({
                model: this.model.get('category'),
                categoryUrl: this.translator.getCategoryUrl()
            });
        }
    },

    // @method getContext @returns {Facets.Browse.View.Context}
    getContext: function() {
        const hasSelectedFacets = this.translator.cloneWithoutFacetId('category').getAllFacets()
            .length;
        const hasSubcategories = this.model.get('category')
            ? this.model.get('category').get('categories').length
            : false;
        const hasItems = this.model.get('items') && this.model.get('items').length > 0;

        // @class Facets.Browse.View.Context
        return {
            // @property {Number} total
            total: this.model.get('total'),
            // @property {Boolean} isTotalProductsOne
            isTotalProductsOne: this.model.get('total') === 1,
            // @property {String} title
            title: this.getTitle(),
            // @property {Boolean} hasItemsAndFacets
            hasItemsAndFacets: !!(
                hasItems &&
                this.model.get('facets') &&
                this.model.get('facets').length
            ),
            // @property {Boolean} collapseHeader
            collapseHeader: !!this.collapsable_elements['facet-header'].collapsed,
            // @property {String} keywords
            keywords: this.translator.getOptionValue('keywords'),
            // @property {Boolean} showResults
            showResults: _.isNull(this.translator.getOptionValue('keywords'))
                ? true
                : this.model.get('total') > 0,
            // @property {Boolean} isEmptyList
            isEmptyList: this.model.get('total') <= 0,

            // @property {Boolean} isCategory
            isCategory: !!this.model.get('category'),

            // @property {Boolean} showItems
            showItems:
                hasItems ||
                (!hasItems && hasSelectedFacets) ||
                !(!hasItems && !hasSelectedFacets && hasSubcategories)
        };
        // @class Facets.Browse.View
    }
});
