/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PageType.Component"/>

import * as _ from 'underscore';

import { Loggers } from '../../Loggers/JavaScript/Loggers';
import { PageTypeCollection } from './PageType.Collection';
import * as Utils from '../../Utilities/JavaScript/Utils';
import { NavigationLoggerOptionalsOptions } from '../../../Advanced/Loggers.SCA/JavaScript/Loggers.Appender.Sensors';
import * as jQuery from '../../Core/JavaScript/jQuery';

import SCBaseComponent = require('../../SC/JavaScript/SC.BaseComponent');
import PageTypeRouter = require('./PageType.Router');
import Configuration = require('../../Utilities/JavaScript/SC.Configuration');

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
// import { PageTypeModel } from './PageType.Model';

// @module PageType.Component
/* interface PageType {
	name: string
	displayName: string
	template: string
}*/
interface PageContext {
    context: any;
    data: { promiseCMS: any; rendered: boolean; timeoutId: number };
}

function checkNavigationSearchResults(options, result) {
    let optionsExist = false;
    const url_options = Utils.parseUrlOptions(window.location.search);
    if (url_options && url_options.keywords) {
        optionsExist = true;
        options.searchQuery = url_options.keywords.toString();
        options.searchPageNumber = 1;
        options.searchResultCount = 0;
        if (url_options.page) {
            options.searchPageNumber = parseInt(url_options.page.toString(), 10);
        }
        if (result.model && result.model.get('items')) {
            options.searchResultCount = result.model.get('items').length;
        }
    }
    return optionsExist;
}

function checkNavigationItem(options, result) {
    let optionsExist = false;
    let itemId = 0;
    if (result.model && result.model.get('item') && result.model.get('item').id) {
        itemId = result.model.get('item').id;
    }
    if (itemId) {
        optionsExist = true;
        options.itemId = itemId;
    }
    return optionsExist;
}

