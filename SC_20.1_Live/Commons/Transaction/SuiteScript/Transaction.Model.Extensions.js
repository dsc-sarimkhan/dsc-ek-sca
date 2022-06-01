/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Transaction
define('Transaction.Model.Extensions', ['Application', 'Utils', 'underscore'], function(
    Application,
    Utils,

    _
) {
    // @class Transaction.Model.Extensions
    return {
        getAdjustments: function(options) {
            options = options || {};

            const applied_to_transaction = options.appliedToTransaction || [this.result.internalid];
            const types = options.types || ['CustCred', 'DepAppl', 'CustPymt'];
            const ids = [];
            const adjustments = {};
            const credit_card_payment = this.creditCardsPaymentsEnabled;
            const amount_field = this.isMultiCurrency
                ? 'appliedtoforeignamount'
                : 'appliedtolinkamount';
            let filters = [
                new nlobjSearchFilter(
                    'appliedtotransaction',
                    null,
                    'anyof',
                    applied_to_transaction
                ),
                new nlobjSearchFilter(amount_field, null, 'isnotempty'),
                new nlobjSearchFilter('type', null, 'anyof', types)
            ];
            let columns = [
                new nlobjSearchColumn('total'),
                new nlobjSearchColumn('tranid'),
                new nlobjSearchColumn('trandate').setSort(true),
                new nlobjSearchColumn('type'),
                new nlobjSearchColumn(amount_field)
            ];
            let search_results = Application.getAllSearchResults('transaction', filters, columns);

            _.each(search_results || [], function(payout) {
                const internal_id = payout.getId();
                const duplicated_adjustment = adjustments[internal_id];

                if (options.paymentMethodInformation) {
                    ids.push(internal_id);
                }

                if (!duplicated_adjustment) {
                    adjustments[internal_id] = {
                        internalid: internal_id,
                        tranid: payout.getValue('tranid'),
                        recordtype: payout.getRecordType(),
                        amount: Utils.toCurrency(payout.getValue(amount_field)),
                        amount_formatted: Utils.formatCurrency(payout.getValue(amount_field)),
                        trandate: payout.getValue('trandate')
                    };
                } else {
                    duplicated_adjustment.amount += Utils.toCurrency(payout.getValue(amount_field));
                    duplicated_adjustment.amount_formatted = Utils.formatCurrency(
                        duplicated_adjustment.amount
                    );
                }
            });

            if (options.paymentMethodInformation && ids.length) {
                filters = [
                    new nlobjSearchFilter('mainline', null, 'is', 'T'),
                    new nlobjSearchFilter('internalid', null, 'anyof', ids),
                    new nlobjSearchFilter('type', null, 'anyof', types)
                ];
                columns = [
                    new nlobjSearchColumn('internalid'),
                    new nlobjSearchColumn('type'),
                    new nlobjSearchColumn('paymentmethod'),
                    new nlobjSearchColumn('tranid')
                ];

                if (credit_card_payment) {
                    columns.push(
                        new nlobjSearchColumn('ccexpdate'),
                        new nlobjSearchColumn('ccholdername'),
                        new nlobjSearchColumn('ccnumber')
                    );
                }

                search_results = Application.getAllSearchResults('transaction', filters, columns);

                _.each(search_results || [], function(payout) {
                    const internal_id = payout.getId();
                    const adjustment = adjustments[internal_id];
                    const paymentmethod = {
                        name: payout.getText('paymentmethod'),
                        internalid: payout.getValue('tranid')
                    };
                    const ccnumber = payout.getValue('ccnumber');

                    if (ccnumber) {
                        paymentmethod.type = 'creditcard';
                        // @property {Transaction.Model.Get.PaymentMethod.CreditCard?} creditcard This value is present only if the type is creditcard
                        paymentmethod.creditcard =
                            // @class Transaction.Model.Get.PaymentMethod.CreditCard
                            {
                                // @property {String} ccnumber
                                ccnumber: ccnumber,
                                // @property {String} ccexpiredate
                                ccexpiredate: payout.getValue('ccexpdate'),
                                // @property {String} ccname
                                ccname: payout.getValue('ccholdername'),
                                // @property {Transaction.Model.Get.PaymentMethod.CreditCard.Details} paymentmethod
                                paymentmethod: {
                                    // @class Transaction.Model.Get.PaymentMethod.CreditCard.Details
                                    // @property {String} ispaypal
                                    ispaypal: 'F',
                                    // @property {String} name
                                    name: paymentmethod.name,
                                    // @property {String} creditcard Value: 'T'
                                    creditcard: 'T',
                                    // @property {String} internalid
                                    internalid: payout.getValue('tranid')
                                }
                            };
                    }

                    if (adjustment) {
                        adjustment.paymentmethod = paymentmethod;
                    }
                });
            }

            this.result.adjustments = _.values(adjustments);
            // @class Transaction.Extensions.Model
        },

        // @method getSalesRep Gets the sales representative information into the current transaction
        // @return {Void} This method does not return anything as it works with the value of this.result and this.record
        getSalesRep: function() {
            const salesrep_id = this.record.getFieldValue('salesrep');
            const salesrep_name = this.record.getFieldText('salesrep');

            if (salesrep_id) {
                // @class Transaction.Model.Get.Result
                // @property {Transaction.Model.Get.SalesRepresentative}
                this.result.salesrep =
                    // @class Transaction.Model.Get.SalesRepresentative
                    {
                        // @property {String} name
                        name: salesrep_name,
                        // @property {String} internalid
                        internalid: salesrep_id
                    };

                const search_result = nlapiLookupField(
                    this.result.recordtype,
                    this.result.internalid,
                    [
                        'salesrep.phone',
                        'salesrep.email',
                        'salesrep.entityid',
                        'salesrep.mobilephone',
                        'salesrep.fax'
                    ]
                );

                if (search_result) {
                    // @property {String?} phone
                    this.result.salesrep.phone = search_result['salesrep.phone'];
                    // @property {String} email
                    this.result.salesrep.email = search_result['salesrep.email'];
                    // @property {String} fullname
                    this.result.salesrep.fullname = search_result['salesrep.entityid'];
                    // @property {String?} mobilephone
                    this.result.salesrep.mobilephone = search_result['salesrep.mobilephone'];
                    // @property {String} fax
                    this.result.salesrep.fax = search_result['salesrep.fax'];
                }
            }
            // @class Transaction.Model.Extensions
        }
    };
});
