/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/* global customer */

// PrintStatement.Model.js
// ----------
define('PrintStatement.Model', ['SC.Model'], function(SCModel) {
    return SCModel.extend({
        name: 'PrintStatement',

        getUrl: function(data) {
            const customerId = customer.getFieldValues(['internalid']).internalid;
            const offset = new Date().getTimezoneOffset() * 60 * 1000;
            let statementDate = null;
            let startDate = null;
            const openOnly = data.openOnly ? 'T' : 'F';
            const inCustomerLocale = data.inCustomerLocale ? 'T' : 'F';
            const consolidatedStatement = data.consolidatedStatement ? 'T' : 'F';
            const statementTimestamp = parseInt(data.statementDate, 10);
            const startDateParam = data.startDate;
            const startTimestamp = parseInt(startDateParam, 10);
            const { email } = data;
            const baseUrl = email
                ? '/app/accounting/transactions/email.nl'
                : '/app/accounting/print/NLSPrintForm.nl';
            let url =
                baseUrl +
                '?submitted=T&printtype=statement&currencyprecision=2&formdisplayview=NONE&type=statement';

            if (isNaN(statementTimestamp) || (startDateParam && isNaN(startTimestamp))) {
                throw {
                    status: 500,
                    code: 'ERR_INVALID_DATE_FORMAT',
                    message: 'Invalid date format'
                };
            }

            statementDate = nlapiDateToString(new Date(statementTimestamp + offset));
            startDate = startDateParam
                ? nlapiDateToString(new Date(startTimestamp + offset))
                : null;

            url += '&customer=' + customerId;
            url += startDate ? '&start_date=' + startDate : '';
            url += '&statement_date=' + statementDate;
            url += '&consolstatement=' + consolidatedStatement;
            url += '&openonly=' + openOnly;
            url += '&incustlocale=' + inCustomerLocale;

            return url;
        }
    });
});
