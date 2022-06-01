/*
    © 2020 NetSuite Inc.
    User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
    provided, however, if you are an authorized user with a NetSuite account or log-in, you
    may use this code subject to the terms that govern your access and use.
*/
/* jshint -W053 */
// We HAVE to use "new String"
// So we (disable the warning)[https://groups.google.com/forum/#!msg/jshint/O-vDyhVJgq4/hgttl3ozZscJ]
// @module LiveOrder
define('LiveOrder.Model', [
    'SC.Model',
    'Application',
    'Profile.Model',
    'StoreItem.Model',
    'SC.Models.Init',
    'SiteSettings.Model',
    'Utils',
    'ExternalPayment.Model',
    'underscore',
    'CustomFields.Utils',
    'Configuration',
    'CardHolderAuthentication.Model',
    'CardHolderAuthentication.Utils'
], function (SCModel, Application, Profile, StoreItem, ModelsInit, SiteSettings, Utils, ExternalPayment, _, CustomFieldsUtils, Configuration, CardHolderAuthentication, CardHolderAuthenticationUtils) {
    // @class LiveOrder.Model Defines the model used by the LiveOrder.Service.ss service
    // Available methods allow fetching and updating Shopping Cart's data. Works against the
    // Shopping session order, this is, nlapiGetWebContainer().getShoppingSession().getOrder()
    // @extends SCModel
    return SCModel.extend({
        name: 'LiveOrder',
        // @property {Boolean} isSecure
        isSecure: Utils.isCheckoutDomain(),
        // @property {Boolean} isMultiShippingEnabled
        isMultiShippingEnabled: SiteSettings.isMultiShippingRoutesEnabled(),
        // @property {Boolean} isPickupInStoreEnabled
        isPickupInStoreEnabled: SiteSettings.isPickupInStoreEnabled(),
        // @property {Boolean} isSuiteTaxEnabled
        isSuiteTaxEnabled: SiteSettings.isSuiteTaxEnabled(),
        // @property {Boolean} isThreedSecureEnabled
        isThreedSecureEnabled: Configuration.get('isThreeDSecureEnabled'),

        customShipmethods: [],

        shipment_details: [],
        //sandbox suitelet url
        shipping_suitelet_url: "https://6457383-sb1.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=937&deploy=1&compid=6457383_SB1&h=8d59bc12a1391584b7ed", //"https://6457383-sb1.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=729&deploy=1&compid=6457383_SB1&h=89ded70148a9c82062e3",
        //production suitlet url
        // shipping_suitelet_url: "https://6457383.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=968&deploy=1&compid=6457383&h=9bd838996a51cd3e8921",

        cart_id: 'checkout',
        // @method get
        // @param {Boolean} threedsecure Received only in 3D Secure second step (from threedsecure.ssp)
        // @returns {LiveOrder.Model.Data}
        get: function get(threedsecure) {
            var order_fields = this.getFieldValues();
            var result = {};
            // @class LiveOrder.Model.Data object containing high level shopping order object information. Serializeble to JSON and this is the object that the .ss service will serve and so it will poblate front end Model objects
            try {
                // @property {Array<LiveOrder.Model.Line>} lines
                result.lines = this.getLines(order_fields);
            } catch (e) {
                if (e.code === 'ERR_CHK_ITEM_NOT_FOUND') {
                    return this.get();
                }
                throw e;
            }
            order_fields = this.hidePaymentPageWhenNoBalance(order_fields);
            // @property {Array<String>} lines_sort sorted lines ids
            result.lines_sort = this.getLinesSort();
            // @property {String} latest_addition
            result.latest_addition = ModelsInit.context.getSessionObject('latest_addition');
            // @property {Array<LiveOrder.Model.PromoCode>} promocodes
            result.promocodes = this.getPromoCodes(order_fields);
            if (this.automaticallyRemovedPromocodes) {
                result.automaticallyremovedpromocodes = this.automaticallyRemovedPromocodes;
            }
            // @property {Boolean} ismultishipto
            result.ismultishipto = this.getIsMultiShipTo(order_fields);
            // Ship Methods
            if (result.ismultishipto) {
                // @property {Array<OrderShipMethod>} multishipmethods
                result.multishipmethods = this.getMultiShipMethods(result.lines);
                // These are set so it is compatible with non multiple shipping.
                result.shipmethods = [];
                result.shipmethod = null;
            } else {
                // @property {Array<OrderShipMethod>} shipmethods
                result.shipmethods = this.getShipMethods(order_fields);
                // @property {OrderShipMethod} shipmethod
                result.shipmethod = order_fields.shipmethod ?
                    order_fields.shipmethod.shipmethod :
                    null;

                //DSC Customization : calculate custom shipping
                //update shipping method only when required
                var addresses = this.getAddresses(order_fields)
                var freeShippingPromos = _.filter(result.promocodes, function (promo) {
                    return promo.type.toLowerCase() == 'shipping' && promo.applicabilitystatus.toLowerCase() == 'applied' && promo.isvalid && promo.isautoapplied;
                });
                if (threedsecure !== 'currentOrder' && threedsecure !== 'preUpdateOrder' && (addresses[0] !== undefined && !_.isEmpty(addresses[0].zip))) { //passing parameter from this.update() fucntion
                    //check if free shipping is active
                    // var freeShipping = _.filter(this.getShipMethodsOnly(), function(shipMethod){
                    //     return shipMethod.name.toLowerCase().indexOf('free shipping') !== -1;
                    // });
                    // var selectedShipMethod = result.shipmethod;
                    const defaultShippingMethod = this.getDefaultShippingMethod();
                    var customShipmentServices = this.getLiveShippingRates(result.lines, this.getAddresses(order_fields));
                    if (_.isEmpty(customShipmentServices)) {
                        if (!_.isEmpty(defaultShippingMethod)) {
                            result.shipmethod = defaultShippingMethod.internalid;
                            result.shipmethods = [defaultShippingMethod];
                        }
                    } else {
                        var selectedShippingMethods = this.getSelectedShippingMethod(customShipmentServices, this.getShipMethodsOnly());
                        if (!_.isEmpty(selectedShippingMethods) && selectedShippingMethods[0] !== undefined) {
                            result.shipmethod = selectedShippingMethods[0].internalid;
                            result.shipmethods = selectedShippingMethods;
                        } else {
                            result.shipmethod = defaultShippingMethod.internalid;
                            result.shipmethods = [defaultShippingMethod];
                        }
                    }
                    //setting shipping cost to 0 as per netsuite implementation of free shipping promotion
                    if (freeShippingPromos !== undefined && !_.isEmpty(freeShippingPromos)) {
                        _.map(result.shipmethods, function (shipMethod) {
                            shipMethod.rate = 0;
                            shipMethod.rate_formatted = 'Free!'; //Utils.formatCurrency(shipMethod.rate);
                            return shipMethod;
                        })
                    }
                    //if free shipping exist, display that in checkout
                    // if(freeShipping !== undefined && !_.isEmpty(freeShipping)){
                    //     result.shipmethods = _.uniq(_.union(freeShipping, result.shipmethods)); //combine free shipping with rest shipping item for checkout
                    //     if(selectedShipMethod !== undefined){
                    //         result.shipmethod = selectedShipMethod;
                    //     }
                    // }
                    //setting order_summary total and shippingcost
                    if (!_.isEmpty(result.shipmethods)) {
                        var chosenShippingMethod = _.find(result.shipmethods, function (shipmethod) {
                            return shipmethod.internalid === result.shipmethod;
                        });
                        if (chosenShippingMethod !== undefined && !_.isEmpty(chosenShippingMethod)) {
                            var shippingCost = Math.round(parseFloat(chosenShippingMethod.rate) * 100) / 100;
                            var taxOnShipping = 0.00;
                            var estimateShipTax = 0.00;
                            var totalShipPrice = Math.round(parseFloat(chosenShippingMethod.rate) * 100) / 100;
                            if (chosenShippingMethod.name.indexOf("STARTRACK") != -1 || chosenShippingMethod.name.toLowerCase().replace(/\s/g, '').indexOf('evakoolshipping') != -1) {
                                shippingCost = Math.round((totalShipPrice * (10 / 11)) * 100) / 100; //finding 100% from 110%
                                taxOnShipping = Math.round((shippingCost * 0.10) * 100) / 100;
                                estimateShipTax = order_fields.summary.estimatedshipping ? Math.round((parseFloat(order_fields.summary.estimatedshipping) / 10) * 100) / 100 : 0;
                            } else if (chosenShippingMethod.internalid === defaultShippingMethod.internalid) {
                                shippingCost = Math.round((totalShipPrice * 10 / 11) * 100) / 100; //subtracting 10% from 110%
                            }
                            order_fields.summary.taxonshipping += parseFloat(taxOnShipping);
                            order_fields.summary.taxonshipping_formatted = Utils.formatCurrency(order_fields.summary.taxonshipping);
                            //from taxtotal & total, subtracting tax on estimated shipping cost (if any) and adding our own calculated tax on shipping cost 
                            order_fields.summary.taxtotal += parseFloat(taxOnShipping) - estimateShipTax;
                            order_fields.summary.taxtotal_formatted = Utils.formatCurrency(order_fields.summary.taxtotal);
                            order_fields.summary.total += (shippingCost - order_fields.summary.shippingcost) + taxOnShipping - estimateShipTax;
                            order_fields.summary.shippingcost = parseFloat(shippingCost);
                            order_fields.summary.shippingcost_formatted = Utils.formatCurrency(shippingCost);
                        }
                    }
                }
                //DSC Customization : END
            }
            // Addresses
            result.addresses = this.getAddresses(order_fields);
            result.billaddress = order_fields.billaddress ?
                order_fields.billaddress.internalid :
                null;
            result.shipaddress = !result.ismultishipto ? order_fields.shipaddress.internalid : null;
            // @property {Array<ShoppingSession.PaymentMethod>} paymentmethods Payments
            result.paymentmethods = this.getPaymentMethods(order_fields);
            // @property {Boolean} isPaypalComplete Paypal complete
            result.isPaypalComplete =
                ModelsInit.context.getSessionObject('paypal_complete') === 'T';
            // @property {Array<String>} touchpoints Some actions in the live order may change the URL of the checkout so to be sure we re send all the touchpoints
            result.touchpoints = SiteSettings.getTouchPoints();
            // @property {Boolean} agreetermcondition Terms And Conditions
            result.agreetermcondition = order_fields.agreetermcondition === 'T';

            // @property {OrderSummary} Summary
            result.summary = order_fields.summary;
            if (result.summary) {
                result.summary.discountrate = Utils.toCurrency(result.summary.discountrate);
                result.summary.discounttotal_formatted = Utils.formatCurrency(result.summary.discounttotal);
                result.summary.taxonshipping_formatted = Utils.formatCurrency(result.summary.taxonshipping);
                result.summary.taxondiscount_formatted = Utils.formatCurrency(result.summary.taxondiscount);
                result.summary.taxonhandling_formatted = Utils.formatCurrency(result.summary.taxonhandling);
                result.summary.discountedsubtotal_formatted = Utils.formatCurrency(result.summary.discountedsubtotal);
                result.summary.handlingcost_formatted = Utils.formatCurrency(result.summary.handlingcost);
                result.summary.taxtotal_formatted = Utils.formatCurrency(result.summary.taxtotal);
                result.summary.giftcertapplied_formatted = Utils.formatCurrency(result.summary.giftcertapplied);
                result.summary.shippingcost_formatted = Utils.formatCurrency(result.summary.shippingcost);
                result.summary.tax2total_formatted = Utils.formatCurrency(result.summary.tax2total);
                result.summary.discountrate_formatted = Utils.formatCurrency(result.summary.discountrate);
                result.summary.estimatedshipping_formatted = Utils.formatCurrency(result.summary.estimatedshipping);
                result.summary.total_formatted = Utils.formatCurrency(result.summary.total);
                result.summary.subtotal_formatted = Utils.formatCurrency(result.summary.subtotal);
            }
            if (this.isSuiteTaxEnabled) {
                // @property {Array<suitetax>} suitetaxes
                result.suitetaxes = this.getSuiteTaxes();
            }
            // @property {Object} options Transaction Body Field
            result.options = this.getTransactionBodyField();
            result.purchasenumber = order_fields.purchasenumber;
            if (!threedsecure &&
                this.isThreedSecureEnabled &&
                result &&
                result.summary &&
                result.paymentmethods &&
                result.paymentmethods.length &&
                result.paymentmethods[0].creditcard) {
                var paymentMethod = result.paymentmethods[0].creditcard.paymentmethod;
                var notificationURL = ModelsInit.session.getAbsoluteUrl2('checkout', '../threedsecure.ssp');
                this.authenticationOptions = {
                    amount: result.summary.total,
                    paymentOption: result.paymentmethods[0].creditcard.internalid,
                    paymentProcessingProfile: paymentMethod.key.split(',')[1],
                    notificationURL: notificationURL
                };
            }
            // @class LiveOrder.Model
            return result;
        },

        getDefaultShippingMethod: function () {
            var defaultShippingMethodId = ModelsInit.session.getSiteSettings(['defaultshippingmethod']).defaultshippingmethod;
            return _.find(this.getShipMethodsOnly(), function (shipmethod) {
                return shipmethod.internalid == defaultShippingMethodId;
            });
        },

        shippingEmail: function shippingEmail() {
            var order_fields = this.getFieldValues();
            var result = {};
            try {
                // @property {Array<LiveOrder.Model.Line>} lines
                result.lines = this.getLines(order_fields);
            } catch (e) {
                if (e.code === 'ERR_CHK_ITEM_NOT_FOUND') {
                    return this.get();
                }
                throw e;
            }
            order_fields = this.hidePaymentPageWhenNoBalance(order_fields);
            result.addresses = this.getAddresses(order_fields);
            var shippingemail = this.getLiveShippingRates(result.lines, result.addresses, 'cart');
            return shippingemail;
        },

        getLiveShippingRates: function (lines, address, source) {
            if (lines.length == 0) {
                return [];
            }
            var dimensions = this.getDimensions(lines);
            if (!_.isEmpty(address) && !_.isEmpty(address[0])) {
                address = address[0]; //get the selected one
            }
            if (!_.isEmpty(address.addr1)) {
                address.street = address.addr1;
            }
            if (!_.isEmpty(address.zip) && _.isEmpty(address.state) && _.isEmpty(address.city) && _.isEmpty(address.addr1)) {
                var url = 'https://maps.googleapis.com/maps/api/geocode/json?components=country:AU|postal_code:' + address.zip + '&key=AIzaSyAfLF11wPtOUVvzfkS1j7HX5uGYa_fzKCY'; //+Configuration.get().storeLocator.apiKey; //  
                var zipAddress = nlapiRequestURL(url, null, {
                    "Content-Type": 'application/json'
                }, null, 'GET');
                var addressResponse = JSON.parse(zipAddress.getBody());
                if (addressResponse.results != undefined && addressResponse.results[0] != undefined && addressResponse.results[0].address_components != undefined) {
                    var components = addressResponse.results[0].address_components;
                    _.each(components, function (component) {
                        if (component.types[0] == 'locality') {
                            address.city = component.long_name;
                        }
                        if (component.types[0] == 'administrative_area_level_1') {
                            address.state = component.short_name;
                        }
                        if (component.types[0] == 'administrative_area_level_2') {
                            address.street = component.long_name;
                        }
                    });
                }
            }
            var addresses = {
                from: {
                    postcode: "4551",
                    state: "QLD",
                    suburb: "CALOUNDRA WEST",
                    name: "Evakool HQ",
                    lines: ["16 ENTERPRISE STREET"],
                    phone: "(130)038-5665"
                },
                to: {
                    postcode: address.zip,
                    state: address.state,
                    suburb: address.city,
                    lines: [address.street]
                }
            };
            var data = {
                addresses: addresses,
                itemQtyMapObj: dimensions,
                "actionType": "GET_RATES"
                // cart_id: source ? source : this.cart_id,
                // shipping_data: 'shipping_packages' //array of dimensions
            };
            var GET_PRICE_API = this.shipping_suitelet_url;
            var AUTH_HEADER = {
                "Content-Type": 'application/json'
            };
            if (data) {
                var liveShippingRateResponse = nlapiRequestURL(GET_PRICE_API, JSON.stringify(data), AUTH_HEADER, null, 'POST');
                if (liveShippingRateResponse.getBody()) {
                    var shippingRates = [];
                    var response = JSON.parse(liveShippingRateResponse.getBody());
                    
                    if (response.status == "200") {
                        var shippingServices = response.data && response.data.suiteCommerce && Object.keys(response.data.suiteCommerce).length > 0 ? response.data.suiteCommerce : "";
                        // var totalDefaultShipCost = parseFloat(response.totalDefaultShipCost);
                        if (shippingServices != "") {
                            var obj = {};
                            obj.calculated_gst = shippingServices.shippingTax;
                            var cartonOnlyCost = parseFloat(shippingServices.totalShipping) - parseFloat(shippingServices.satchelDefaultShipCost);
                            obj.calculated_price = Math.round((parseFloat(cartonOnlyCost) * 1.15) * 100) / 100 + Math.round(parseFloat(shippingServices.satchelDefaultShipCost)); //adding 15% for smart freight
                            obj.calculated_price_ex_gst = shippingServices.shippingCost;
                            obj.product_id = shippingServices.shippingMethodId;
                            obj.product_type = shippingServices.shippingMethodName;
                            shippingRates.push(obj);
                        }
                        //  var shippingServices = JSON.stringify(shippingRates);
                        // return shippingServices || [];
                        shippingServices = shippingRates;

                    } else {
                        shippingServices = [];
                    }

                }
            }
            return shippingServices || [];
        },

        getDimensions: function (lines) {
            var itemQtyMapObj = {};
            var itemid = 0;
            var quantity = 0;
            for (i = 0; i < lines.length; i++) {
                if (lines[i].fulfillmentChoice != 'ship' || lines[i].itemtype == "Service") {
                    continue;
                }
                itemid = lines[i].item.internalid;
                quantity = lines[i].quantity;
                if (!itemQtyMapObj[itemid] && quantity > 0)
                    itemQtyMapObj[itemid] = quantity;
            }
            return itemQtyMapObj;
        },
        getSelectedShippingMethod: function (liveShippingMethods, NSShippingMethods) {
            this.customShipmethods = _.map(NSShippingMethods, function (ns_shipmethod) {
                var liveShipmethod = _.find(liveShippingMethods, function (live_shipmethod) {
                    return ns_shipmethod.name.toLowerCase().replace(/\s/g, '') == live_shipmethod.product_type.toLowerCase().replace(/\s/g, '');
                });
                if (liveShipmethod) {
                    ns_shipmethod.rate = liveShipmethod.calculated_price;
                    ns_shipmethod.rateExGST = liveShipmethod.calculated_price_ex_gst;
                    ns_shipmethod.calculatedGST = liveShipmethod.calculated_gst;
                    ns_shipmethod.rate_formatted = Utils.formatCurrency(ns_shipmethod.rate);
                    // if (liveShipmethod.calculated_gst == "0.0" && liveShipmethod.calculated_price_ex_gst == "0.0") ns_shipmethod.isSatchelFreight = true;
                    if (liveShipmethod.product_type == "EXP | STARTRACK EXP") {
                        ns_shipmethod.name = "STARTRACK";
                    } else {
                        ns_shipmethod.name = liveShipmethod.product_type;
                    }
                    return ns_shipmethod;
                }
            });

            this.customShipmethods = _.filter(this.customShipmethods, function (key) {
                return key !== undefined && key !== null;
            });

            return this.customShipmethods;
        },
        // @method update will update the commerce order object with given data.
        // @param {LiveOrder.Model.Data} data
        update: function update(data) {
            const current_order = this.get('currentOrder');
            // We use this because we do not want to update certain atributes of the order if they had the same value as the provided as update's input.
            // This is because, through the Extensibility API, an extension may have made some changes to the order and those may be overwritten if the update's input has a different value.
            var pre_update_order = this.get('preUpdateOrder');
            var executeConditionalSet = _.partial(this._executeConditionalSet, data, current_order, pre_update_order);
            executeConditionalSet = _.bind(executeConditionalSet, this);
            this.storePromosPrevState();
            // Only do this if it's capable of shipping multiple items.
            if (this.isMultiShippingEnabled) {
                if (this.isSecure && ModelsInit.session.isLoggedIn2()) {
                    ModelsInit.order.setEnableItemLineShipping(!!data.ismultishipto);
                    if (!current_order.ismultishipto && data.ismultishipto) {
                        this.automaticallyRemovedPromocodes = this.getAutomaticallyRemovedPromocodes(current_order);
                    }
                }
                // Do the following only if multishipto is active (if the data received determine that MST is enabled and pass the MST Validation)
                if (data.ismultishipto) {
                    ModelsInit.order.removeShippingAddress();
                    ModelsInit.order.removeShippingMethod();
                    this.splitLines(data, current_order);
                    this.setShippingAddressAndMethod(data, current_order);
                }
            }
            if (!this.isMultiShippingEnabled || !data.ismultishipto) {
                var isDataShipAddressDifferentToCurrentShipAddress = data.shipaddress !== current_order.shipaddress;
                executeConditionalSet('setShippingAddress');
                executeConditionalSet('setShippingMethod');
            }
            executeConditionalSet('setPromoCodes');
            executeConditionalSet('setBillingAddress');
            executeConditionalSet('setPaymentMethods');
            this.setPurchaseNumber(data, current_order);
            this.setTermsAndConditions(data, current_order);
            this.setTransactionBodyField(data, current_order);
            this.manageFreeGifts();
            //Start
            var fulfillmentChoice = "";
            var updateFulfillmentChoice = false;
            _.each(data.lines, function (line) {
                if (fulfillmentChoice == "") {
                    fulfillmentChoice = line.fulfillmentChoice;
                }
                if (fulfillmentChoice != line.fulfillmentChoice) {
                    updateFulfillmentChoice = true;
                }
            });
            if (updateFulfillmentChoice) {
                var orderItem = _.find(data.lines, function (line) {
                    return line.freeGift == false;
                });
                this.updateLineModels(orderItem, orderItem.fulfillmentChoice);
            } // end
            if (this.isSuiteTaxEnabled &&
                !this.isMultiShippingEnabled &&
                !data.ismultishipto &&
                isDataShipAddressDifferentToCurrentShipAddress) {
                ModelsInit.order.recalculateTaxes();
            }
        },
        getSuiteTaxes: function getSuiteTaxes() {
            var result = [];
            var suite_taxes = ModelsInit.order.getSummaryTaxTotals();
            _.each(suite_taxes.taxTotals, function (suitetax) {
                result.push({
                    taxTypeId: suitetax.taxTypeId,
                    taxTypeName: suitetax.taxTypeName,
                    taxTotal: Utils.formatCurrency(suitetax.taxTotal)
                });
            });
            return result;
        },
        _executeConditionalSet: function _executeConditionalSet(data, current_order, pre_update_order, fn_name) {
            var validations = {
                setShippingAddress: function () {
                    return data.shipaddress !== pre_update_order.shipaddress;
                },
                setBillingAddress: function () {
                    if (data.sameAs) {
                        data.billaddress = data.shipaddress;
                    }
                    return data.billaddress !== pre_update_order.billaddress;
                },
                setShippingMethod: function () {
                    return data.shipmethod !== pre_update_order.shipmethod;
                },
                setPromoCodes: function () {
                    var pre_promocodes = _.pluck(pre_update_order.promocodes, 'code');
                    var data_promocodes = _.pluck(data.promocodes, 'code');
                    return (!_.isEmpty(_.difference(pre_promocodes, data_promocodes)) ||
                        !_.isEmpty(_.difference(data_promocodes, pre_promocodes)));
                },
                setPaymentMethods: function () {
                    if (data.paymentmethods.length !== pre_update_order.paymentmethods.length) {
                        return true;
                    }
                    var data_payments = _.map(data.paymentmethods, function (payment) {
                        if (payment.type === 'giftcertificate') {
                            return payment.giftcertificate;
                        }
                        if (payment.type === 'creditcard') {
                            payment.creditcard.type = payment.type;
                            return payment.creditcard;
                        }
                        return payment;
                    });
                    var pre_payments = _.map(pre_update_order.paymentmethods, function (payment) {
                        if (payment.type === 'giftcertificate') {
                            return payment.giftcertificate;
                        }
                        if (payment.type === 'creditcard') {
                            payment.creditcard.type = payment.type;
                            return payment.creditcard;
                        }
                        return payment;
                    });
                    for (var i = 0; i < data_payments.length; i++) {
                        var data_payment = data_payments[i];
                        var filter = {
                            type: data_payment.type
                        };
                        switch (data_payment.type) {
                            case 'creditcard':
                                filter.ccnumber = data_payment.ccnumber;
                                filter.ccsecuritycode = data_payment.ccsecuritycode;
                                filter.ccname = data_payment.ccname;
                                filter.expmonth = data_payment.expmonth;
                                filter.expyear = data_payment.expyear;
                                break;
                            case 'invoice':
                                // Filtering by type is enough because a customer always have the same terms
                                break;
                            case 'paypal':
                                filter.internalid = data_payment.internalid;
                                break;
                            case 'giftcertificate':
                                filter.code = data_payment.code;
                                break;
                            default:
                                // external payment
                                filter.internalid = data_payment.internalid;
                                break;
                        }
                        if (!_.findWhere(pre_payments, filter)) {
                            return true;
                        }
                    }
                    return false;
                }
            };
            var execute_set = validations[fn_name] && validations[fn_name]();
            if (execute_set) {
                this[fn_name].apply(this, [data, current_order]);
            }
        },
        nonAvailableItems: function nonAvailableItems() {
            var non_available_items = [];
            var order_items = _.pluck(this.getFieldValues().items, 'internalid');
            if (order_items.length) {
                var available_items_1 = [];
                _.each(ModelsInit.session.getItemFieldValues('order', order_items).items, function (item) {
                    if (item) {
                        if (item.internalid != undefined) {
                            available_items_1.push(item.internalid.toString());
                        }
                    }
                });
                non_available_items = _.difference(order_items, available_items_1);
            }
            return non_available_items;
        },
        // @method checkItemsAvailability will check if there is some item no longer available
        checkItemsAvailability: function checkItemsAvailability() {
            if (this.nonAvailableItems().length) {
                var message = 'Unfortunately this item/s is not longer available. Please <a href="' +
                    SiteSettings.getTouchPoints().viewcart +
                    '"> go back </a> and review the cart';
                throw {
                    status: 500,
                    code: 400,
                    message: message
                };
            }
        },
        // @method submit will call ModelsInit.order.submit() taking in account paypal payment
        // @param {Boolean} threedsecure Received only in 3D Secure second step (from threedsecure.ssp)
        // @return {Object} Result of order submit operation ({status, internalid, confirmationnumber})
        submit: function submit(threedsecure) {
            let confirmation;
            const payment = ModelsInit.order.getPayment();
            this.isCardHolderAuthenticationSupported =
                payment &&
                payment.creditcard &&
                payment.creditcard.paymentmethod &&
                payment.creditcard.paymentmethod.iscardholderauthenticationsupported === 'T';
            if (!threedsecure &&
                payment &&
                payment.creditcard &&
                payment.creditcard.paymentmethod &&
                payment.creditcard.paymentmethod.creditcard === 'T' &&
                this.isThreedSecureEnabled) {
                return this.process3DSecure();
            }
            var paypal_address = _.find(ModelsInit.customer.getAddressBook(), function (address) {
                return !address.phone && address.isvalid === 'T';
            });
            confirmation = ModelsInit.order.submit();
            if (this.isMultiShippingEnabled) {
                ModelsInit.order.setEnableItemLineShipping(false); // By default non order should be MST
            }
            // As the commerce API does not remove the purchase number after submitting the order we manually remove it
            this.setPurchaseNumber();
            if (confirmation.statuscode !== 'redirect') {
                confirmation = _.extend(this.getConfirmation(confirmation.internalid), confirmation);
            } else {
                var paypal_complete = ModelsInit.context.getSessionObject('paypal_complete') === 'T';
                if (confirmation.reasoncode === 'ERR_WS_INVALID_PAYMENT' && paypal_complete) {
                    var message = '<a href="' +
                        confirmation.redirecturl +
                        '">Paypal</a> was unable to process the payment. <br>Please select an alternative <a href="#billing">payment method</a> and continue to checkout.';
                    throw {
                        status: 500,
                        code: confirmation.reasoncode,
                        message: message
                    };
                }
                confirmation.redirecturl = ExternalPayment.generateUrl(confirmation.internalid, 'salesorder');
            }
            // We need remove the paypal's address because after order submit the address is invalid for the next time.
            this.removePaypalAddress(paypal_address);
            ModelsInit.order.removeAllPromotionCodes(); //DSC Customization: Removing applied promo codes after placing order
            ModelsInit.context.setSessionObject('paypal_complete', 'F');
            return confirmation;
        },
        // @method addAddress
        // @param {OrderAddress} address
        // @param {Array<OrderAddress>} addresses
        // @returns {String} the given address internal id
        addAddress: function addAddress(address, addresses) {
            if (!address) {
                return null;
            }
            addresses = addresses || {};
            if (!address.fullname) {
                address.fullname = address.attention ? address.attention : address.addressee;
            }
            if (!address.company) {
                address.company = address.attention ? address.addressee : null;
            }
            delete address.attention;
            delete address.addressee;
            if (!address.internalid) {
                address.internalid =
                    (address.country || '') +
                    '-' +
                    (address.state || '') +
                    '-' +
                    (address.city || '') +
                    '-' +
                    (address.zip || '') +
                    '-' +
                    (address.addr1 || '') +
                    '-' +
                    (address.addr2 || '') +
                    '-' +
                    (address.fullname || '') +
                    '-' +
                    address.company;
                address.internalid = address.internalid.replace(/\s/g, '-');
            }
            if (address.internalid !== '-------null') {
                addresses[address.internalid] = address;
            }
            return address.internalid;
        },
        // @method hidePaymentPageWhenNoBalance
        // @param {Array<String>} order_fields
        hidePaymentPageWhenNoBalance: function hidePaymentPageWhenNoBalance(order_fields) {
            if (this.isSecure &&
                ModelsInit.session.isLoggedIn2() &&
                order_fields.payment &&
                ModelsInit.session.getSiteSettings(['checkout']).checkout
                .hidepaymentpagewhennobalance === 'T' &&
                order_fields.summary.total === 0) {
                ModelsInit.order.removePayment();
                order_fields = this.getFieldValues();
            }
            return order_fields;
        },
        // @method redirectToPayPal calls ModelsInit.order.proceedToCheckout() method passing information for paypal third party checkout provider
        redirectToPayPal: function redirectToPayPal() {
            var touchpoints = SiteSettings.getTouchPoints();
            var continue_url = ModelsInit.session.getAbsoluteUrl2('') +
                (/\/$/.test(ModelsInit.session.getAbsoluteUrl2('')) ?
                    touchpoints.checkout.replace('/', '') :
                    touchpoints.checkout);
            var joint = ~continue_url.indexOf('?') ? '&' : '?';
            continue_url =
                continue_url + joint + 'paypal=DONE&fragment=' + request.getParameter('next_step');
            ModelsInit.session.proceedToCheckout({
                cancelurl: touchpoints.viewcart,
                continueurl: continue_url,
                createorder: 'F',
                type: 'paypalexpress',
                shippingaddrfirst: 'T',
                showpurchaseorder: 'T'
            });
        },
        // @method redirectToPayPalExpress calls ModelsInit.order.proceedToCheckout() method passing information for paypal-express third party checkout provider
        redirectToPayPalExpress: function redirectToPayPalExpress() {
            var touchpoints = SiteSettings.getTouchPoints();
            var continue_url = ModelsInit.session.getAbsoluteUrl2('') +
                (/\/$/.test(ModelsInit.session.getAbsoluteUrl2('')) ?
                    touchpoints.checkout.replace('/', '') :
                    touchpoints.checkout);
            var joint = ~continue_url.indexOf('?') ? '&' : '?';
            continue_url = continue_url + joint + 'paypal=DONE';
            ModelsInit.session.proceedToCheckout({
                cancelurl: touchpoints.viewcart,
                continueurl: continue_url,
                createorder: 'F',
                type: 'paypalexpress'
            });
        },
        // @method getConfirmation
        getConfirmation: function getConfirmation(internalid) {
            var confirmation = {
                internalid: internalid
            };
            try {
                const record = nlapiLoadRecord('salesorder', confirmation.internalid);
                confirmation = this.confirmationCreateResult(record);
            } catch (e) {
                console.warn('Cart Confirmation could not be loaded, reason: ' + JSON.stringify(e));
            }
            return confirmation;
        },
        // @method confirmationCreateResult
        confirmationCreateResult: function confirmationCreateResult(placed_order) {
            var self = this;
            var result = {
                internalid: placed_order.getId(),
                tranid: placed_order.getFieldValue('tranid'),
                summary: {
                    subtotal: Utils.toCurrency(placed_order.getFieldValue('subtotal')),
                    subtotal_formatted: Utils.formatCurrency(placed_order.getFieldValue('subtotal')),
                    taxtotal: Utils.toCurrency(placed_order.getFieldValue('taxtotal')),
                    taxtotal_formatted: Utils.formatCurrency(placed_order.getFieldValue('taxtotal')),
                    tax2total: Utils.toCurrency(placed_order.getFieldValue('tax2total')),
                    tax2total_formatted: Utils.formatCurrency(placed_order.getFieldValue('tax2total')),
                    shippingcost: Utils.toCurrency(placed_order.getFieldValue('shippingcost')),
                    shippingcost_formatted: Utils.formatCurrency(placed_order.getFieldValue('shippingcost')),
                    handlingcost: Utils.toCurrency(placed_order.getFieldValue('althandlingcost')),
                    handlingcost_formatted: Utils.formatCurrency(placed_order.getFieldValue('althandlingcost')),
                    discounttotal: Utils.toCurrency(placed_order.getFieldValue('discounttotal')),
                    discounttotal_formatted: Utils.formatCurrency(placed_order.getFieldValue('discounttotal')),
                    giftcertapplied: Utils.toCurrency(placed_order.getFieldValue('giftcertapplied')),
                    giftcertapplied_formatted: Utils.formatCurrency(placed_order.getFieldValue('giftcertapplied')),
                    total: Utils.toCurrency(placed_order.getFieldValue('total')),
                    total_formatted: Utils.formatCurrency(placed_order.getFieldValue('total'))
                }
            };
            var i = 0;
            result.promocodes = [];
            var promocode = placed_order.getFieldValue('promocode');
            // If legacy behavior is present & a promocode is applied this IF will be true
            // In case stackable promotions are enable this.record.getFieldValue('promocode') returns null
            if (promocode) {
                result.promocodes.push({
                    internalid: promocode,
                    code: placed_order.getFieldText('couponcode'),
                    isvalid: true,
                    discountrate_formatted: ''
                });
            }
            for (i = 1; i <= placed_order.getLineItemCount('promotions'); i++) {
                if (placed_order.getLineItemValue('promotions', 'applicabilitystatus', i) !==
                    'NOT_APPLIED') {
                    result.promocodes.push({
                        internalid: placed_order.getLineItemValue('promotions', 'couponcode', i),
                        code: placed_order.getLineItemValue('promotions', 'couponcode_display', i),
                        isvalid: placed_order.getLineItemValue('promotions', 'promotionisvalid', i) ===
                            'T',
                        discountrate_formatted: ''
                    });
                }
            }
            result.paymentmethods = [];
            for (i = 1; i <= placed_order.getLineItemCount('giftcertredemption'); i++) {
                result.paymentmethods.push({
                    type: 'giftcertificate',
                    giftcertificate: {
                        code: placed_order.getLineItemValue('giftcertredemption', 'authcode_display', i),
                        amountapplied: placed_order.getLineItemValue('giftcertredemption', 'authcodeapplied', i),
                        amountapplied_formatted: Utils.formatCurrency(placed_order.getLineItemValue('giftcertredemption', 'authcodeapplied', i)),
                        amountremaining: placed_order.getLineItemValue('giftcertredemption', 'authcodeamtremaining', i),
                        amountremaining_formatted: Utils.formatCurrency(placed_order.getLineItemValue('giftcertredemption', 'authcodeamtremaining', i)),
                        originalamount: placed_order.getLineItemValue('giftcertredemption', 'giftcertavailable', i),
                        originalamount_formatted: Utils.formatCurrency(placed_order.getLineItemValue('giftcertredemption', 'giftcertavailable', i))
                    }
                });
            }
            result.lines = [];
            for (i = 1; i <= placed_order.getLineItemCount('item'); i++) {
                var line_item = {
                    item: {
                        id: placed_order.getLineItemValue('item', 'item', i),
                        type: placed_order.getLineItemValue('item', 'itemtype', i)
                    },
                    quantity: parseInt(placed_order.getLineItemValue('item', 'quantity', i), 10),
                    rate: parseFloat(placed_order.getLineItemValue('item', 'rate', i)),
                    options: self.parseLineOptionsFromSuiteScript(placed_order.getLineItemValue('item', 'options', i))
                };
                if (self.isPickupInStoreEnabled) {
                    if (placed_order.getLineItemValue('item', 'itemfulfillmentchoice', i) === '1') {
                        line_item.fulfillmentChoice = 'ship';
                    } else if (placed_order.getLineItemValue('item', 'itemfulfillmentchoice', i) === '2') {
                        line_item.fulfillmentChoice = 'pickup';
                    }
                }
                result.lines.push(line_item);
            }
            StoreItem.preloadItems(_(result.lines).pluck('item'));
            _.each(result.lines, function (line) {
                line.item = StoreItem.get(line.item.id, line.item.type);
            });
            return result;
        },
        // @method backFromPayPal
        backFromPayPal: function backFromPayPal() {
            var customer_values = Profile.get();
            var bill_address = ModelsInit.order.getBillingAddress();
            var ship_address = ModelsInit.order.getShippingAddress();
            if (customer_values.isGuest === 'T' &&
                ModelsInit.session.getSiteSettings(['registration']).registration
                .companyfieldmandatory === 'T') {
                var customfields = {};
                for (var i = 0; i < customer_values.customfields.length; i++) {
                    customfields[customer_values.customfields[i].name] =
                        customer_values.customfields[i].value;
                }
                customer_values.customfields = customfields;
                customer_values.companyname = 'Guest Shopper';
                ModelsInit.customer.updateProfile(customer_values);
            }
            if (ship_address.internalid &&
                ship_address.isvalid === 'T' &&
                !bill_address.internalid) {
                ModelsInit.order.setBillingAddress(ship_address.internalid);
            }
            ModelsInit.context.setSessionObject('paypal_complete', 'T');
        },
        // @method removePaypalAddress remove the shipping address or billing address if phone number is null.
        // This is because addresses are not valid created by Paypal.
        // @param {Object} paypal_address
        removePaypalAddress: function removePaypalAddress(paypal_address) {
            try {
                if (Configuration.get('removePaypalAddress') &&
                    paypal_address &&
                    paypal_address.internalid) {
                    ModelsInit.customer.removeAddress(paypal_address.internalid);
                }
            } catch (e) {
                // ignore this exception, it is only for the cases that we can't remove pay-pal's address.
                // This exception will not send to the front-end
                var error = Application.processError(e);
                console.warn('Error ' +
                    error.errorStatusCode +
                    ': ' +
                    error.errorCode +
                    ' - ' +
                    error.errorMessage);
            }
        },
        // @method addLine
        // @param {LiveOrder.Model.Line} line_data
        addLine: function addLine(line_data) {
            var item = {
                internalid: line_data.item.internalid.toString(),
                quantity: _.isNumber(line_data.quantity) ? parseInt(line_data.quantity, 10) : 1,
                options: this.parseLineOptionsToCommerceAPI(line_data.options)
            };
            if (this.isPickupInStoreEnabled &&
                line_data.fulfillmentChoice === 'pickup' &&
                line_data.location) {
                item.fulfillmentPreferences = {
                    fulfillmentChoice: 'pickup',
                    pickupLocationId: parseInt(line_data.location, 10)
                };
            }
            // Adds the line to the order
            var line_id = ModelsInit.order.addItem(item);
            if (this.isMultiShippingEnabled && line_data.fulfillmentChoice !== 'pickup') {
                // Sets it ship address (if present)
                line_data.shipaddress &&
                    ModelsInit.order.setItemShippingAddress(line_id, line_data.shipaddress);
                // Sets it ship method (if present)
                line_data.shipmethod &&
                    ModelsInit.order.setItemShippingMethod(line_id, line_data.shipmethod);
            }
            // Stores the latest addition
            ModelsInit.context.setSessionObject('latest_addition', line_id);
            // Stores the current order
            var lines_sort = this.getLinesSort();
            lines_sort.unshift(line_id);
            this.setLinesSort(lines_sort);
            this.shippingEmail();
            return line_id;
        },
        // @method addLines
        // @param {Array<LiveOrder.Model.Line>} lines_data
        addLines: function addLines(lines_data) {
            var items = [];
            var self = this;
            this.storePromosPrevState();
            _.each(lines_data, function (line_data) {
                var item = {
                    internalid: line_data.item.internalid.toString(),
                    quantity: _.isNumber(line_data.quantity) ? parseInt(line_data.quantity, 10) : 1,
                    options: self.parseLineOptionsToCommerceAPI(line_data.options)
                };
                if (self.isPickupInStoreEnabled &&
                    line_data.fulfillmentChoice === 'pickup' &&
                    line_data.location) {
                    item.fulfillmentPreferences = {
                        fulfillmentChoice: 'pickup',
                        pickupLocationId: parseInt(line_data.location, 10)
                    };
                }
                items.push(item);
            });
            var lines_ids = ModelsInit.order.addItems(items);
            var latest_addition = _.last(lines_ids).orderitemid;
            var order_item_ids = _.pluck(lines_ids, 'orderitemid');
            // Stores the current order
            var lines_sort = this.getLinesSort();
            lines_sort.unshift(order_item_ids.reverse());
            this.setLinesSort(lines_sort);
            ModelsInit.context.setSessionObject('latest_addition', latest_addition);
            this.manageFreeGifts();
            this.shippingEmail();
            return lines_ids;
        },
        // @method manageFreeGifts
        manageFreeGifts: function manageFreeGifts() {
            var promotions = ModelsInit.order.getAppliedPromotionCodes();
            promotions = _.filter(promotions, function (promo) {
                return promo.promotion_type === 'FREEGIFT';
            });
            return this.manageFreeGiftsWithPromotions(promotions);
        },
        // @method removeAllFreeGiftByPromotion
        removeAllFreeGiftsByPromotion: function (promotion_id) {
            var lines = this.getLines(this.getFieldValues());
            var found = false;
            var free_gift_line;
            lines = _.filter(lines, function (line) {
                return line.free_gift;
            });
            _.each(lines, function (line) {
                if (!found &&
                    line.free_gift_info &&
                    line.free_gift_info.promotion_id === promotion_id) {
                    free_gift_line = line;
                    found = true;
                    ModelsInit.order.removeItem(free_gift_line.internalid.toString());
                }
            });
        },
        // @method manageFreeGiftsWithPromotions
        manageFreeGiftsWithPromotions: function manageFreeGiftsWithPromotions(promotions) {
            if (promotions && promotions.length) {
                const elegible_free_gifts = this.getEligibleFreeGifts();
                let free_gift;

                _.each(elegible_free_gifts, function (free_gift_obj) {
                    if (free_gift_obj.promotion_id === promotions[0].promocodeid) {
                        free_gift = free_gift_obj;
                    }
                });

                if (free_gift.eligible_items && free_gift.eligible_items.length) {
                    const item_stock = free_gift.eligible_items[0].available_quantity;
                    const item_isbackorderable = free_gift.eligible_items[0].is_backorderable;

                    let quantity_to_add = parseInt(
                        free_gift.eligible_quantity - free_gift.rejected_quantity
                    );

                    const field_values = this.getFieldValues();
                    let lines = this.getLines(field_values);

                    let free_gift_line;

                    lines = _.filter(lines, function (line) {
                        return line.free_gift;
                    });

                    let found = false;

                    _.each(lines, function (line) {
                        if (
                            !found &&
                            line.free_gift_info &&
                            line.free_gift_info.promotion_id === free_gift.promotion_id
                        ) {
                            free_gift_line = line;
                            found = true;
                        }
                    });

                    if (item_stock < quantity_to_add && !item_isbackorderable) {
                        quantity_to_add = item_stock;
                    }

                    if (free_gift_line) {
                        if (quantity_to_add !== free_gift_line.quantity) {
                            ModelsInit.order.removeItem(free_gift_line.internalid.toString());
                            this.addFreeGift(
                                free_gift.eligible_items[0].item_id,
                                free_gift.promotion_id,
                                quantity_to_add, {}
                            );
                        }
                    } else {
                        var freeGiftItem = this.addFreeGift(
                            free_gift.eligible_items[0].item_id,
                            free_gift.promotion_id,
                            quantity_to_add, {}
                        );

                        //DSC Customization : handle fulfillment for free gift
                        var orderItem = null;
                        _.each(ModelsInit.order.getItems(['fulfillmentPreferences', 'location']), function (lineItem) {
                            if (lineItem.freegiftpromotionid == null && orderItem == null) {
                                orderItem = ModelsInit.order.getItem(lineItem.orderitemid, ['fulfillmentPreferences', 'location']);
                            }
                        });
                        if (freeGiftItem.fulfillmentPreferences && freeGiftItem.fulfillmentPreferences.fulfillmentChoice != orderItem.fulfillmentPreferences.fulfillmentChoice) {
                            ModelsInit.order.updateItemFulfillmentPreferences({
                                orderitemid: freeGiftItem.orderitemid,
                                fulfillmentPreferences: orderItem.fulfillmentPreferences
                            });
                        } //end
                    }
                }

                promotions = _.reject(promotions, function (promo) {
                    return promo.promocodeid === free_gift.promotion_id;
                });

                this.manageFreeGiftsWithPromotions(promotions);
            }
        },
        //DSC Customization: function to update the fulfillment choice for whole cart
        updateLineModels: function (orderItem, fulfillmentChoice) {
            var lines = ModelsInit.order.getItems(['orderitemid', 'location', 'internalid']);
            var items = [];
            var fulfillmentPreferences;
            if (fulfillmentChoice === 'pickup') {
                fulfillmentPreferences = {
                    fulfillmentChoice: 'pickup',
                    location: orderItem.location || 401,
                    pickupLocationId: parseInt(orderItem.location) || 401
                };
            } else if (fulfillmentChoice === 'ship') {
                fulfillmentPreferences = {
                    fulfillmentChoice: 'ship'
                };
            }
            _.each(lines, function (line) {
                items.push({
                    orderitemid: line.orderitemid,
                    fulfillmentPreferences: fulfillmentPreferences
                });
            });
            ModelsInit.order.updateItemsFulfillmentPreferences(items);
        },
        // @method addFreeGift
        addFreeGift: function addFreeGift(item_id, promotion_id, quantity, options) {
            try {
                return ModelsInit.order.addFreeGiftItem({
                    item_id: item_id.toString(),
                    promotion_id: promotion_id,
                    quantity: quantity.toString(),
                    options: options
                });
            } catch (e) {
                if (e.errorcode ===
                    'YOU_CANNOT_ADD_THIS_ITEM_TO_THE_CART_AS_IT_IS_CURRENTLY_OUT_OF_STOCK') {
                    console.log(JSON.stringify(e));
                    ModelsInit.order.removePromotionCode(promotion_id);
                }
                throw e;
            }
        },
        // @method removeLine
        // @param {String} line_id
        removeLine: function removeLine(line_id) {
            this.storePromosPrevState();
            // Removes the line
            ModelsInit.order.removeItem(line_id);
            this.shippingEmail();
            // Stores the current order
            var lines_sort = this.getLinesSort();
            lines_sort = _.without(lines_sort, line_id);
            this.setLinesSort(lines_sort);
            this.manageFreeGifts();
        },
        // @method updateLine
        // @param {String} line_id
        // @param {LiveOrder.Model.Line} line_data
        updateLine: function updateLine(line_id, line_data) {
            this.shippingEmail();
            var lines_sort = this.getLinesSort();
            var current_position = _.indexOf(lines_sort, line_id);
            var original_line_object = ModelsInit.order.getItem(line_id, [
                'quantity',
                'internalid',
                'options',
                'fulfillmentPreferences'
            ]);
            if (original_line_object && original_line_object.internalid) {
                this.storePromosPrevState();
                if (line_data.freeGift === true) {
                    if (_.isNumber(line_data.quantity) &&
                        line_data.quantity > 0 &&
                        line_data.quantity !== original_line_object.quantity) {
                        line_data.orderitemid = line_data.internalid;
                        ModelsInit.order.updateItemQuantity(line_data);
                    }
                    if (this.isPickupInStoreEnabled &&
                        line_data.fulfillmentChoice !==
                        original_line_object.fulfillmentPreferences.fulfillmentChoice) {
                        var fulfillmentPreferences = void 0;
                        if (line_data.fulfillmentChoice === 'pickup') {
                            fulfillmentPreferences = {
                                fulfillmentChoice: 'pickup',
                                location: line_data.location
                            };
                        } else if (line_data.fulfillmentChoice === 'ship') {
                            fulfillmentPreferences = {
                                fulfillmentChoice: 'ship'
                            };
                        }
                        if (fulfillmentPreferences) {
                            ModelsInit.order.updateItemFulfillmentPreferences({
                                orderitemid: line_data.internalid,
                                fulfillmentPreferences: fulfillmentPreferences
                            });
                        }
                    }
                } else {
                    this.removeLine(line_id);
                    var new_line_id = void 0;
                    try {
                        new_line_id = this.addLine(line_data);
                    } catch (e) {
                        // we try to roll back the item to the original state
                        var roll_back_item_1 = {
                            item: {
                                internalid: parseInt(original_line_object.internalid, 10)
                            },
                            quantity: parseInt(original_line_object.quantity, 10)
                        };
                        if (original_line_object.options && original_line_object.options.length) {
                            roll_back_item_1.options = {};
                            _.each(original_line_object.options, function (option) {
                                roll_back_item_1.options[option.id.toLowerCase()] = option.value;
                            });
                        }
                        new_line_id = this.addLine(roll_back_item_1);
                        e.errorDetails = {
                            status: 'LINE_ROLLBACK',
                            oldLineId: line_id,
                            newLineId: new_line_id
                        };
                        throw e;
                    }
                    lines_sort = _.without(lines_sort, line_id, new_line_id);
                    lines_sort.splice(current_position, 0, new_line_id);
                    this.setLinesSort(lines_sort);
                    this.manageFreeGifts();
                }
            }
        },
        // @method splitLines
        // @param {LiveOrder.Model.Line} data
        // @param current_order
        splitLines: function splitLines(data, current_order) {
            _.each(data.lines, function (line) {
                if (line.splitquantity) {
                    var splitquantity = typeof line.splitquantity === 'string' ?
                        parseInt(line.splitquantity, 10) :
                        line.splitquantity;
                    var original_line = _.find(current_order.lines, function (order_line) {
                        return order_line.internalid === line.internalid;
                    });
                    var remaining = original_line ? original_line.quantity - splitquantity : -1;
                    if (remaining > 0 && splitquantity > 0) {
                        ModelsInit.order.splitItem({
                            orderitemid: original_line.internalid,
                            quantities: [splitquantity, remaining]
                        });
                    }
                }
            });
        },
        // @method getFieldValues
        // @param {Array<String>} requested_field_keys To override field_keys got from configuration
        // @returns {Array<String>}
        getFieldValues: function (requested_field_keys) {
            var order_field_keys = {};
            var isCheckout = Utils.isInCheckout(request) && ModelsInit.session.isLoggedIn2();
            var field_keys = isCheckout ?
                Configuration.get('orderCheckoutFieldKeys') :
                Configuration.get('orderShoppingFieldKeys');
            if (requested_field_keys) {
                field_keys = {
                    keys: requested_field_keys.keys || field_keys.keys,
                    items: requested_field_keys.items || field_keys.items
                };
            }
            order_field_keys.items = field_keys.items;
            _.each(field_keys.keys, function (key) {
                order_field_keys[key] = null;
            });
            if (this.isMultiShippingEnabled) {
                if (!_.contains(order_field_keys.items, 'shipaddress')) {
                    order_field_keys.items.push('shipaddress');
                }
                if (!_.contains(order_field_keys.items, 'shipmethod')) {
                    order_field_keys.items.push('shipmethod');
                }
                order_field_keys.ismultishipto = null;
            }
            if (this.isPickupInStoreEnabled) {
                if (!_.contains(order_field_keys.items, 'fulfillmentPreferences')) {
                    order_field_keys.items.push('fulfillmentPreferences');
                }
            }
            // nlapiLogExecution('debug', 'order_field_keys', JSON.stringify(order_field_keys))
            return ModelsInit.order.getFieldValues(order_field_keys, false);
        },
        // @method removeAllPromocodes Removes all the promocodes or the ones passed by parameter
        // @param {Array<LiveOrder.Model.PromoCode>} promocodes_to_remove List of promocodes that will removed
        // @return {Void}
        removeAllPromocodes: function removeAllPromocodes(promocodes_to_remove) {
            if (promocodes_to_remove) {
                _.each(promocodes_to_remove, function (promo) {
                    ModelsInit.order.removePromotionCode(promo.code);
                });
            } else {
                ModelsInit.order.removeAllPromotionCodes();
            }
        },
        // @method getPromoCodesOnly returns only the promocodes of the order without requesting unnecessary data
        // @return {Array<LiveOrder.Model.PromoCode>}
        getPromoCodesOnly: function getPromoCodesOnly() {
            var field_values = this.getFieldValues({
                keys: ['promocodes'],
                items: []
            });
            return this.getPromoCodes(field_values);
        },
        // @method getPromoCodes
        // @param {Object} order_fields
        // @return {Array<LiveOrder.Model.PromoCode>}
        getPromoCodes: function getPromoCodes(order_fields) {
            var result = [];
            var elegible_free_gifts = this.getEligibleFreeGifts();
            var self = this;
            if (order_fields.promocodes && order_fields.promocodes.length) {
                _.each(order_fields.promocodes, function (promo_code) {
                    // @class LiveOrder.Model.PromoCode
                    var promocode = {
                        // @property {String} internalid
                        internalid: promo_code.internalid,
                        // @property {String} internalid
                        promocodeid: promo_code.promocodeid,
                        // @property {String} code
                        code: promo_code.promocode,
                        // @property {Boolean} isvalid
                        isvalid: promo_code.isvalid === 'T',
                        // @property {String} discountrate_formatted
                        discountrate_formatted: '',
                        errormsg: promo_code.errormsg,
                        name: promo_code.discount_name,
                        rate: promo_code.discount_rate,
                        type: promo_code.promotion_type
                    };
                    // @property {Boolean} isautoapplied
                    promocode.isautoapplied = promo_code.is_auto_applied;
                    // @property {String} applicabilitystatus
                    promocode.applicabilitystatus = promo_code.applicability_status ?
                        promo_code.applicability_status :
                        '';
                    // @property {String} applicabilityreason
                    promocode.applicabilityreason = promo_code.applicability_reason ?
                        promo_code.applicability_reason :
                        '';
                    if (self.isNotificationFreeGift(promocode)) {
                        var old_gift_info = _.find(self.old_free_gifts, function (old_free_gift) {
                            return old_free_gift.promotion_id === promo_code.promocodeid;
                        });
                        var current_gift_info = _.find(elegible_free_gifts, function (free_gift) {
                            return free_gift.promotion_id === promo_code.promocodeid;
                        });
                        var free_gift_id = void 0;
                        if ((!!old_gift_info || !!current_gift_info) &&
                            !(!!old_gift_info &&
                                !!current_gift_info &&
                                old_gift_info.added_quantity === current_gift_info.added_quantity)) {
                            free_gift_id = old_gift_info ?
                                old_gift_info.eligible_items[0] :
                                current_gift_info.eligible_items[0];
                            promocode.notification = true;
                            promocode.freegiftinfo = [old_gift_info, current_gift_info];
                            promocode.freegiftname = ModelsInit.session.getItemFieldValues('typeahead', [free_gift_id.item_id]).items[0].storedisplayname2;
                        }
                    } else if (promo_code.applicability_status !== 'NOT_AVAILABLE' &&
                        !!self.old_promocodes) {
                        var old_promocode = self.old_promocodes ?
                            _.find(self.old_promocodes, function (old_promo_code) {
                                return old_promo_code.internalid === promo_code.internalid;
                            }) :
                            '';
                        if (!old_promocode ||
                            old_promocode.applicability_status !==
                            promo_code.applicability_status ||
                            (!promo_code.is_auto_applied &&
                                promo_code.applicability_reason !==
                                old_promocode.applicability_reason)) {
                            promocode.notification = true;
                        }
                    }
                    result.push(promocode);
                });
                delete this.old_promocodes;
                delete this.old_free_gifts;
            }
            return result;
        },
        isNotificationFreeGift: function isNotificationFreeGift(promocode) {
            if (promocode.type === 'FREEGIFT' && !!this.old_free_gifts) {
                if (promocode.applicabilitystatus === 'APPLIED') {
                    return true;
                }
                if (promocode.applicabilitystatus === 'NOT_APPLIED' &&
                    promocode.applicabilityreason === 'NO_FREE_GIFTS_ADDED') {
                    var old_gift_info = _.find(this.old_free_gifts, function (old_free_gift) {
                        return old_free_gift.promotion_id === promocode.promocodeid;
                    });
                    if (!!old_gift_info && old_gift_info.applicability_status === 'APPLIED') {
                        return true;
                    }
                }
            }
            return false;
        },
        // @method getAutomaticallyRemovedPromocodes
        // @param {Object} order_fields
        // @return {Array<LiveOrder.Model.PromoCode>}
        getAutomaticallyRemovedPromocodes: function getAutomaticallyRemovedPromocodes(current_order) {
            var latest_promocodes = _.pluck(_.where(ModelsInit.order.getFieldValues(['promocodes']).promocodes, {
                isvalid: 'T'
            }), 'promocode');
            var current_promocodes = _.pluck(_.where(current_order.promocodes, {
                isvalid: true
            }), 'code');
            var removed_promocodes = _.difference(current_promocodes, latest_promocodes);
            return _.filter(current_order.promocodes, function (promocode) {
                return _.indexOf(removed_promocodes, promocode.code) >= 0;
            });
        },
        // @method setPromoCodes
        // @param {LiveOrder.Model.Data} data Received data from the service
        // @param {LiveOrder.Model.Data} current_order Returned data
        // @param current_order
        setPromoCodes: function setPromoCodes(data, current_order) {
            var self = this;
            var only_in_current_order = _.filter(current_order.promocodes, function (promocode) {
                return !_.findWhere(data.promocodes, {
                    code: promocode.code
                });
            });
            var only_in_data = _.filter(data.promocodes, function (promocode) {
                return !_.findWhere(current_order.promocodes, {
                    code: promocode.code
                });
            });
            if (!_.isEmpty(only_in_current_order)) {
                this.removeAllPromocodes(only_in_current_order);
            }
            data.promocodes = data.promocodes || [];
            var valid_promocodes = _.filter(only_in_data, function (promocode) {
                return promocode.isvalid !== false;
            });
            if (!Configuration.get('promocodes.allowMultiples', true) &&
                valid_promocodes.length > 1) {
                valid_promocodes = [valid_promocodes[0]];
            } else {
                valid_promocodes = only_in_data;
            }
            _.each(valid_promocodes, function (promo) {
                if (promo.code) {
                    promo.code = promo.code.trim();
                }
                try {
                    self.addPromotion(promo.code);
                } catch (e) {
                    var order_fields = self.getFieldValues();
                    var promos = self.getPromoCodes(order_fields);
                    var is_in_current_order = !!_.find(promos, function (p) {
                        return promo.code === p.code;
                    });
                    // The error for this promocode will be in the information of the promocodes on the order with isvalid = F
                    // Otherwise, it will be thrown as an exception so that the user knows what is going on
                    if (!is_in_current_order) {
                        throw e;
                    }
                }
            });
        },
        addPromotion: function addPromotion(promo_code) {
            ModelsInit.order.applyPromotionCode(promo_code);
        },
        // @method getMultiShipMethods
        // @param {Array<LiveOrder.Model.Line>} lines
        getMultiShipMethods: function getMultiShipMethods(lines) {
            // Get multi ship methods
            var multishipmethods = {};
            _.each(lines, function (line) {
                if (line.shipaddress) {
                    multishipmethods[line.shipaddress] = multishipmethods[line.shipaddress] || [];
                    multishipmethods[line.shipaddress].push(line.internalid);
                }
            });
            _.each(_.keys(multishipmethods), function (address) {
                var methods = ModelsInit.order.getAvailableShippingMethods(multishipmethods[address], address);
                _.each(methods, function (method) {
                    method.internalid = method.shipmethod;
                    method.rate_formatted = Utils.formatCurrency(method.rate);
                    delete method.shipmethod;
                });
                multishipmethods[address] = methods;
            });
            return multishipmethods;
        },
        // @method getShipMethodsOnly returns only the ship methods of the order without requesting unnecessary data
        // @return {Array<OrderShipMethod>}
        getShipMethodsOnly: function getShipMethodsOnly() {
            var field_values = this.getFieldValues({
                keys: ['shipmethods'],
                items: []
            });
            return this.getShipMethods(field_values);
        },
        // @method getShipMethods
        // @param {Array<String>} order_fields
        // @returns {Array<OrderShipMethod>}
        getShipMethods: function getShipMethods(order_fields) {
            var shipmethods = _.map(order_fields.shipmethods, function (shipmethod) {
                var rate = Utils.toCurrency(shipmethod.rate.replace(/^\D+/g, '')) || 0;
                return {
                    internalid: shipmethod.shipmethod,
                    name: shipmethod.name,
                    shipcarrier: shipmethod.shipcarrier,
                    rate: rate,
                    rate_formatted: shipmethod.rate
                };
            });
            return shipmethods;
        },
        // @method getLinesSort
        // @returns {Array<String>}
        getLinesSort: function getLinesSort() {
            return ModelsInit.context.getSessionObject('lines_sort') ?
                ModelsInit.context.getSessionObject('lines_sort').split(',') : [];
        },
        // @method getPaymentMethodsOnly returns only the payment methods of the order without requesting unnecessary data
        // @return {Array<ShoppingSession.PaymentMethod>}
        getPaymentMethodsOnly: function getPaymentMethodsOnly() {
            var field_values = this.getFieldValues({
                keys: ['payment'],
                items: []
            });
            return this.getPaymentMethods(field_values);
        },
        // @method getPaymentMethods
        // @param {Array<String>} order_fields
        // @returns {Array<ShoppingSession.PaymentMethod>}
        getPaymentMethods: function getPaymentMethods(order_fields) {
            var paymentmethods = [];
            var giftcertificates = ModelsInit.order.getAppliedGiftCertificates();
            var payment = order_fields && order_fields.payment;
            var paypal = payment &&
                _.findWhere(ModelsInit.session.getPaymentMethods(), {
                    ispaypal: 'T'
                });
            var credit_card = payment && payment.creditcard;
            if (credit_card &&
                credit_card.paymentmethod &&
                credit_card.paymentmethod.creditcard === 'T') {
                // Main
                paymentmethods.push({
                    type: 'creditcard',
                    primary: true,
                    creditcard: {
                        internalid: credit_card.internalid || '-temporal-',
                        ccnumber: credit_card.ccnumber,
                        ccname: credit_card.ccname,
                        ccexpiredate: credit_card.expmonth + '/' + credit_card.expyear,
                        ccsecuritycode: credit_card.ccsecuritycode,
                        expmonth: credit_card.expmonth,
                        expyear: credit_card.expyear,
                        paymentmethod: {
                            internalid: credit_card.paymentmethod.internalid,
                            name: credit_card.paymentmethod.name,
                            creditcard: credit_card.paymentmethod.creditcard === 'T',
                            ispaypal: credit_card.paymentmethod.ispaypal === 'T',
                            isexternal: credit_card.paymentmethod.isexternal === 'T',
                            key: credit_card.paymentmethod.key,
                            iscardholderauthenticationsupported: credit_card.paymentmethod.iscardholderauthenticationsupported
                        }
                    }
                });
            } else if (paypal && payment.paymentmethod === paypal.internalid) {
                paymentmethods.push({
                    type: 'paypal',
                    primary: true,
                    complete: ModelsInit.context.getSessionObject('paypal_complete') === 'T',
                    internalid: paypal.internalid,
                    name: paypal.name,
                    creditcard: paypal.creditcard === 'T',
                    ispaypal: paypal.ispaypal === 'T',
                    isexternal: paypal.isexternal === 'T',
                    key: paypal.key
                });
            } else if (credit_card &&
                credit_card.paymentmethod &&
                credit_card.paymentmethod.isexternal === 'T') {
                paymentmethods.push({
                    type: 'external_checkout_' + credit_card.paymentmethod.key,
                    primary: true,
                    internalid: credit_card.paymentmethod.internalid,
                    name: credit_card.paymentmethod.name,
                    creditcard: credit_card.paymentmethod.creditcard === 'T',
                    ispaypal: credit_card.paymentmethod.ispaypal === 'T',
                    isexternal: credit_card.paymentmethod.isexternal === 'T',
                    key: credit_card.paymentmethod.key,
                    errorurl: payment.errorurl,
                    thankyouurl: payment.thankyouurl
                });
            } else if (order_fields.payment && order_fields.payment.paymentterms === 'Invoice') {
                var customer_invoice = ModelsInit.customer.getFieldValues([
                    'paymentterms',
                    'creditlimit',
                    'balance',
                    'creditholdoverride'
                ]);
                paymentmethods.push({
                    type: 'invoice',
                    primary: true,
                    paymentterms: customer_invoice.paymentterms,
                    creditlimit: parseFloat(customer_invoice.creditlimit || 0),
                    creditlimit_formatted: Utils.formatCurrency(customer_invoice.creditlimit),
                    balance: parseFloat(customer_invoice.balance || 0),
                    balance_formatted: Utils.formatCurrency(customer_invoice.balance),
                    creditholdoverride: customer_invoice.creditholdoverride
                });
            }
            if (giftcertificates && giftcertificates.length) {
                _.forEach(giftcertificates, function (giftcertificate) {
                    paymentmethods.push({
                        type: 'giftcertificate',
                        giftcertificate: {
                            code: giftcertificate.giftcertcode,
                            amountapplied: Utils.toCurrency(giftcertificate.amountapplied || 0),
                            amountapplied_formatted: Utils.formatCurrency(giftcertificate.amountapplied || 0),
                            amountremaining: Utils.toCurrency(giftcertificate.amountremaining || 0),
                            amountremaining_formatted: Utils.formatCurrency(giftcertificate.amountremaining || 0),
                            originalamount: Utils.toCurrency(giftcertificate.originalamount || 0),
                            originalamount_formatted: Utils.formatCurrency(giftcertificate.originalamount || 0)
                        }
                    });
                });
            }
            return paymentmethods;
        },
        // @method getTransactionBodyField
        // @returns {Object}
        getTransactionBodyField: function getTransactionBodyField() {
            var options = {};
            if (this.isSecure) {
                var fieldsIdToBeExposed_1 = CustomFieldsUtils.getCustomFieldsIdToBeExposed('salesorder');
                _.each(ModelsInit.order.getCustomFieldValues(), function (option) {
                    // expose the custom field value if was configured in the backend configuration
                    if (_.find(fieldsIdToBeExposed_1, function (fieldIdToBeExposed) {
                            return option.name === fieldIdToBeExposed;
                        })) {
                        options[option.name] =
                            option.value.indexOf(String.fromCharCode(5)) !== -1 ?
                            option.value.split(String.fromCharCode(5)) :
                            option.value;
                    }
                });
            }
            return options;
        },
        // @method getAddresses
        // @param {Array<String>} order_fields
        // @returns {Array<OrderAddress>}
        getAddresses: function getAddresses(order_fields) {
            var self = this;
            var addresses = {};
            var address_book = ModelsInit.session.isLoggedIn2() && this.isSecure ?
                ModelsInit.customer.getAddressBook() : [];
            address_book = _.object(_.pluck(address_book, 'internalid'), address_book);
            // General Addresses
            if (order_fields.ismultishipto === 'T') {
                _.each(order_fields.items || [], function (line) {
                    if (line.shipaddress && !addresses[line.shipaddress]) {
                        self.addAddress(address_book[line.shipaddress], addresses);
                    }
                });
            } else {
                this.addAddress(order_fields.shipaddress, addresses);
            }
            this.addAddress(order_fields.billaddress, addresses);
            return _.values(addresses);
        },
        // @method getLines Set Order Lines into the result. Standardizes the result of the lines
        // @param {Object} order_fields
        // @returns {Array<LiveOrder.Model.Line>}
        getLines: function getLines(order_fields) {
            var lines = [];
            if (order_fields.items && order_fields.items.length) {
                var self_1 = this;
                var items_to_preload_1 = [];
                var address_book_1 = ModelsInit.session.isLoggedIn2() && this.isSecure ?
                    ModelsInit.customer.getAddressBook() : [];
                var item_ids_to_clean_1 = [];
                var free_gifts_1 = this.getEligibleFreeGifts();
                var non_available_items_1 = this.nonAvailableItems();
                address_book_1 = _.object(_.pluck(address_book_1, 'internalid'), address_book_1);
                _.each(order_fields.items, function (original_line) {
                    // Total may be 0
                    var total = original_line.promotionamount ?
                        Utils.toCurrency(original_line.promotionamount) :
                        Utils.toCurrency(original_line.amount);
                    var discount = Utils.toCurrency(original_line.promotiondiscount) || 0;
                    var line_to_add;
                    // @class LiveOrder.Model.Line represents a line in the LiveOrder
                    line_to_add = {
                        // @property {String} internalid
                        internalid: original_line.orderitemid,
                        // @property {Number} quantity
                        quantity: original_line.quantity,
                        // @property {Number} rate
                        rate: parseFloat(original_line.rate),
                        // @property {String} rate_formatted
                        rate_formatted: Utils.formatCurrency(original_line.rate),
                        // @property {Number} amount
                        amount: Utils.toCurrency(original_line.amount),
                        // @property {String} tax_rate1
                        tax_rate1: original_line.taxrate1,
                        // @property {String} tax_type1
                        tax_type1: original_line.taxtype1,
                        // @property {String} tax_rate2
                        tax_rate2: original_line.taxrate2,
                        // @property {String} tax_type2
                        tax_type2: original_line.taxtype2,
                        // @property {Number} tax1_amount
                        tax1_amount: original_line.tax1amt,
                        // @property {String} tax1_amount_formatted
                        tax1_amount_formatted: Utils.formatCurrency(original_line.tax1amt),
                        // @property {Number} discount
                        discount: discount,
                        promotion_discount: original_line.promotionamount,
                        // @property {Number} total
                        total: total,
                        // @property {String} item internal id of the line's item
                        item: original_line.internalid,
                        // @property {String} itemtype
                        itemtype: original_line.itemtype,
                        // @property {Array<LiveOrder.Model.Line.Option>} options
                        options: self_1.parseLineOptionsFromCommerceAPI(original_line.options),
                        // @property {OrderAddress} shipaddress
                        shipaddress: original_line.shipaddress,
                        // @property {OrderShipMethod} shipmethod
                        shipmethod: original_line.shipmethod,
                        // @property {Boolean} free_gift
                        free_gift: !!original_line.freegiftpromotionid,
                        // @property {Array<DiscountsImpact>} discounts_impact
                        discounts_impact: original_line.discounts_impact
                    };
                    if (self_1.isPickupInStoreEnabled && original_line.fulfillmentPreferences) {
                        // @property {Number} location
                        line_to_add.location =
                            original_line.fulfillmentPreferences.pickupLocationId;
                        // @property {String} fulfillmentChoice
                        line_to_add.fulfillmentChoice =
                            original_line.fulfillmentPreferences.fulfillmentChoice;
                    }
                    if (line_to_add.free_gift === true) {
                        var gift_info = _.find(free_gifts_1, function (free_gift) {
                            return (free_gift.promotion_id.toString() ===
                                line_to_add.discounts_impact.discounts[0].promotion_id.toString());
                        });
                        line_to_add.free_gift_info = gift_info;
                    }
                    if (line_to_add.shipaddress && !address_book_1[line_to_add.shipaddress]) {
                        line_to_add.shipaddress = null;
                        line_to_add.shipmethod = null;
                        item_ids_to_clean_1.push(line_to_add.internalid);
                    } else {
                        items_to_preload_1.push({
                            id: original_line.internalid,
                            type: original_line.itemtype
                        });
                    }
                    lines.push(line_to_add);
                });
                if (item_ids_to_clean_1.length) {
                    ModelsInit.order.setItemShippingAddress(item_ids_to_clean_1, null);
                    ModelsInit.order.setItemShippingMethod(item_ids_to_clean_1, null);
                }
                var restart_1 = false;
                StoreItem.preloadItems(items_to_preload_1);
                lines.forEach(function (line) {
                    line.item = StoreItem.get(line.item, line.itemtype);
                    if (!line.item) {
                        self_1.removeLine(line.internalid);
                        restart_1 = true;
                    } else {
                        line.item.noLongerAvailable = _.contains(non_available_items_1, line.item.internalid);
                        line.rate_formatted = Utils.formatCurrency(line.rate);
                        line.amount_formatted = Utils.formatCurrency(line.amount);
                        line.tax_amount_formatted = Utils.formatCurrency(line.tax_amount);
                        line.discount_formatted = Utils.formatCurrency(line.discount);
                        line.total_formatted = Utils.formatCurrency(line.total);
                    }
                });
                if (restart_1) {
                    throw {
                        code: 'ERR_CHK_ITEM_NOT_FOUND'
                    };
                }
                // Sort the items in the order they were added, this is because the update operation alters the order
                var lines_sort_1 = this.getLinesSort();
                if (lines_sort_1.length) {
                    lines = _.sortBy(lines, function (line) {
                        return _.indexOf(lines_sort_1, line.internalid);
                    });
                } else {
                    this.setLinesSort(_.pluck(lines, 'internalid'));
                }
            }
            return lines;
        },
        // @method getLinesOnly returns only the lines of the order without requesting unnecessary data
        // @return {Array<LiveOrder.Model.Line>}
        getLinesOnly: function getLinesOnly() {
            var field_values = this.getFieldValues({
                keys: [],
                items: null
            });
            return this.getLines(field_values);
        },
        // @method getSummary gives the summary of the order requesting only the needed data
        // @return {Object} An object containing the summary
        getSummary: function getSummary() {
            var summary = this.getFieldValues({
                keys: ['summary'],
                items: []
            }).summary;
            return _.clone(summary);
        },
        // @method parseLineOptionsToCommerceAPI Given the list of options from he Front-end it parsed to the particular CommerceAPI format
        // @param {Array<LiveOrder.Model.Line.Option>} options
        // @return {Object} An object used as a dictionary where each key is the cart option id and the values are the option's value internalid
        parseLineOptionsToCommerceAPI: function parseLineOptionsToCommerceAPI(options) {
            var result = {};
            _.each(options || [], function (option) {
                if (option && option.value && option.cartOptionId) {
                    result[option.cartOptionId] = option.value.internalid;
                }
            });
            return result;
        },
        // @method parseLineOptionsFromCommerceAPI
        // @param {Array<CommerceAPI.LineOption>} options
        // @return {Array<LiveOrder.Model.Line.Option>}
        parseLineOptionsFromCommerceAPI: function parseLineOptionsFromCommerceAPI(options) {
            // @class CommerceAPI.LineOption
            // @property {String} displayvalue
            // @property {String} id
            // @property {String} name
            // @property {String} value
            return _.map(options, function (option) {
                var option_label = Utils.trim(option.name);
                option_label = Utils.stringEndsWith(option_label, ':') ?
                    option_label.substr(0, option_label.length - 1) :
                    option_label;
                // @class LiveOrder.Model.Line.Option
                return {
                    // @property {LiveOrder.Model.Line.Option.Value} value
                    // @class LiveOrder.Model.Line.Option.Value
                    value: {
                        // @property {String} label Name of the value selected in case of select or the entered string
                        label: option.displayvalue,
                        // @property {String} internalid
                        internalid: option.value
                    },
                    // @class LiveOrder.Model.Line.Option
                    // @property {String} cartOptionId
                    cartOptionId: option.id.toLowerCase(),
                    // @property {String} label
                    label: option_label
                };
            });
            // @class LiveOrder.Model
        },
        // @method parseLineOptionsFromSuiteScript
        // @param {String} options
        parseLineOptionsFromSuiteScript: function parseLineOptionsFromSuiteScript(options_string) {
            var options_object = [];
            if (options_string && options_string !== '- None -') {
                var split_char_3_1 = String.fromCharCode(3);
                var split_char_4 = String.fromCharCode(4);
                _.each(options_string.split(split_char_4), function (option_line) {
                    option_line = option_line.split(split_char_3_1);
                    // @class Transaction.Model.Get.Line.Option
                    options_object.push({
                        // @property {String} cartOptionId
                        cartOptionId: option_line[0].toLowerCase(),
                        // @property {String} label
                        label: option_line[2],
                        // @property {Transaction.Model.Get.Line.Option.Value} value
                        value: {
                            // @class Transaction.Model.Get.Line.Option.Value
                            // @property {String} label
                            label: option_line[4],
                            // @property {String} internalid
                            internalid: option_line[3]
                        },
                        // @class Transaction.Model.Get.Line.Option
                        // @property {Boolean} mandatory
                        ismandatory: option_line[1] === 'T'
                    });
                });
            }
            // @class LiveOrder.Model
            return options_object;
        },
        // @method getIsMultiShipTo @param {Array<String>} order_fields @returns {Boolean}
        getIsMultiShipTo: function getIsMultiShipTo(order_fields) {
            return this.isMultiShippingEnabled && order_fields.ismultishipto === 'T';
        },
        // @method setLinesSort
        // @param {String} lines_sort
        // @returns {String}
        setLinesSort: function setLinesSort(lines_sort) {
            return ModelsInit.context.setSessionObject('lines_sort', lines_sort || []);
        },
        // @method setBillingAddressOnly gets only the shipaddress of the order without requesting unnecessary data
        setBillingAddressOnly: function setBillingAddressOnly(data) {
            var field_values = this.getFieldValues({
                keys: ['billaddress'],
                items: []
            });
            return this.setBillingAddress(data, field_values);
        },
        // @method setBillingAddress
        // @param data
        // @param {LiveOrder.Model.Data} current_order
        setBillingAddress: function setBillingAddress(data, current_order) {
            if (data.sameAs) {
                data.billaddress = data.shipaddress;
            }
            if (data.billaddress !== current_order.billaddress) {
                if (data.billaddress) {
                    if (data.billaddress && !~data.billaddress.indexOf('null')) {
                        // Heads Up!: This "new String" is to fix a nasty bug
                        ModelsInit.order.setBillingAddress(new String(data.billaddress).toString());
                    }
                } else if (this.isSecure) {
                    ModelsInit.order.removeBillingAddress();
                }
            }
        },
        // @method setShippingAddressAndMethod
        // @param {LiveOrder.Model.Data} data
        // @param current_order
        setShippingAddressAndMethod: function setShippingAddressAndMethod(data, current_order) {
            var current_package;
            var packages = {};
            var item_ids_to_clean = [];
            var original_line;
            _.each(data.lines, function (line) {
                original_line = _.find(current_order.lines, function (order_line) {
                    return order_line.internalid === line.internalid;
                });
                if (original_line &&
                    original_line.item &&
                    original_line.item.isfulfillable !== false &&
                    (original_line.shipaddress !== line.shipaddress ||
                        original_line.shipmethod !== line.shipmethod)) {
                    if (line.shipaddress) {
                        packages[line.shipaddress] = packages[line.shipaddress] || {
                            shipMethodId: null,
                            itemIds: []
                        };
                        packages[line.shipaddress].itemIds.push(line.internalid);
                        if (!packages[line.shipaddress].shipMethodId && line.shipmethod) {
                            packages[line.shipaddress].shipMethodId = line.shipmethod;
                        }
                    } else {
                        item_ids_to_clean.push(line.internalid);
                    }
                }
            });
            // CLEAR Shipping address and shipping methods
            if (item_ids_to_clean.length) {
                ModelsInit.order.setItemShippingAddress(item_ids_to_clean, null);
                ModelsInit.order.setItemShippingMethod(item_ids_to_clean, null);
            }
            // SET Shipping address and shipping methods
            _.each(_.keys(packages), function (address_id) {
                current_package = packages[address_id];
                ModelsInit.order.setItemShippingAddress(current_package.itemIds, parseInt(address_id, 10));
                if (current_package.shipMethodId) {
                    ModelsInit.order.setItemShippingMethod(current_package.itemIds, parseInt(current_package.shipMethodId, 10));
                }
            });
        },
        // @method setShippingAddressOnly gets only the shipaddress of the order without requesting unnecessary data
        setShippingAddressOnly: function setShippingAddressOnly(data) {
            var field_values = this.getFieldValues({
                keys: ['shipaddress'],
                items: []
            });
            return this.setShippingAddress(data, field_values);
        },
        // @method setShippingAddress
        // @param {LiveOrder.Model.Data} data
        // @param current_order
        setShippingAddress: function setShippingAddress(data, current_order) {
            if (data.shipaddress !== current_order.shipaddress) {
                if (data.shipaddress) {
                    if (this.isSecure && !~data.shipaddress.indexOf('null')) {
                        // Heads Up!: This "new String" is to fix a nasty bug
                        ModelsInit.order.setShippingAddress(new String(data.shipaddress).toString());
                    } else {
                        this.estimateShippingCost(data);
                    }
                } else if (this.isSecure) {
                    if (this.isSuiteTaxEnabled) {
                        // Issue 541650: If you don't have SuiteTax enabled and you remove
                        // the shipping address, it triggers a tax calculation which in turn
                        // removes all the items in the cart
                        ModelsInit.order.removeShippingAddress();
                    } else {
                        ModelsInit.order.estimateShippingCost({
                            zip: null,
                            country: null
                        });
                    }
                } else {
                    this.removeEstimateShippingCost();
                }
            }
        },
        estimateShippingCost: function estimateShippingCost(data) {
            var address = _.find(data.addresses, function (address) {
                return address.internalid === data.shipaddress;
            });
            address && ModelsInit.order.estimateShippingCost(address);
        },
        removeEstimateShippingCost: function removeEstimateShippingCost() {
            ModelsInit.order.estimateShippingCost({
                zip: null,
                country: null
            });
            ModelsInit.order.removeShippingMethod();
        },
        // @method setPurchaseNumber
        // @param {LiveOrder.Model.Data} data
        setPurchaseNumber: function setPurchaseNumber(data) {
            if (ModelsInit.session.isLoggedIn2()) {
                if (data && data.purchasenumber) {
                    ModelsInit.order.setPurchaseNumber(data.purchasenumber);
                } else {
                    ModelsInit.order.removePurchaseNumber();
                }
            }
        },
        // @method setPaymentMethods
        // @param {LiveOrder.Model.Data} data
        setPaymentMethods: function setPaymentMethods(data) {
            // Because of an api issue regarding Gift Certificates, we are going to handle them separately
            var gift_certificate_methods = _.where(data.paymentmethods, {
                type: 'giftcertificate'
            });
            var non_certificate_methods = _.difference(data.paymentmethods, gift_certificate_methods);
            // Payment Methods non gift certificate
            if (this.isSecure &&
                non_certificate_methods &&
                non_certificate_methods.length &&
                ModelsInit.session.isLoggedIn2()) {
                _.each(non_certificate_methods, function (paymentmethod) {
                    if (paymentmethod.type === 'creditcard' && paymentmethod.creditcard) {
                        var credit_card = paymentmethod.creditcard;
                        var require_cc_security_code = ModelsInit.session.getSiteSettings(['checkout']).checkout
                            .requireccsecuritycode === 'T';
                        var cc_obj = credit_card && {
                            ccnumber: credit_card.ccnumber,
                            ccname: credit_card.ccname,
                            ccexpiredate: credit_card.ccexpiredate,
                            expmonth: credit_card.expmonth,
                            expyear: credit_card.expyear,
                            paymentmethod: {
                                internalid: credit_card.paymentmethod.internalid ||
                                    credit_card.paymentmethod,
                                name: credit_card.paymentmethod.name,
                                creditcard: credit_card.paymentmethod.creditcard ? 'T' : 'F',
                                ispaypal: credit_card.paymentmethod.ispaypal ? 'T' : 'F',
                                key: credit_card.paymentmethod.key
                            }
                        };
                        if (credit_card.internalid !== '-temporal-') {
                            cc_obj.internalid = credit_card.internalid;
                        } else {
                            cc_obj.internalid = null;
                            cc_obj.savecard = 'F';
                        }
                        if (credit_card.ccsecuritycode) {
                            cc_obj.ccsecuritycode = credit_card.ccsecuritycode;
                        }
                        if (!require_cc_security_code ||
                            (require_cc_security_code && credit_card.ccsecuritycode)) {
                            // the user's default credit card may be expired so we detect this using try & catch and if it is we remove the payment methods.
                            try {
                                // if the credit card is not temporal or it is temporal and the number is complete then set payment method.
                                if (cc_obj.internalid ||
                                    (!cc_obj.internalid && !~cc_obj.ccnumber.indexOf('*'))) {
                                    ModelsInit.order.removePayment();
                                    var cc_parameter = {
                                        paymentterms: 'CreditCard',
                                        creditcard: {
                                            internalid: cc_obj.internalid,
                                            ccsecuritycode: cc_obj.ccsecuritycode,
                                            paymentmethod: {
                                                internalid: cc_obj.paymentmethod.internalid
                                            }
                                        }
                                    };
                                    if (!cc_obj.internalid) {
                                        cc_parameter.creditcard.ccnumber = cc_obj.ccnumber;
                                        cc_parameter.creditcard.ccname = cc_obj.ccname;
                                        cc_parameter.creditcard.expmonth = cc_obj.expmonth;
                                        cc_parameter.creditcard.expyear = cc_obj.expyear;
                                        cc_parameter.creditcard.savecard = cc_obj.savecard;
                                    }
                                    ModelsInit.order.setPayment(cc_parameter);
                                    ModelsInit.context.setSessionObject('paypal_complete', 'F');
                                }
                            } catch (e) {
                                if (e && e.code && e.code === 'ERR_WS_INVALID_PAYMENT') {
                                    ModelsInit.order.removePayment();
                                }
                                throw e;
                            }
                        }
                        // if the the given credit card don't have a security code and it is required we just remove it from the order
                        else if (require_cc_security_code && !credit_card.ccsecuritycode) {
                            ModelsInit.order.removePayment();
                        }
                    } else if (paymentmethod.type === 'invoice') {
                        ModelsInit.order.removePayment();
                        try {
                            ModelsInit.order.setPayment({
                                paymentterms: 'Invoice'
                            });
                        } catch (e) {
                            if (e && e.code && e.code === 'ERR_WS_INVALID_PAYMENT') {
                                ModelsInit.order.removePayment();
                            }
                            throw e;
                        }
                        ModelsInit.context.setSessionObject('paypal_complete', 'F');
                    } else if (paymentmethod.type === 'paypal') {
                        if (ModelsInit.context.getSessionObject('paypal_complete') !== 'T') {
                            ModelsInit.order.removePayment();
                            var paypal = _.findWhere(ModelsInit.session.getPaymentMethods(), {
                                ispaypal: 'T'
                            });
                            paypal &&
                                ModelsInit.order.setPayment({
                                    paymentterms: '',
                                    paymentmethod: paypal.key
                                });
                        }
                    } else if (paymentmethod.type &&
                        ~paymentmethod.type.indexOf('external_checkout')) {
                        ModelsInit.order.removePayment();
                        ModelsInit.order.setPayment({
                            paymentmethod: paymentmethod.key,
                            thankyouurl: paymentmethod.thankyouurl,
                            errorurl: paymentmethod.errorurl,
                            merchantid: paymentmethod.merchantid
                        });
                    } else {
                        ModelsInit.order.removePayment();
                    }
                });
            } else if (this.isSecure && ModelsInit.session.isLoggedIn2()) {
                ModelsInit.order.removePayment();
            }
            gift_certificate_methods = _.map(gift_certificate_methods, function (gift_certificate) {
                return gift_certificate.giftcertificate;
            });
            this.setGiftCertificates(gift_certificate_methods);
        },
        // @method setGiftCertificates
        // @param {Array<Object>} gift_certificates
        setGiftCertificates: function setGiftCertificates(gift_certificates) {
            // Remove all gift certificates so we can re-enter them in the appropriate order
            ModelsInit.order.removeAllGiftCertificates();
            _.forEach(gift_certificates, function (gift_certificate) {
                ModelsInit.order.applyGiftCertificate(gift_certificate.code);
            });
        },
        // @method setShippingMethodOnly gets only the shipmethod of the order without requesting unnecessary data
        setShippingMethodOnly: function setShippingMethodOnly(data) {
            var field_values = this.getFieldValues({
                keys: ['shipmethod', 'shipmethods'],
                items: []
            });
            var shipping_methods = this.getShipMethods(field_values);
            var order_fields = {
                shipmethods: shipping_methods,
                shipmethod: field_values.shipmethod
            };
            return this.setShippingMethod(data, order_fields);
        },
        // @method setShippingMethod
        // @param {LiveOrder.Model.Data} data
        // @param current_order
        setShippingMethod: function setShippingMethod(data, current_order) {
            if ((!this.isMultiShippingEnabled || !data.ismultishipto) &&
                this.isSecure &&
                data.shipmethod !== current_order.shipmethod) {
                var shipmethod = _.findWhere(current_order.shipmethods, {
                    internalid: data.shipmethod
                });
                if (shipmethod) {
                    ModelsInit.order.setShippingMethod({
                        shipmethod: shipmethod.internalid,
                        shipcarrier: shipmethod.shipcarrier
                    });
                } else {
                    ModelsInit.order.removeShippingMethod();
                }
            }
        },
        // @method setTermsAndConditions
        // @param {LiveOrder.Model.Data} data
        setTermsAndConditions: function setTermsAndConditions(data) {
            var require_terms_and_conditions = ModelsInit.session.getSiteSettings(['checkout'])
                .checkout.requiretermsandconditions;
            if (require_terms_and_conditions.toString() === 'T' &&
                this.isSecure &&
                !_.isUndefined(data.agreetermcondition) &&
                ModelsInit.session.isLoggedIn2()) {
                ModelsInit.order.setTermsAndConditions(data.agreetermcondition);
            }
        },
        // @method setTransactionBodyField
        // @param {LiveOrder.Model.Data} data
        setTransactionBodyField: function setTransactionBodyField(data) {
            // Transaction Body Field
            if (this.isSecure && !_.isEmpty(data.options) && ModelsInit.session.isLoggedIn2()) {
                _.each(data.options, function (value, key) {
                    if (Array.isArray(value)) {
                        data.options[key] = value.join(String.fromCharCode(5));
                    }
                });
                ModelsInit.order.setCustomFieldValues(data.options);
            }
        },
        getOptionByCartOptionId: function getOptionByCartOptionId(options, cart_option_id) {
            return _.findWhere(options, {
                cartOptionId: cart_option_id
            });
        },
        // @method process3DSecure. 3D Secure is a second factor authentication.
        // Can apply to Visa, MasterCard, JCB International and American Express.
        // @return {Object} Result of order submit operation ({status, internalid, confirmationnumber})
        process3DSecure: function process3DSecure() {
            if (this.isCardHolderAuthenticationSupported) {
                var cardHolderAuthenticationRecord = CardHolderAuthentication.searchById(CardHolderAuthentication.create(this.authenticationOptions));
                ModelsInit.context.setSessionObject('cardHolderAuthenticationRecordId', cardHolderAuthenticationRecord.id);
                switch (cardHolderAuthenticationRecord.getValue('status')) {
                    case 'AUTHENTICATED':
                        ModelsInit.context.setSessionObject('cardHolderAuthenticationRecordId', null);
                        var confirmation_1 = ModelsInit.order.submit();
                        if (confirmation_1.statuscode === 'error') {
                            throw confirmation_1;
                        } else {
                            confirmation_1 = _.extend(this.getConfirmation(confirmation_1.internalid), confirmation_1);
                        }
                        return confirmation_1;
                    case 'WAITING_FOR_DEVICE_AUTHENTICATION':
                        var deviceAuthenticationFormURL = ModelsInit.session.getAbsoluteUrl2('checkout', CardHolderAuthenticationUtils.getUrl('../', 'deviceAuthenticationForm', cardHolderAuthenticationRecord.getValue('authenticatedeviceformaction'), cardHolderAuthenticationRecord.getValue('authenticatedeviceformid'), CardHolderAuthentication.searchAuthenticateDeviceInputFields(cardHolderAuthenticationRecord.id)));
                        var orderConfirmation = {
                            statuscode: 'error',
                            reasoncode: 'ERR_WS_REQ_DEVICE_AUTHENTICATION',
                            cardholderauthenticationid: cardHolderAuthenticationRecord.id,
                            authenticationformaction: deviceAuthenticationFormURL
                        };
                        return orderConfirmation;
                    case 'WAITING_FOR_SHOPPER_CHALLENGE':
                        var challengeShopperFormURL = ModelsInit.session.getAbsoluteUrl2('checkout', CardHolderAuthenticationUtils.getUrl('../', 'challengeShopperForm', cardHolderAuthenticationRecord.getValue('challengeshopperformaction'), cardHolderAuthenticationRecord.getValue('challengeshopperformid'), CardHolderAuthentication.searchChallengeShopperInputFields(cardHolderAuthenticationRecord.id)));
                        var orderConfirmation = {
                            statuscode: 'error',
                            reasoncode: 'ERR_WS_REQ_SHOPPER_CHALLENGE',
                            cardholderauthenticationid: cardHolderAuthenticationRecord.id,
                            authenticationformaction: challengeShopperFormURL
                        };
                        return orderConfirmation;
                    default:
                        ModelsInit.context.setSessionObject('cardHolderAuthenticationRecordId', null);
                        throw 'An error has occurred';
                }
            }
            var orderHandlerUrl = ModelsInit.session.getAbsoluteUrl2('checkout', '../threedsecure.ssp');
            var confirmation = ModelsInit.order.submit({
                paymentauthorization: {
                    type: 'threedsecure',
                    noredirect: 'T',
                    termurl: orderHandlerUrl
                }
            });
            if (confirmation.statuscode === 'error') {
                // With 3D Secure, we expect the order.submit() operation returning
                // 'ERR_WS_REQ_PAYMENT_AUTHORIZATION' to continue the flow.
                if (confirmation.reasoncode === 'ERR_WS_REQ_PAYMENT_AUTHORIZATION') {
                    return confirmation;
                }
                throw confirmation;
            } else {
                confirmation = _.extend(this.getConfirmation(confirmation.internalid), confirmation);
            }
            return confirmation;
        },
        getEligibleFreeGifts: function getEligibleFreeGifts() {
            return ModelsInit.order.getEligibleFreeGiftItems();
        },
        storePromosPrevState: function storePromosPrevState() {
            this.old_promocodes = ModelsInit.order.getAppliedPromotionCodes() || {};
            this.old_free_gifts = this.getEligibleFreeGifts();
        }
    });
});