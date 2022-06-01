/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Invoice.Model.js
// ----------
// Handles fetching invoices
define('Invoice.Model', [
    'Application',
    'Utils',
    'Transaction.Model',
    'Transaction.Model.Extensions',

    'underscore'
], function(
    Application,
    Utils,
    TransactionModel,
    TransactionModelExtensions,

    _
) {
    return TransactionModel.extend({
        name: 'Invoice',

        setExtraListColumns: function() {
            if (this.isMultiCurrency) {
                this.columns.amount_remaining = new nlobjSearchColumn('formulanumeric').setFormula(
                    '{amountremaining} / {exchangerate}'
                );
            } else {
                this.columns.amount_remaining = new nlobjSearchColumn('amountremaining');
            }

            this.columns.originalamountremaining = new nlobjSearchColumn('amountremaining');
            this.columns.originalamount = new nlobjSearchColumn('amount');
            this.columns.closedate = new nlobjSearchColumn('closedate');
            this.columns.duedate = new nlobjSearchColumn('duedate');

            if (this.isCustomColumnsEnabled()) {
                this.setCustomColumns('invoiceOpen');
                this.setCustomColumns('invoicePaid');
            }
        },

        setExtraListFilters: function() {
            const { status } = this.data;

            if (status) {
                let value = null;

                switch (status) {
                    case 'open':
                        value = 'CustInvc:A';
                        break;

                    case 'paid':
                        value = 'CustInvc:B';
                        break;
                }

                if (value) {
                    this.filters.status_operator = 'and';
                    this.filters.status = ['status', 'anyof', value];
                }
            }
        },

        // @method mapListResult Overrides the namesake method of Transaction.Model. It maps the received result with proper information
        // @param {Transaction.Model.List.Result.Record} result Base result to be extended
        // @param {nlobjSearchResult} record Instance of the record returned by NetSuite search
        // @return {Transaction.Model.List.Result.Record}
        mapListResult: function(result, record) {
            const due_date = record.getValue('duedate');
            const close_date = record.getValue('closedate');
            const transaction_date = record.getValue('trandate');
            const due_date_millisenconds = due_date
                ? nlapiStringToDate(due_date).getTime()
                : new Date().getTime();
            const due_in_milliseconds = due_date_millisenconds - this.now;
            let currencySymbol;

            if (this.result && this.result.selected_currency) {
                currencySymbol = this.result.selected_currency.symbol;
            }

            result.originalamount = record.getValue(this.columns.originalamount);
            result.original_amount_remaining = record.getValue(
                this.columns.originalamountremaining
            );

            result.amountremaining = Utils.toCurrency(
                record.getValue(this.columns.amount_remaining)
            );
            result.amountremaining_formatted = Utils.formatCurrency(
                record.getValue(this.columns.amount_remaining),
                currencySymbol
            );

            result.closedate = close_date;

            result.closedateInMilliseconds = close_date
                ? nlapiStringToDate(close_date).getTime()
                : 0;
            result.tranDateInMilliseconds = transaction_date
                ? nlapiStringToDate(transaction_date).getTime()
                : 0;

            result.duedate = due_date;
            result.dueinmilliseconds = due_in_milliseconds;
            result.isOverdue =
                due_in_milliseconds <= 0 && (-1 * due_in_milliseconds) / 1000 / 60 / 60 / 24 >= 1;
            result.isPartiallyPaid = record.getValue('amount') - record.getValue('amountremaining');

            if (this.isCustomColumnsEnabled()) {
                this.mapCustomColumns(result, record, 'invoiceOpen');
                this.mapCustomColumns(result, record, 'invoicePaid');
            }
            return result;
        },

        getExtraRecordFields: function() {
            this.getAdjustments();
            this.getSalesRep();

            this.result.purchasenumber = this.record.getFieldValue('otherrefnum');
            this.result.dueDate = this.record.getFieldValue('duedate');
            this.result.amountDue = Utils.toCurrency(
                this.record.getFieldValue('amountremainingtotalbox')
            );

            let currencySymbol;
            if (this.result && this.result.selected_currency) {
                currencySymbol = this.result.selected_currency.symbol;
            }

            this.result.amountDue_formatted = Utils.formatCurrency(
                this.record.getFieldValue('amountremainingtotalbox'),
                currencySymbol
            );
        },

        postList: function() {
            const results = this.data.page === 'all' ? this.results : this.results.records;
            const invoice_ids = _.pluck(results || [], 'internalid');

            if (_.isEmpty(invoice_ids)) {
                return;
            }

            const payments = [];
            const filters = [
                new nlobjSearchFilter('appliedtotransaction', null, 'anyof', invoice_ids)
            ];
            const columns = [
                new nlobjSearchColumn('internalid').setSort(true),
                new nlobjSearchColumn('status'),
                new nlobjSearchColumn('appliedtotransaction')
            ];
            const search_result = Application.getAllSearchResults(
                'customerpayment',
                filters,
                columns
            );

            _.each(search_result, payment => {
                const internal_id = payment.getValue('appliedtotransaction');
                if (payments[internal_id] === undefined) {
                    payments[internal_id] = payment.getValue('status');
                }
            });

            if (_.isEmpty(payments)) {
                return;
            }

            _.each(results, record => (record.payment = { status: payments[record.internalid] }));
        },

        postGet: function() {
            this.result.lines = _.reject(this.result.lines, function(line) {
                return line.quantity === 0;
            });
        },

        getStatus: function() {
            this.result.status = {
                internalid: nlapiLookupField(
                    this.result.recordtype,
                    this.result.internalid,
                    'status'
                ),
                name: nlapiLookupField(
                    this.result.recordtype,
                    this.result.internalid,
                    'status',
                    true
                )
            };
        },
        getCreatedFrom: function() {
            const created_from_internalid = nlapiLookupField(
                this.result.recordtype,
                this.result.internalid,
                'createdfrom'
            );
            const recordtype = created_from_internalid
                ? Utils.getTransactionType(created_from_internalid)
                : '';
            const tranid = recordtype
                ? nlapiLookupField(recordtype, created_from_internalid, 'tranid')
                : '';

            this.result.createdfrom = {
                internalid: created_from_internalid,
                name:
                    nlapiLookupField(
                        this.result.recordtype,
                        this.result.internalid,
                        'createdfrom',
                        true
                    ) || '',
                recordtype: recordtype,
                tranid: tranid
            };
        },
        getAdjustments: TransactionModelExtensions.getAdjustments,

        getSalesRep: TransactionModelExtensions.getSalesRep
    });
});
