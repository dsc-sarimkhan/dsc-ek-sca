/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Router"/>
/// <reference path="../../../Commons/Utilities/JavaScript/UnderscoreExtended.d.ts" />

import '../../../Commons/LiveOrder/JavaScript/LiveOrder.Model';

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import WizardRouter = require('../../Wizard/JavaScript/Wizard.Router');
import Session = require('../../../Commons/Session/JavaScript/Session');
import OrderWizardStep = require('./OrderWizard.Step');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import OrderWizardThreeDSecure = require('../../OrderWizard.Module.PaymentMethod/JavaScript/OrderWizard.Module.PaymentMethod.ThreeDSecure');
import OrderWizardModel = require('./OrderWizard.Model');
import OrderWizardView = require('./OrderWizard.View');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

// @class OrderWizard.Router @extends Wizard.Router
const OrderWizardRouter: any = WizardRouter.extend({
    // @property {OrderWizard.Step} step
    step: OrderWizardStep,
    view: OrderWizardView,
    // @method initialize
    initialize: function () {
        this.orderWizardModel = OrderWizardModel.getInstance();

        this.init_promise = WizardRouter.prototype.initialize.apply(this, arguments);
        this.application.waitForPromise(this.init_promise);

        this.profileModel = ProfileModel.getInstance();

        const payment_methods = this.model.get('paymentmethods');
        const payment_method_credit_card = payment_methods.findWhere({ type: 'creditcard' });
        const credit_card =
            payment_method_credit_card && payment_method_credit_card.get('creditcard');

        // remove temporal credit card.
        if (credit_card && credit_card.internalid === '-temporal-') {
            payment_methods.remove(payment_method_credit_card);
        }

        if (this.application.getConfig('startCheckoutWizard') && !~_.indexOf(this.stepsOrder, '')) {
            const pageType = this.application.getComponent('PageType');

            pageType.registerPageType({
                name: 'checkout',
                routes: ['', '?:options'],
                callback: _.bind(this.startWizard, this),
                defaultTemplate: {
                    name: 'wizard.tpl',
                    displayName: 'Order Wizard Default',
                    thumbnail: Utils.getThemeAbsoluteUrlOfNonManagedResources(
                        'img/default-layout-checkout.png'
                    )
                }
            });
        }
    },
    // @method startWizard
    startWizard: function () {
        this.navigate(this.getFirstStepUrl(), { trigger: true, replace: true });
    },

    _registerPageType: function _registerPageType(options) {
        const pageType = this.application.getComponent('PageType');

        pageType.registerPageType({
            name: 'checkout',
            routes: options.routes,
            view: OrderWizardView
        });
    },

    _compileStep: function _compileStep(step, step_group_instance) {
        const self = this;
        const args = arguments;
        const event_data = {
            name: step.name,
            url: step.url,
            index: step.step_index,
            group_name: step_group_instance.name
        };

        return this.orderWizardModel
            .cancelableTrigger('before:OrderWizardRouter.compileStep', event_data)
            .then(function () {
                return WizardRouter.prototype._compileStep.apply(self, args).done(function () {
                    self.orderWizardModel.cancelableTrigger(
                        'after:OrderWizardRouter.compileStep',
                        event_data
                    );
                });
            });
    },

    _compileStepGroup: function _compileStepGroup(step_group, index) {
        const self = this;
        const args = arguments;
        const event_data = {
            name: step_group.name,
            url: step_group.steps[0].url,
            index: index
        };

        return this.orderWizardModel
            .cancelableTrigger('before:OrderWizardRouter.compileStepGroup', event_data)
            .then(function () {
                return WizardRouter.prototype._compileStepGroup.apply(self, args).done(function () {
                    self.orderWizardModel.cancelableTrigger(
                        'after:OrderWizardRouter.compileStepGroup',
                        event_data
                    );
                });
            });
    },

    // @method hidePayment
    hidePayment: function (): boolean {
        return (
            this.application.getConfig('siteSettings.checkout.hidepaymentpagewhennobalance') ===
            'T' && this.model.get('summary').total === 0
        );
    },
    // @method isPaypal
    isPaypal: function () {
        const selected_paymentmethod = this.model
            .get('paymentmethods')
            .findWhere({ primary: true });
        return selected_paymentmethod && selected_paymentmethod.get('type') === 'paypal';
    },
    // @method isPaypalComplete
    isPaypalComplete: function () {
        const selected_paymentmethod = this.model
            .get('paymentmethods')
            .findWhere({ primary: true });
        return (
            selected_paymentmethod &&
            selected_paymentmethod.get('type') === 'paypal' &&
            selected_paymentmethod.get('complete')
        );
    },
    // @method isExternalCheckout
    isExternalCheckout: function () {
        const selected_paymentmethod = this.model
            .get('paymentmethods')
            .findWhere({ primary: true });
        return (
            selected_paymentmethod &&
            !!~selected_paymentmethod.get('type').indexOf('external_checkout')
        );
    },

    isMultiShipTo: function () {
        return this.model.get('ismultishipto');
    },

    isAutoPopulateEnabled: function () {
        const is_guest = this.profileModel.get('isGuest') === 'T';

        return (
            this.application.getConfig('autoPopulateNameAndEmail') &&
            ((is_guest && this.application.getConfig('forms.loginAsGuest.showName')) || !is_guest)
        );
    },

    // @method runStep
    runStep: function runStep() {
        const self = this;
        const url = (<any>Backbone.history).fragment.split('?')[0];

        return this.orderWizardModel
            .cancelableTrigger('before:OrderWizardRouter.runStep', url)
            .then(function() {
                return self._runStep();
            });
    },

    _runStep: function _runStep(...args) {
        // Computes the position of the user in the flow
        const fragments = (<any>Backbone.history).fragment.split('?');
        const url = fragments[0];

        return this.orderWizardModel
            .cancelableTrigger('before:OrderWizardRouter._runStep', url)
            .then(() => {
                const options = fragments.length ? fragments[1] : '';
                const position = this.getStepPosition(url);
                let content = '';
                let page_header = '';
                const { last_order_id } = Utils.parseUrlOptions(options);
                const self = this;

                if (last_order_id && !this.model.get('confirmation').get('internalid')) {
                    if (this.profileModel.get('isGuest') !== 'T') {
                        // checkout just finnished and user refreshed the doc.
                        page_header = Utils.translate('Your Order has been placed');
                        content =
                            Utils.translate(
                                'If you want to review your last order you can go to <a href="#" data-touchpoint="$(0)" data-hashtag="#/ordershistory/view/salesorder/$(1)">Your Account</a>. ',
                                'customercenter',
                                last_order_id
                            ) +
                            Utils.translate(
                                'Or you can continue Shopping on our <a href="/" data-touchpoint="home">Home Page</a>. '
                            );
                    } else {
                        page_header = Utils.translate('Your Shopping Cart is empty');
                        content = Utils.translate(
                            'Continue Shopping on our <a href="/" data-touchpoint="home">Home Page</a>. '
                        );
                    }

                    const layout = this.application.getLayout();

                    return (
                        layout.internalError &&
                        layout.internalError(content, page_header, Utils.translate('Checkout'))
                    );
                }

                // if you have already placed the order you
                // can not be in any other step than the last
                if (
                    this.model &&
                    this.model.get('confirmation') &&
                    (this.model.get('confirmation').get('confirmationnumber') ||
                        this.model.get('confirmation').get('tranid')) &&
                    position.toLast !== 0
                ) {
                    window.location = Session.get('touchpoints.home');
                    return jQuery.Deferred().reject();
                }

                return WizardRouter.prototype.runStep.apply(this, args).then(function() {
                    return self.orderWizardModel.cancelableTrigger(
                        'after:OrderWizardRouter.runStep',
                        url
                    );
                });
            });
    },

    // @method start3DSecure Start the process of 3D Secure CC payments.
    // @param {jQuery.Deferred} promise
    // @returns {jQuery.Deferred}
    start3DSecure: function (promise) {
        const wrapper_deferred = jQuery.Deferred();

        promise
            .done(() => {
                const confirmation = this.model.get('confirmation');
                const statuscode = confirmation.get('statuscode');
                let success = false;

                if (statuscode) {
                    if (statuscode === 'success' || statuscode === 'redirect') {
                        wrapper_deferred.resolveWith(this);
                        success = true;
                    } else if (statuscode === 'error') {
                        // Order is not success since payment authorization is required
                        let reasoncode = confirmation.get('reasoncode');
                        if (reasoncode && (reasoncode === 'ERR_WS_REQ_PAYMENT_AUTHORIZATION' || reasoncode === 'ERR_WS_REQ_SHOPPER_CHALLENGE' || reasoncode === 'ERR_WS_REQ_DEVICE_AUTHENTICATION')) {
                            if (confirmation.get('paymentauthorization') || confirmation.get('authenticationformaction')) {
                                const view = new OrderWizardThreeDSecure({
                                    layout: this.application.getLayout(),
                                    application: this.application,
                                    wizard: this,
                                    deferred: wrapper_deferred,
                                    confirmation: confirmation
                                });
                                view.showInModal();
                                success = true;
                            }
                        }
                    }
                }

                if (!success) {
                    wrapper_deferred.rejectWith(this);
                }
            })
            .fail(() => {
                wrapper_deferred.rejectWith(this);
            });

        return wrapper_deferred.promise();
    }
});

export = OrderWizardRouter;
