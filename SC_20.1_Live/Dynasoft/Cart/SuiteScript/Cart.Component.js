/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Cart
define('Cart.Component', [
    'ICart.Component',
    'LiveOrder.Model',
    'SC.Models.Init',

    'Application',

    'Utils',
    'jQuery.Deferred',
    'underscore'
], function(
    ICartComponent,
    LiveOrderModel,
    ModelsInit,

    Application,

    Utils,
    jQuery,
    _
) {
    // @class Cart.Component This is the concrete backend-end Cart implementation of SuiteCommerce Advanced / SuiteCommerce Standard.
    // See @?class ICart.Component
    // @extend ICart.Component
    const componentConstructor = function(extensionName) {
        _.extend(
            this,
            ICartComponent.extend({
                addLine: function addLine(data) {
                    const deferred = jQuery.Deferred();
                    try {
                        this._validateLine(data.line);
                        deferred.resolve(LiveOrderModel.addLine(data.line));
                    } catch (e) {
                        deferred.reject(e);
                    }

                    return deferred;
                },

                addLines: function addLines(data) {
                    const deferred = jQuery.Deferred();
                    try {
                        const self = this;
                        _.map(data.lines, function(line) {
                            self._validateLine(line);
                        });
                        const lines = _.map(LiveOrderModel.addLines(data.lines), function(
                            added_line
                        ) {
                            return added_line.orderitemid;
                        });
                        deferred.resolve(lines);
                    } catch (e) {
                        deferred.reject(e);
                    }

                    return deferred;
                },

                getLines: function getLines() {
                    const deferred = jQuery.Deferred();
                    try {
                        const self = this;
                        const lines = _.map(LiveOrderModel.getLinesOnly(), function(line) {
                            return self._normalizeLine(line);
                        });
                        deferred.resolve(lines);
                    } catch (e) {
                        deferred.reject(e);
                    }
                    return deferred;
                },

                removeLine: function removeLine(data) {
                    const deferred = jQuery.Deferred();
                    try {
                        if (!data.internalid || !_.isString(data.internalid)) {
                            this._reportError(
                                'INVALID_PARAM',
                                'Invalid id: Must be a defined string'
                            );
                        }
                        deferred.resolve(LiveOrderModel.removeLine(data.internalid));
                    } catch (e) {
                        deferred.reject(e);
                    }
                    return deferred;
                },

                updateLine: function updateLine(data) {
                    const deferred = jQuery.Deferred();
                    try {
                        this._validateEditLine(data.line);
                        deferred.resolve(
                            LiveOrderModel.updateLine(data.line.internalid, data.line)
                        );
                    } catch (e) {
                        deferred.reject(e);
                    }
                    return deferred;
                },

                getSummary: function getSummary() {
                    const deferred = jQuery.Deferred();
                    try {
                        const summary = LiveOrderModel.getSummary();
                        deferred.resolve(this._normalizeSummary(summary));
                    } catch (e) {
                        deferred.reject(e);
                    }
                    return deferred;
                },

                submit: function submit() {
                    const deferred = jQuery.Deferred();
                    try {
                        if (!Utils.isCheckoutDomain()) {
                            this._reportError(
                                'UNSECURE_SESSION',
                                'Unsecure session: Must be under a secure domain or logged in'
                            );
                        }

                        deferred.resolve(LiveOrderModel.submit());
                    } catch (e) {
                        deferred.reject(e);
                    }
                    return deferred;
                },

                addPayment: function addPayment(data) {
                    const deferred = jQuery.Deferred();
                    try {
                        if (!Utils.isCheckoutDomain() || !ModelsInit.session.isLoggedIn2()) {
                            this._reportError(
                                'UNSECURE_SESSION',
                                'Unsecure session: Must be under a secure domain or logged in'
                            );
                        }

                        this._validatePaymentMethod(data.payment_method);

                        const payment_methods = { paymentmethods: [data.payment_method] };

                        LiveOrderModel.setPaymentMethods(payment_methods);

                        deferred.resolve();
                    } catch (e) {
                        deferred.reject(e);
                    }
                    return deferred;
                },

                getPaymentMethods: function getPaymentMethods() {
                    const deferred = jQuery.Deferred();
                    try {
                        const self = this;
                        const payment_methods = LiveOrderModel.getPaymentMethodsOnly();

                        deferred.resolve(
                            _.map(payment_methods, function(payment_method) {
                                return self._normalizePaymentMethod({
                                    paymentmethods: [payment_method]
                                });
                            })
                        );
                    } catch (e) {
                        deferred.reject(e);
                    }
                    return deferred;
                },

                estimateShipping: function estimateShipping(data) {
                    const deferred = jQuery.Deferred();
                    try {
                        if (!data || !_.isObject(data.address)) {
                            this._reportError(
                                'INVALID_PARAM',
                                'Invalid parameter. It must be a valid object and must contain an address object'
                            );
                        }

                        const { address } = data;
                        const address_internalid = address.zip + '-' + address.country + '-null';

                        data.addresses = [
                            {
                                internalid: address_internalid,
                                zip: address.zip,
                                country: address.country
                            }
                        ];

                        data.shipaddress = address_internalid;

                        LiveOrderModel.estimateShippingCost(data);

                        const result = this._normalizeSummary(LiveOrderModel.getSummary());
                        deferred.resolve(result);
                    } catch (e) {
                        deferred.reject(e);
                    }
                    return deferred;
                },

                clearEstimateShipping: function clearEstimateShipping() {
                    const deferred = jQuery.Deferred();
                    try {
                        LiveOrderModel.removeEstimateShippingCost();

                        const result = this._normalizeSummary(LiveOrderModel.getSummary());
                        deferred.resolve(result);
                    } catch (e) {
                        deferred.reject(e);
                    }
                    return deferred;
                },

                getShipAddress: function getShipAddress() {
                    const deferred = jQuery.Deferred();
                    try {
                        const addresses = {};
                        let shipaddress;
                        const field_values = LiveOrderModel.getFieldValues({
                            keys: ['shipaddress'],
                            items: []
                        });

                        LiveOrderModel.addAddress(field_values.shipaddress, addresses);

                        shipaddress = _.first(_.values(addresses));
                        deferred.resolve(this._normalizeAddress(shipaddress));
                    } catch (e) {
                        deferred.reject(e);
                    }
                    return deferred;
                },

                getBillAddress: function getBillAddress() {
                    const deferred = jQuery.Deferred();
                    try {
                        const addresses = {};
                        let billaddress;
                        const field_values = LiveOrderModel.getFieldValues({
                            keys: ['billaddress'],
                            items: []
                        });

                        LiveOrderModel.addAddress(field_values.billaddress, addresses);

                        billaddress = _.first(_.values(addresses));
                        deferred.resolve(this._normalizeAddress(billaddress));
                    } catch (e) {
                        deferred.reject(e);
                    }
                    return deferred;
                },

                setShipAddress: function setShipAddress(data) {
                    const deferred = jQuery.Deferred();

                    try {
                        if (!Utils.isCheckoutDomain() || !ModelsInit.session.isLoggedIn2()) {
                            this._reportError(
                                'UNSECURE_SESSION',
                                'Unsecure session: Must be under either a secure domain or logged in'
                            );
                        }

                        if (
                            !_.isObject(data) ||
                            (data.address_id && !_.isString(data.address_id))
                        ) {
                            this._reportError(
                                'INVALID_PARAM',
                                'Invalid parameter. It must be a valid object and must contain either a valid address_id string or null'
                            );
                        }

                        LiveOrderModel.setShippingAddressOnly({ shipaddress: data.address_id });

                        deferred.resolve();
                    } catch (e) {
                        deferred.reject(e);
                    }

                    return deferred;
                },

                setBillAddress: function setBillAddress(data) {
                    const deferred = jQuery.Deferred();

                    try {
                        if (!Utils.isCheckoutDomain() || !ModelsInit.session.isLoggedIn2()) {
                            this._reportError(
                                'UNSECURE_SESSION',
                                'Unsecure session: Must be under either a secure domain or logged in'
                            );
                        }

                        if (
                            !_.isObject(data) ||
                            (data.address_id && !_.isString(data.address_id))
                        ) {
                            this._reportError(
                                'INVALID_PARAM',
                                'Invalid parameter. It must be a valid object and must contain either a valid address_id string or null'
                            );
                        }

                        LiveOrderModel.setBillingAddressOnly({ billaddress: data.address_id });

                        deferred.resolve();
                    } catch (e) {
                        deferred.reject(e);
                    }

                    return deferred;
                },

                getShipMethods: function getShipMethods() {
                    const deferred = jQuery.Deferred();
                    try {
                        const ship_methods = LiveOrderModel.getShipMethodsOnly();
                        deferred.resolve(_.map(ship_methods, this._normalizeShipMethods));
                    } catch (e) {
                        deferred.reject(e);
                    }
                    return deferred;
                },

                getShipMethod: function getShipMethod() {
                    const deferred = jQuery.Deferred();
                    try {
                        const field_values = LiveOrderModel.getFieldValues({
                            keys: ['shipmethod'],
                            items: []
                        });
                        const shipmethod_id = field_values.shipmethod
                            ? field_values.shipmethod.shipmethod
                            : null;

                        this.getShipMethods().then(function(shipmethods) {
                            const shipmethod = _.find(shipmethods, { internalid: shipmethod_id });
                            deferred.resolve(shipmethod);
                        }, deferred.reject);
                    } catch (e) {
                        deferred.reject(e);
                    }
                    return deferred;
                },

                setShippingMethod: function setShippingMethod(data) {
                    const deferred = jQuery.Deferred();

                    try {
                        if (!Utils.isCheckoutDomain() || !ModelsInit.session.isLoggedIn2()) {
                            this._reportError(
                                'UNSECURE_SESSION',
                                'Unsecure session: Must be under either a secure domain or logged in'
                            );
                        }

                        if (
                            !_.isObject(data) ||
                            (data.shipmethod_id && !_.isString(data.shipmethod_id))
                        ) {
                            this._reportError(
                                'INVALID_PARAM',
                                'Invalid parameter. It must be a valid object and must contain either a valid shipmethod_id string or null'
                            );
                        }

                        LiveOrderModel.setShippingMethodOnly({ shipmethod: data.shipmethod_id });

                        deferred.resolve();
                    } catch (e) {
                        deferred.reject(e);
                    }

                    return deferred;
                },

                addPromotion: function addPromotion(data) {
                    const deferred = jQuery.Deferred();

                    try {
                        if (!_.isObject(data) || !_.isString(data.promocode)) {
                            this._reportError(
                                'INVALID_PARAM',
                                'Invalid parameter. It must be a valid object and must contain a promocode object'
                            );
                        }

                        deferred.resolve(LiveOrderModel.addPromotion(data.promocode));
                    } catch (e) {
                        deferred.reject(e);
                    }

                    return deferred;
                },

                removePromotion: function removePromotion(data) {
                    const deferred = jQuery.Deferred();

                    try {
                        if (
                            !_.isUndefined(data) &&
                            (!_.isObject(data) || !_.isString(data.promocode))
                        ) {
                            this._reportError(
                                'INVALID_PARAM',
                                'Invalid parameter "promocode". It must be a valid string'
                            );
                        }

                        const promocode = data ? [{ code: data.promocode }] : null;

                        deferred.resolve(LiveOrderModel.removeAllPromocodes(promocode));
                    } catch (e) {
                        deferred.reject(e);
                    }

                    return deferred;
                },

                getPromotions: function getPromotions() {
                    const deferred = jQuery.Deferred();
                    try {
                        const promocodes = LiveOrderModel.getPromoCodesOnly();
                        deferred.resolve(_.map(promocodes, this._normalizeAddPromotion));
                    } catch (e) {
                        deferred.reject(e);
                    }
                    return deferred;
                }
            })
        );
        
        this.extensionName = extensionName;
        this._generateSyncMethods();

        // Maps inner events to the outer events to be triggered and a normalize function to be used in order to transform the inenr arguments to the outers
        const innerToOuterMap = [
            // @class ICart.Component
            // @event beforeAddLine Cancelable event triggered before a new line is added to the cart. @public @extlayer
            {
                inner: 'before:LiveOrder.addLine',
                outer: 'beforeAddLine',
                normalize: this._normalizeAddLineBefore
            },
            // @event afterAddLine Triggered after a line is added to the cart. @public @extlayer
            {
                inner: 'after:LiveOrder.addLine',
                outer: 'afterAddLine',
                normalize: this._normalizeAddLineAfter
            },
            // @event beforeRemoveLine Cancelable event triggered before a line is removed from the cart. @public @extlayer
            {
                inner: 'before:LiveOrder.removeLine',
                outer: 'beforeRemoveLine',
                normalize: this._normalizeRemoveLineBefore
            },
            // @event afterRemoveLine Triggered after a line is removed from the cart. @public @extlayer
            {
                inner: 'after:LiveOrder.removeLine',
                outer: 'afterRemoveLine',
                normalize: this._normalizeRemoveLineAfter
            },
            // @event beforeSubmit Cancelable event triggered before the cart's order is submitted. @public @extlayer
            {
                inner: 'before:LiveOrder.submit',
                outer: 'beforeSubmit',
                normalize: this._normalizeSubmitBefore
            },
            // @event afterSubmit Triggered after the cart's order is submitted. @public @extlayer
            {
                inner: 'after:LiveOrder.submit',
                outer: 'afterSubmit',
                normalize: this._normalizeSubmitAfter
            },
            // @event beforeUpdateLine Cancelable event triggered before one line is updated. @public @extlayer
            {
                inner: 'before:LiveOrder.updateLine',
                outer: 'beforeUpdateLine',
                normalize: this._normalizeUpdateLineBefore,
                disableEvents: [
                    'beforeAddLine',
                    'afterAddLine',
                    'beforeRemoveLine',
                    'afterRemoveLine'
                ]
            },
            // @event afterUpdateLine Triggered after a line is updated in the cart. @public @extlayer
            {
                inner: 'after:LiveOrder.updateLine',
                outer: 'afterUpdateLine',
                normalize: this._normalizeUpdateLineAfter,
                enableEvents: [
                    'beforeAddLine',
                    'afterAddLine',
                    'beforeRemoveLine',
                    'afterRemoveLine'
                ]
            },
            // @event beforeEstimateShipping Cancelable event triggered before a shipping estimation in the cart @public @extlayer
            {
                inner: 'before:LiveOrder.estimateShippingCost',
                outer: 'beforeEstimateShipping',
                normalize: this._normalizeEstimateBefore
            },
            // @event beforeClearEstimateShipping Cancelable event triggered before removing a shipping method from the cart's order. @public @extlayer
            {
                inner: 'before:LiveOrder.removeEstimateShippingCost',
                outer: 'beforeClearEstimateShipping',
                normalize: this._normalizeRemoveEstimateBefore
            },

            // @event beforeAddPayment Cancelable event triggered before one line is updated. @public @extlayer
            {
                inner: 'before:LiveOrder.setPaymentMethods',
                outer: 'beforeAddPayment',
                normalize: this._normalizePaymentMethodBefore
            },
            // @event afterAddPayment Triggered after a line is updated in the cart. @public @extlayer
            {
                inner: 'after:LiveOrder.setPaymentMethods',
                outer: 'afterAddPayment',
                normalize: this._normalizePaymentMethodAfter
            },
            // @event beforeAddPromotion Cancelable event triggered before a Promocode is added from the cart's order. @public @extlayer
            {
                inner: 'before:LiveOrder.addPromotion',
                outer: 'beforeAddPromotion',
                normalize: this._normalizeAddPromotionBefore
            },
            // @event afterAddPromotion Triggered after a Promocode is added from the cart's order. @public @extlayer
            {
                inner: 'after:LiveOrder.addPromotion',
                outer: 'afterAddPromotion',
                normalize: this._normalizeAddPromotionAfter
            },
            // @event beforeSetBillingAddress Cancelable event triggered before a billing address is setted to the cart's order. @public @extlayer
            {
                inner: 'before:LiveOrder.setBillingAddress',
                outer: 'beforeSetBillAddress',
                normalize: this._normalizeAddressId
            },
            // @event afterSetBillingAddress Triggered after a billing address is setted to the cart's order. @public @extlayer
            {
                inner: 'after:LiveOrder.setBillingAddress',
                outer: 'afterSetBillAddress',
                normalize: this._normalizeAddressId
            },
            // @event beforeSetShippingAddress Cancelable event triggered before a shipping address is setted to the cart's order. @public @extlayer
            {
                inner: 'before:LiveOrder.setShippingAddress',
                outer: 'beforeSetShipAddress',
                normalize: this._normalizeAddressId
            },
            // @event afterSetShippingAddress Triggered after a shipping address is setted to the cart's order. @public @extlayer
            {
                inner: 'after:LiveOrder.setShippingAddress',
                outer: 'afterSetShipAddress',
                normalize: this._normalizeAddressId
            },
            // @event beforeSetShippingMethod Cancelable event triggered before a shipping method is setted to the cart's order. @public @extlayer
            {
                inner: 'before:LiveOrder.setShippingMethod',
                outer: 'beforeSetShippingMethod',
                normalize: this._normalizeShipMethodId
            },
            // @event afterSetShippingMethod Triggered after a shipping method is setted to the cart's order. @public @extlayer
            {
                inner: 'after:LiveOrder.setShippingMethod',
                outer: 'afterSetShippingMethod',
                normalize: this._normalizeShipMethodId
            }

            /*
	,	{inner: 'before:LiveOrder.delete', outer: 'beforeDelete', normalize: null}
	,	{inner: 'after:LiveOrder.delete', outer: 'afterDelete', normalize: null}
	,	{inner: 'before:LiveOrder.suspend', outer: 'beforeSuspend', normalize: null}
	,	{inner: 'after:LiveOrder.suspend', outer: 'afterSuspend', normalize: null}
	*/
        ];
        this._suscribeToInnerEvents(innerToOuterMap);
        const self = this;
        Application.on('before:LiveOrder.removeAllPromocodes', function(model, inner_promocodes) {
            const promocodes = Utils.deepCopy(inner_promocodes);

            const promocodes_deferred = _.map(promocodes, function(promocode) {
                const args = self._normalizeRemovePromotionBefore(promocode);

                // @event beforeRemovePromotion Cancelable event triggered before a Promocode is removed from the cart's order. @public @extlayer
                return self.cancelableTrigger('beforeRemovePromotion', args);
            });
            const result = jQuery.Deferred();

            jQuery.when
                .apply(jQuery, promocodes_deferred)
                .fail(self._asyncErrorHandle(result))
                .done(result.resolve);

            return result;
        });

        Application.on('after:LiveOrder.removeAllPromocodes', function(
            model,
            result,
            inner_promocodes
        ) {
            // In this case result is undefined
            const promocodes = Utils.deepCopy(inner_promocodes);

            const promocodes_deferred = _.map(promocodes, function(promocode) {
                const args = self._normalizeRemovePromotionAfter(promocode);

                // @event afterRemovePromotion Triggered after a Promocode is removed from the cart's order. @public @extlayer
                return self.cancelableTrigger('afterRemovePromotion', args);
            });
            const promise = jQuery.Deferred();

            jQuery.when
                .apply(jQuery, promocodes_deferred)
                .fail(self._asyncErrorHandle(promise))
                .done(promise.resolve);

            return promise;
        });

        Application.on('after:LiveOrder.estimateShippingCost', function(model, result, data) {
            // In this case result is undefined

            const summary = Utils.deepCopy(model.getSummary());
            const address = Utils.deepCopy(data.address);

            const args = self._normalizeEstimateAfter([address, summary]);
            // @event afterEstimateShipping Triggered after an estimate shipping is done in the cart. @public @extlayer
            return self.cancelableTrigger('afterEstimateShipping', args);
        });

        Application.on('after:LiveOrder.removeEstimateShippingCost', function(model) {
            const summary = Utils.deepCopy(model.getSummary());

            const args = self._normalizeRemoveEstimateAfter([summary]);
            // @event afterClearEstimateShipping Triggered after a shipping is removed from the cart. @public @extlayer
            return self.cancelableTrigger('afterClearEstimateShipping', args);
        });

        Application.on('before:LiveOrder.addLines', function(model, lines) {
            const lines_copy = Utils.deepCopy(lines);
            
            const lines_deferred = _.map(lines_copy, function(line) {
                const args = self._normalizeAddLineBefore([line]);
                return self.cancelableTrigger('beforeAddLine', args);
            });
            const result = jQuery.Deferred();

            jQuery.when
                .apply(jQuery, lines_deferred)
                .fail(self._asyncErrorHandle(result))
                .done(result.resolve);

            return result;
        });

        Application.on('after:LiveOrder.addLines', function(model, lines_ids, lines) {
            const lines_copy = Utils.deepCopy(lines);
            const lines_ids_copy = Utils.deepCopy(lines_ids);

            const lines_deferred = _.map(lines_copy, function(line) {
                try {
                    const line_id = _.find(lines_ids_copy, function(line_id) {
                        return line_id.internalid === line.item.internalid.toString();
                    }).orderitemid;

                    const args = self._normalizeAddLineAfter([line_id, line]);
                    return self.cancelableTrigger('afterAddLine', args);
                } catch (e) {
                    return jQuery.Deferred().reject(e);
                }
            });
            const result = jQuery.Deferred();

            jQuery.when
                .apply(jQuery, lines_deferred)
                .fail(self._asyncErrorHandle(result))
                .done(result.resolve);

            return result;
        });
    };

    componentConstructor.componentName = ICartComponent.componentName;
    // @class Cart.Component
    Application.registerComponent(componentConstructor);
});
