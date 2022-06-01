/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// PaymentInstrument.Model.js
// ----------------
// This file define the functions to be used on Payment Method service
define('PaymentInstrument.Model', ['SC.Model', 'SC.Models.Init', 'underscore'], function(
    SCModel,
    ModelsInit,
    _
) {
    return SCModel.extend({
        name: 'PaymentInstrument',

        validation: {
            ccname: { required: true, msg: 'Name is required' },
            paymentmethod: { required: true, msg: 'Card Type is required' },
            ccnumber: { required: true, msg: 'Card Number is required' },
            expmonth: { required: true, msg: 'Expiration is required' },
            expyear: function(value, name, data) {
                if (data) {
                    const current = new Date();
                    const selected_date = new Date(data.expyear, data.expmonth - 1).getTime();
                    if (!value) {
                        return 'Expiration is required';
                    }
                    if (
                        _.isNaN(selected_date) ||
                        new Date(current.getFullYear(), current.getMonth()).getTime() >
                            selected_date
                    ) {
                        return 'Please select a date in the future';
                    }
                }
            }
        },

        get: function (id) {
            // Return a specific payment instrument
            const payment_instrument = this.list(id);

            if (payment_instrument.length) {
                return payment_instrument[0];
            }

            try {
                // for !preservedonfile cards
                const record = this.getRecord(id);
                if (this.checkForUser(record)) {
                    return this.getRecordFields(record);
                }
                console.error('PaymentInstrument.Model.get failed loading id ' + id);
                return null;
            } catch (e) {
                // This may fail if the payment instrument has been deleted
                console.error(
                    'PaymentInstrument.Model.get failed loading id ' + id,
                    JSON.stringify(e)
                );
                return null;
            }
        },

        getRecordFields: function(record) {
            const result = {};
            // @property {String} internalid
            result.internalid = record.getFieldValue('id');
            // @property {Boolean} isinactive
            result.isinactive = record.getFieldValue('isinactive');
            // @property {Boolean} preserveonfile
            result.preserveonfile = record.getFieldValue('preserveonfile');
            // @property {String} cardexpirationdate
            result.cardexpirationdate =
                record.getFieldValue('expirationdate') ||
                record.getFieldValue('cardexpirationdate');
            // @property {String} recordtype
            result.recordtype = record.getFieldValue('recordtype') || record.getFieldValue('type');
            // @property {String} id
            result.id = record.getFieldValue('id');
            // @property {String} cardlastfourdigits
            result.cardlastfourdigits =
                record.getFieldValue('cardlastfourdigits') ||
                record.getFieldValue('lastfourdigits') ||
                record.getFieldValue('cardnumber');
            // @property {Boolean} isdefault
            result.isdefault = record.getFieldValue('isdefault');
            // @property {Boolean} isdefault
            result.mask = record.getFieldValue('mask');
            // @property {Cardbrand} cardbrand
            result.cardbrand = {
                internalid: record.getFieldValue('cardbrand'),
                name: record.getFieldText('cardbrand')
            };
            // @property {Instrumenttype} instrumenttype
            result.instrumenttype = {
                internalid: record.getFieldValue('instrumenttype'),
                name: record.getFieldText('instrumenttype')
            };
            // @property {State} state
            result.state = {
                internalid: record.getFieldValue('state'),
                name: record.getFieldText('state')
            };
            // @property {Entity} entity
            result.entity = {
                internalid: record.getFieldValue('entity'),
                name: record.getFieldText('entity')
            };
            // @property {Paymentmethod} paymentmethod
            result.paymentmethod = this.getPaymentMethod(
                record.getFieldValue('paymentmethod'),
                record.getFieldText('cardbrand')
            );

            result.ccname =
                record.getFieldValue('nameoncard') || record.getFieldValue('cardnameoncard');

            return result;
        },

        getDefault: function() {
            // Return the  payment instrument that the customer setted to default
            return _.find(this.paymentInstruments, function(payment_instrument) {
                return payment_instrument.ccdefault === 'T';
            });
        },

        list: function(id) {
            // Return all the payment instruments that are not inactive and have types 1 (Credit Card) or 3 (Credit Card Token)
            const filters = [
                new nlobjSearchFilter('customer', null, 'is', nlapiGetUser()),
                new nlobjSearchFilter('preserveOnFile', null, 'is', 'T'),
                new nlobjSearchFilter('isInactive', null, 'is', 'F'),
                new nlobjSearchFilter('paymentinstrumenttype', null, 'anyof', [1, 3])
            ];
            const columns = {
                internalid: new nlobjSearchColumn('internalid'),
                paymentmethod: new nlobjSearchColumn('paymentmethod'),
                mask: new nlobjSearchColumn('mask'),
                default: new nlobjSearchColumn('default'),
                lastfourdigits: new nlobjSearchColumn('lastfourdigits'),
                cardLastFourDigits: new nlobjSearchColumn('cardLastFourDigits'),
                paymentinstrumenttype: new nlobjSearchColumn('paymentinstrumenttype'),
                cardExpDate: new nlobjSearchColumn('cardExpDate'),
                cardTokenExpDate: new nlobjSearchColumn('cardTokenExpDate'),
                nameOnCard: new nlobjSearchColumn('nameOnCard'),
                generalTokenExpirationDate: new nlobjSearchColumn('generalTokenExpirationDate'),
                cardTokenCardExpDate: new nlobjSearchColumn('cardTokenCardExpDate'),
                cardTokenNameOnCard: new nlobjSearchColumn('cardTokenNameOnCard'),
                cardBrand: new nlobjSearchColumn('cardBrand'),
                cardTokenCardBrand: new nlobjSearchColumn('cardTokenCardBrand')
            };

            if (id) {
                filters.push(new nlobjSearchFilter('internalid', null, 'is', id));
            }

            const result = [];
            const search_results = Application.getAllSearchResults(
                'paymentinstrument',
                filters,
                _.values(columns)
            );
            const self = this;
            const PAYMENT_METHODS = ModelsInit.session.getPaymentMethods();
            _.each(search_results, function(search_result) {
                const payment_method_id = search_result.getValue('paymentmethod');
                const card_brand =
                    search_result.getValue('cardBrand') ||
                    search_result.getValue('cardTokenCardBrand');
                const payment_method = self.getPaymentMethod(
                    payment_method_id,
                    card_brand,
                    PAYMENT_METHODS
                );
                //  only return payment methods available for the website
                if (payment_method) {
                    result.push({
                        internalid: search_result.getValue('internalid'),
                        paymentmethod: payment_method,
                        instrumenttypeValue: search_result.getValue('paymentinstrumenttype'),
                        recordType: self.parseToRecordType(
                            search_result.getText('paymentinstrumenttype')
                        ),
                        mask: search_result.getValue('mask'),
                        ccdefault: search_result.getValue('default'),
                        cardexpirationdate:
                            search_result.getValue('cardExpDate') ||
                            search_result.getValue('cardTokenCardExpDate') ||
                            search_result.getValue('generalTokenExpirationDate'),
                        ccname:
                            search_result.getValue('nameOnCard') ||
                            search_result.getValue('cardTokenNameOnCard'),
                        cardlastfourdigits:
                            search_result.getValue('lastfourdigits') ||
                            search_result.getValue('cardLastFourDigits'),
                        cardbrand: card_brand
                    });
                }
            });

            return result;
        },

        update: function(id, data) {
            // Update the payment instrument

            const record = nlapiLoadRecord(data.recordType, id);
            record.setFieldValue('isdefault', data.ccdefault);

            return nlapiSubmitRecord(record);
        },

        create: function(data) {
            // Create a new credit card

            this.validate(data);

            const payment_method = data.paymentmethod.split(',')[0];
            const preserve_on_file = data.savecreditcard ? data.savecreditcard : 'T';
            const is_default = data.ccdefault ? data.ccdefault : 'F';

            const pi = nlapiCreateRecord('paymentCard');
            pi.setFieldValue('entity', nlapiGetUser());
            pi.setFieldValue('cardnumber', data.ccnumber);
            pi.setFieldValue('nameoncard', data.ccname);
            pi.setFieldValue('expirationdate', data.expmonth + '/' + data.expyear);
            pi.setFieldValue('paymentmethod', payment_method);
            pi.setFieldValue('preserveonfile', preserve_on_file);
            pi.setFieldValue('isdefault', is_default);

            return nlapiSubmitRecord(pi);
        },

        checkForUser: function(record) {
            return (
                record && record.getFieldValue('entity').toString() === nlapiGetUser().toString()
            );
        },

        remove: function(id) {
            const record = this.getRecordFromSearch(id);
            if (this.checkForUser(record)) {
                record.setFieldValue('isinactive', 'T');
                return nlapiSubmitRecord(record);
            }
            console.error('Invalid id used to delete Payment Method ' + id);
            return null;
        },

        getPaymentMethod: function(paymentmethodid, paymentmethodbrand, paymentmethod) {
            // Because ModelsInit.session.getPaymentMethods() consumes 10 governance,
            // paymenmethod parameter is used to avoid 'Script Execution Usage Limit Exceeded'
            // when is used in loops (check the call to this function inside the loop from list() method)
            // Logical operator is used for backward compatibility.

            const payment_methods = paymentmethod || ModelsInit.session.getPaymentMethods();
            const payment_method = _.findWhere(payment_methods, {
                internalid: paymentmethodid
            });

            // as payment methods for token is one for all brands, setting name and imaged based on non tokenized payment method
            if (payment_method && payment_method.creditcardtoken === 'T') {
                const non_token_payment_method = _.find(payment_methods, function(paymentmethod) {
                    const payment_method_raw_name = paymentmethod.name
                        .replace(/\s/g, '')
                        .toLowerCase();
                    const payment_method_brand_raw_name = paymentmethodbrand
                        .replace(/\s/g, '')
                        .toLowerCase();

                    return payment_method_raw_name === payment_method_brand_raw_name;
                });
                if (non_token_payment_method) {
                    payment_method.imagesrc = non_token_payment_method.imagesrc;
                    payment_method.name = non_token_payment_method.name;
                }
            }

            return payment_method;
        },

        getRecordFromSearch: function(id) {
            const search_record = this.list(id);
            const record = _.find(search_record, function(payment_instrument) {
                return payment_instrument.internalid === id;
            });

            if (record) {
                return nlapiLoadRecord(record.recordType, id);
            }

            // for !preservedonfile cards
            return this.getRecord(id);
        },
        getRecord: function(id) {
            // if paymentcard not found, assumes that is already converted to token
            try {
                return nlapiLoadRecord('paymentcard', id);
            } catch (e) {
                if (e.code == 'RCRD_DSNT_EXIST') {
                    return nlapiLoadRecord('paymentcardtoken', id);
                }
                throw e;
            }
        },

        parseToRecordType: function(name) {
            const record_type = name.replace(/\s/g, '');

            return record_type;
        }
    });
});
