/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ErrorManagement"/>

/*
@module ErrorManagement

Extends Backbone.View to provide showError and hideError. Also extends the application's layout with high level error methods.

Handles all errors related to api calls and provides a 404 and 500 error pages.

Also it manages 401 error (session expires) and do the redirect to login
*/

import * as _ from 'underscore';
import { Loggers } from '../../Loggers/JavaScript/Loggers';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as jQuery from '../../Core/JavaScript/jQuery';

import Session = require('../../Session/JavaScript/Session');
import ExpiredLinkView = require('./ErrorManagement.ExpiredLink.View');
import ForbiddenErrorView = require('./ErrorManagement.ForbiddenError.View');
import InternalErrorView = require('./ErrorManagement.InternalError.View');
import PageNotFoundView = require('./ErrorManagement.PageNotFound.View');
import ErrorManagementResponseErrorParser = require('./ErrorManagement.ResponseErrorParser');
import GlobalViewsMessageView = require('../../GlobalViews/JavaScript/GlobalViews.Message.View');
import ProfileModel = require('../../Profile/JavaScript/Profile.Model');
import Configuration = require('../../Utilities/JavaScript/SC.Configuration');
import UrlHelper = require('../../UrlHelper/JavaScript/UrlHelper');

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');
import Backbone = require('../../Utilities/JavaScript/backbone.custom');

// @module Backbone @class Backbone.View
_.extend(BackboneView.prototype, {
    // @method hideError we empty all of the error placeholders of the view
    hideError: function() {
        this.$('[data-type="alert-placeholder"]').empty();
    },

    /* @method showError @param {String} message @param {String} type @param {Boolean} closable
    @param {Boolean} disableElements */
    showError: function(message, type?, closable?, disableElements?) {
        this.hideError();

        // Finds or create the placeholder for the error message
        let placeholder = this.$('[data-type="alert-placeholder"]');

        if (!placeholder.length) {
            placeholder = jQuery('<div/>', { 'data-type': 'alert-placeholder' });
            this.$el.prepend(placeholder);
        }

        const global_view_message = new GlobalViewsMessageView({
            message: message,
            type: type || 'error',
            closable: !_.isUndefined(closable) ? !!closable : false
        });

        // Renders the error message and into the placeholder
        placeholder.append(global_view_message.render().$el.html());

        // Re Enables all posible disableded buttons of the view
        if (!disableElements) {
            this.$(':disabled').attr('disabled', false);
        }

        // If the backToTop module is loaded, we scroll to the top of the view to show the error.
        if (this.application) {
            _.result(this.application.getLayout(), 'backToTop');
        }
    },

    // @method showErrorInModal @param  {String} message
    showErrorInModal: function(message) {
        const view = new BackboneView({ application: this.application });

        view.title = Utils.translate('Error');
        view.render = function() {
            this.$el.append('<p class="error-message">' + message + '</p>');
        };
        view.showInModal();
    }
});