export = function PageTypeComponentGenerator(application) {
    const Router = new PageTypeRouter(application);
    const CMSReady = jQuery.Deferred();
    let CMS;
    const routes = {};
    const pages = {};
    const allPageTypes = {};

    const templates = {};
    const types = {};
    let lastContext: PageContext = {
        context: {},
        data: {
            promiseCMS: jQuery.Deferred(),
            rendered: false,
            timeoutId: 0
        }
    };

    Backbone.on('cms:loaded', function(cms) {
        CMS = cms;
        CMSReady.resolve();
    });

    CMSReady.done(function() {
        CMS.on('page:content:set', function(_promise, _ccts, contentContext) {
            const fullContext = PageTypeComponent._validateCurrentContext(contentContext);

            if (fullContext) {
                var { data } = fullContext;

                if (data.rendered) {
                    const cctComponent = PageTypeComponent.application.getComponent('CMS');

                    cctComponent.addContents();
                } else if (data.timeoutId) {
                    clearTimeout(data.timeoutId);
                }

                data.promiseCMS.resolve();
            }
        });
    });

    var PageTypeComponent = SCBaseComponent.extend({
        componentName: 'PageType',

        application: application,

        pageTypes: new PageTypeCollection(
            (SC.ENVIRONMENT.PageTypes && SC.ENVIRONMENT.PageTypes.pageTypes) || []
        ),

        _validateCurrentContext: function _validateCurrentContext(context) {
            const contextLast: any = lastContext.context;

            if (contextLast.path === context.path) {
                return lastContext;
            }
            return null;
        },

        _getPage: function _getPage(url) {
            return pages[url];
        },

        _addPage: function _addPage(page, type, url) {
            if (type && url) {
                if (!routes[type]) {
                    routes[type] = [];
                }

                if (_.indexOf(routes[type], url) === -1) {
                    routes[type].push(url);
                }

                pages[url] = page;
            }
        },

        _addRoute: function _addRoute(options) {
            _.each(options.routes, function(route: string) {
                if (route[0] === '/') {
                    route = route.substr(1);
                }

                Router.route(route, options.type);
            });
        },
        _getPageType: function _getPageType(name) {
            return this.pageTypes.find(pageType => pageType.get('name') === name);
        },

        _updatePageTypes: function _updatePageTypes() {
            this.pageTypes.fetch().done(() => {
                const { context } = lastContext;
                Backbone.history.navigate(context.path, { trigger: false });
                Backbone.history.loadUrl(context.path);
            });
        },

        getPageTypes: function getPageTypes() {
            const data = {
                layouts: templates,
                types: {}
            };

            _.each(types, function(value: any, key) {
                if (value.registered) {
                    data.types[key] = value;
                }
            });

            return data;
        },

        getContext: function getContext() {
            return Utils.deepCopy(lastContext.context);
        },

        registerTemplate: function registerTemplate(templateData) {
            const { template } = templateData;

            if (!templates[template.name]) {
                templates[template.name] = {
                    name: template.displayName,
                    thumbnail: template.thumbnail
                };
            }

            _.each(templateData.pageTypes, function(pageType: any) {
                if (!types[pageType]) {
                    types[pageType] = {
                        supportedLayoutIds: []
                    };
                }

                if (_.indexOf(types[pageType].supportedLayoutIds, template.name) === -1) {
                    types[pageType].supportedLayoutIds.push(template.name);
                }
            });
        },

        _CmsViewPromises: function _CmsViewPromises(options) {
            const url =
                (Backbone.history.fragment && Backbone.history.fragment.split('?')[0]) ||
                Backbone.history.location.hash;
            const path = Utils.correctURL(url);

            const context = {
                path: options.path || path,
                site_id: options.site_id || Configuration.get('siteSettings.siteid'),
                page_type: options.page_type || '',
                page_type_display_name: options.page_type || ''
            };
            const pageTypeInfo = this._getPageType(options.page_type);

            if (pageTypeInfo) {
                context.page_type_display_name = pageTypeInfo.get('displayName');
            }

            const data = {
                promiseCMS: jQuery.Deferred(),
                rendered: false,
                timeoutId: 0
            };

            lastContext = {
                context: context,
                data: data
            };

            const self = this;
            const { view } = options;

            const promise = jQuery.Deferred();

            let promiseView = view ? jQuery.Deferred().resolve() : jQuery.Deferred().reject();

            if (view && view.beforeShowContent) {
                promiseView = view.beforeShowContent();
            }

            if (!Configuration.get('cms.useCMS')) {
                data.promiseCMS.resolve();
            } else {
                CMSReady.done(function() {
                    self.application.getLayout().once('beforeAppendView', function() {
                        if (self._validateCurrentContext(context) && !data.rendered) {
                            const cctComponent = self.application.getComponent('CMS');

                            cctComponent.addContents();
                        }
                    });

                    CMS.once('context:get', function(
                        promise // TODO: remove this event, is for test only
                    ) {
                        if (self._validateCurrentContext(context)) {
                            promise.resolve(context);
                        }
                    });

                    CMS.trigger('app:page:changed'); // Add context again as parameter and remove 'context:get' when issue is fixed

                    promiseView.done(function() {
                        data.timeoutId = setTimeout(function() {
                            if (self._validateCurrentContext(context)) {
                                data.rendered = true;
                                data.promiseCMS.resolve();
                            } else {
                                data.promiseCMS.reject();
                            }
                        }, Configuration.get('cms.contentWait', 200));
                    });
                });
            }

            jQuery
                .when(data.promiseCMS, promiseView)
                .done(function() {
                    promise.resolve();
                })
                .fail(function(promiseError) {
                    promise.reject(promiseError);
                });

            return promise;
        },

        registerPageType: function registerPageType(pagetype) {
            if (pagetype.name && pagetype.view) {
                allPageTypes[pagetype.name] = pagetype;
            }

            if (pagetype.name && pagetype.routes && !pagetype.view && allPageTypes[pagetype.name]) {
                pagetype.view = allPageTypes[pagetype.name].view;
            }

            const callback = function() {
                const loggers = Loggers.getLogger();
                loggers.start('Navigation');

                let view;

                if (pagetype.view) {
                    let url = Backbone.history.fragment;
                    url = url.split('?')[0]; // remove options
                    const page = pages[url];

                    const options: any = _.extend({}, pagetype.options || {}, {
                        application: application,
                        container: application,
                        routerArguments: arguments
                    });

                    if (page) {
                        options.pageInfo = page;
                    }

                    view = new pagetype.view(options);
                } else if (pagetype.callback) {
                    view = pagetype.callback.apply(arguments);
                }

                const data = {
                    view: view,
                    page_type: pagetype.name
                };

                PageTypeComponent._CmsViewPromises(data).done(function() {
                    view._pagetype = true;

                    const showContentPromise = view.showContent();
                    showContentPromise &&
                        showContentPromise.done(result => {
                            const options: Partial<NavigationLoggerOptionalsOptions> = {};
                            if (pagetype.name === 'ProductDetails.Full.View') {
                                checkNavigationItem(options, result);
                            } else if (pagetype.name === 'facet-browse') {
                                checkNavigationSearchResults(options, result);
                            }
                            if (view.inModal) {
                                options.displayedInModal = true;
                            }
                            loggers.endLast('Navigation', options);
                            if (Configuration.get('cms.useCMS')) {
                                CMS.trigger('app:page:rendered');
                            }
                        });
                });
            };

            if (pagetype.routes) {
                _.each(pagetype.routes, function(route: string) {
                    if (route[0] === '/') {
                        route = route.substr(1);
                    }

                    Router.route(route, callback);
                });
            } else {
                Router[pagetype.name] = callback;

                if (routes[pagetype.name]) {
                    let route: string;

                    while ((route = routes[pagetype.name].pop())) {
                        if (route[0] === '/') {
                            route = route.substr(1);
                        }

                        Router.route(route, pagetype.name);
                    }
                }
            }

            if (!types[pagetype.name]) {
                types[pagetype.name] = {
                    supportedLayoutIds: []
                };
            }

            types[pagetype.name].registered = true;

            if (pagetype.defaultTemplate) {
                templates[pagetype.defaultTemplate.name] = {
                    name: pagetype.defaultTemplate.displayName,
                    thumbnail: pagetype.defaultTemplate.thumbnail
                };

                types[pagetype.name].defaultLayoutId = pagetype.defaultTemplate.name;
                types[pagetype.name].supportedLayoutIds.push(pagetype.defaultTemplate.name);
            }
        }
    });

    return PageTypeComponent;
};
