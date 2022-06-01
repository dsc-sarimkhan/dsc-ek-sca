/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Cart.Confirmation.Helpers"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as jQuery from '../../Core/JavaScript/jQuery';

import LiveOrderModel = require('../../LiveOrder/JavaScript/LiveOrder.Model');
import CartConfirmationView = require('./Cart.Confirmation.View');
import ErrorManagementResponseErrorParser = require('../../ErrorManagement/JavaScript/ErrorManagement.ResponseErrorParser');
import Backbone = require('../..//Utilities/JavaScript/backbone.custom');
import Configuration = require('../../Utilities/JavaScript/SC.Configuration');

export = {
    // Cart.showCartConfirmation()
    // This reads the configuration object and execs one of the functions above
    showCartConfirmation: function showCartConfirmation(cart_promise, line, application) {
        // Available values are: goToCart, showMiniCart and showCartConfirmationModal
        this['_' + Configuration.get('addToCartBehavior', 'showCartConfirmationModal')](
            cart_promise,
            line,
            application
        );

        const layout = application.getLayout();
        cart_promise.fail(function(error) {
            let output_message = '';
            let error_object = { errorCode: 'UNKNOWN' };
            let error_message = '';

            if (error) {
                if (error.responseJSON) {
                    error_object = error.responseJSON;
                    error_message = ErrorManagementResponseErrorParser(
                error,
                layout.errorMessageKeys
            );
                } else if (_.isString(error)) {
                    // Error came from Frontend ExtLayer
                    error_object.errorCode = 'ERR_EXT_CANCELED_OPERATION';
                    error_message = error;
                }
            }

            // if the error was caused by an extension canceling the operation,
            // then show the error message from the back-end
            if (error_object.errorCode === 'ERR_EXT_CANCELED_OPERATION' && error_message) {
                output_message = error_message;
            } else {
                output_message = Utils.translate(
                    'Sorry, there is a problem with this Item and can not be purchased at this time. Please check back later.'
                );
            }

            layout.showErrorInModal(output_message);
        });
    },

    _showCartConfirmationModal: function _showCartConfirmationModal(
        cart_promise,
        line,
        application
    ) {
        if (line.isNew()) {
            return this._showOptimisticCartConfirmation(cart_promise, line, application);
        }
        return cart_promise.done(function() {
            const view = new CartConfirmationView({
                application: application,
                model: LiveOrderModel.getInstance().getLatestAddition()
            });
            view.showInModal();
        });
    },

    _showOptimisticCartConfirmation: function _showOptimisticCartConfirmation(
        cart_promise,
        line,
        application
    ) {
        const cart_model = LiveOrderModel.getInstance();
        // search the item in the cart to merge the quantities
        if (LiveOrderModel.loadCart().state() === 'resolved') {
            const cart_line = cart_model.findLine(line);

            if (cart_line) {
                if (line.get('source') !== 'cart') {
                    cart_line.set(
                        'quantity',
                        cart_line.get('quantity') + parseInt(line.get('quantity'), 10)
                    );
                } else {
                    cart_line.set('quantity', line.get('quantity'));
                }

                cart_promise.fail(function() {
                    cart_line.set('quantity', cart_line.previous('quantity'));
                });

                line = cart_line;
            } else {
                cart_model.get('lines').add(line, { at: 0 });

                cart_promise.fail(function() {
                    cart_model.get('lines').remove(line);
                });
            }
        }

        const view = new CartConfirmationView({
            application: application,
            model: line
        });

        cart_promise.done(function() {
            view.model = cart_model.getLatestAddition();
            view.render();
        });

        view.showInModal();
    },

    // Cart.goToCart()
    _goToCart: function _goToCart(cart_promise) {
        cart_promise.done(function() {
            Backbone.history.navigate('cart', { trigger: true });
        });
    },

    _showMiniCart: function _showMiniCart(cart_promise, line, application) {
        const layout = application.getLayout();

        cart_promise.done(function() {
            jQuery(document).scrollTop(0);

            layout.closeModal().done(function() {
                if (layout.headerViewInstance) {
                    layout.headerViewInstance.showMiniCart();
                }
            });
        });
    }
};