const ErrorManagement: any = {
    parseErrorMessage: ErrorManagementResponseErrorParser,

    mountToApp: function(application) {
        const Layout = application.getLayout();

        // @module ApplicationSkeleton @class ApplicationSkeleton.Layout
        _.extend(Layout, {
            // @property {Array<String>} errorMessageKeys
            // They will be use to try to get the error message of a failed AJAX call. Extend this as needed
            errorMessageKeys: ['errorMessage', 'errors', 'error', 'message'],

            // @method notFound Shortcut to display the PageNotFoundView
            notFound: function() {
                const view = new PageNotFoundView({
                    application: application
                });

                view.showContent().done(() => {
                    Loggers.getLogger().endLast('Navigation');
                });
            },

            // @method internalError Shortcut to display the InternalErrorView
            internalError: function(message, pageHeader, title?) {
                const view = new InternalErrorView({
                    application: application,
                    message: message,
                    pageHeader: pageHeader,
                    title: title
                });

                view.showContent().done(() => {
                    Loggers.getLogger().endLast('Navigation');
                });
            },

            // @method expiredLink @param {String} message
            expiredLink: function(message) {
                const view = new ExpiredLinkView({
                    application: application,
                    pageHeader: message,
                    title: message
                });

                view.showContent().done(() => {
                    Loggers.getLogger().endLast('Navigation');
                });
            },

            // @method forbiddenError
            forbiddenError: function() {
                const view = new ForbiddenErrorView({
                    application: application
                });
                view.showContent().done(() => {
                    Loggers.getLogger().endLast('Navigation');
                });
            },

            // @method unauthorizedError
            // @param {Boolean?} user_session_timedOut Indicate if the error is thanks to a session time-out or not
            // @return {Void}
            unauthorizedError: function(user_session_timedOut) {
                if (Configuration.get('currentTouchpoint', '') === 'login') {
                    // This case can happen when more than one concurrent XHR is made and both
                    // return a user session time-out error
                    return;
                }
                ProfileModel.getInstance().set({
                    isLoggedIn: 'F',
                    isGuest: 'F'
                });

                let base_url = UrlHelper.setUrlParameter(
                    Session.get('touchpoints.login'),
                    'origin',
                    Configuration.get('currentTouchpoint')
                );
                base_url = UrlHelper.setUrlParameter(
                    base_url,
                    'origin_hash',
                    (<any>Backbone.history).fragment
                );
                Configuration.currentTouchpoint = 'login';

                window.location = user_session_timedOut
                    ? UrlHelper.setUrlParameter(base_url, 'timeout', 'T')
                    : base_url;
            }
        });

        jQuery(document).ajaxError(function(_e: any, jqXhr: any, options: any, error_text: any) {
            const intStatus = parseInt(jqXhr.status, 10);

            if (error_text === 'abort' || intStatus === 0) {
                return;
            }

            // Unauthorized Error, customer must be logged in -
            // we pass origin parameter with the right touchpoint for redirect the user after login
            // 206 is returned when someone else has logged in another browser
            // with the same user. In this case the first response is a 206
            // And the following are 401
            if (intStatus === 401 || intStatus === 206) {
                Layout.unauthorizedError(
                    jqXhr.responseJSON &&
                        jqXhr.responseJSON.errorCode === 'ERR_USER_SESSION_TIMED_OUT'
                );
                return;
            }

            // You can bypass all this logic by capturing the error callback
            // on the fetch using preventDefault = true on your jqXhr object
            if (!jqXhr.preventDefault) {
                // if its a write operation we will call the showError
                // of the currentView or of the modal if presetn
                let message = ErrorManagementResponseErrorParser(
                    jqXhr,
                    Layout.errorMessageKeys,
                    options
                );

                if (!message || (_.isObject(message) && !message.errorCode)) {
                    message = Utils.translate('An internal error has occurred');
                }

                if (options.type === 'GET' && options.killerId) {
                    if (intStatus === 403) {
                        // Not Found error, we show that error
                        Layout.forbiddenError();
                    }
                    // Its a read operation that was ment to show a page
                    else if (intStatus === 404) {
                        // Not Found error, we show that error
                        Layout.notFound();
                    } else {
                        // Other ways we just show an internal error page
                        Layout.internalError(message);
                    }
                } else if (Layout.currentView) {
                    // Do not show error message if forbidden
                    if (intStatus !== 403) {
                        // Calls the showError of the modal if present or the one of the currentView (content view)
                        if (Layout.modalCurrentView) {
                            Layout.modalCurrentView.showError(message);
                        } else {
                            const childViewInstances = Layout.currentView.getChildViewInstances();

                            let activeView = _.find(childViewInstances, function(childView: any) {
                                return (
                                    childView &&
                                    (childView.$('.focused-form-view').length > 0 ||
                                        childView.$el.is('.focused-form-view'))
                                );
                            });
                            activeView = activeView || Layout.currentView;
                            activeView.showError(message);
                        }
                    } else {
                        const view = Layout.modalCurrentView || Layout.currentView;
                        if (view && _.isFunction(view.forbiddenError)) {
                            view.forbiddenError(message);
                        } else {
                            Layout.forbiddenError(message);
                        }
                    }
                } else {
                    // We allways default to showing the internalError of the layout
                    Layout.internalError();
                }
            }
        });

        const control_valid_navigation = function control_valid_navigation() {
            // find a router for the current fragment
            if (!(<any>Backbone.history).started) {
                return;
            }

            const fragment = Backbone.history.getFragment();
            const match = _(Backbone.history.handlers).some(function(handler: any) {
                if (handler.callback && handler.route.exec(fragment)) {
                    return true;
                }
            });

            // if not found a router for the current fragment the page not found is displayed.
            if (!match) {
                Layout.notFound();
            }
        };

        jQuery(window).on('hashchange', control_valid_navigation);
        application.once('afterStart', control_valid_navigation);
    }
};

export = ErrorManagement;
