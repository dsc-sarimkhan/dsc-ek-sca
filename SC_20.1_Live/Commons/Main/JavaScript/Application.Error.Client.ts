/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Application.Error.Client"/>
import * as _ from 'underscore';

import * as Utils from '../../Utilities/JavaScript/Utils';

const ApplicationErrorClient: any = {
    // @property {Object} itemNotInOrder
    itemNotInOrder: {
        // @property {String} code
        code: 'ITEM_NOT_IN_ORDER',
        // @property {String} message
        message: Utils.translate('This item scanned is not on the order.')
    },

    // @property {Object} needCustomerToPOA
    customerSelectionRequiredToPOA: {
        // @property {String} code
        code: 'CUSTOMER_SELECTION_REQUIRED_TO_POA',
        // @property {String} message
        message: Utils.translate('Please select a customer first')
    },

    // @property {Object} errorScanningAuthCard
    errorScanningAuthCard: {
        // @property {String} code
        code: 'ERROR_SCANNING_AUTH_CARD',
        // @property {String} message
        message: Utils.translate(
            'There was an error scanning your authentication card. Please check your credentials.'
        )
    },

    cardNotRecognized: {
        // @property {String} code
        code: 'CARD_NOT_RECOGNIZED',
        // @property {String} message
        message: Utils.translate('Card is not recognized. Please try again.')
    },

    invalidAccessCode: {
        // @property {String} code
        code: 'INVALID_ACCESS_CODE',
        // @property {String} message
        message: Utils.translate('Invalid Access Code. Try again.')
    },

    invalidCreditMemo: {
        // @property {String} code
        code: 'INVALID_CREDIT_MEMO',
        // @property {String} message
        message: Utils.translate('The credit memo is not valid or it is not for this customer.')
    },

    anythingToPay: {
        // @property {String} code
        code: 'ANYTHINGTOPAY',
        // @property {String} message
        message: Utils.translate('You dont have anything to pay.')
    },

    errorsIssuedFields: {
        // @property {String} code
        code: 'ERRORSISSUEDFIELDS',
        // @property {String} message
        message: Utils.translate(
            'There are errors on the issued fields. Correct them and submit the data again.'
        )
    },

    specifyEmailAddress: {
        // @property {String} code
        code: 'SPECIFYEMAILADDRESS',
        // @property {String} message
        message: Utils.translate('Please specify the customers email address.')
    },

    noTransactionAssociated: {
        // @property {String} code
        code: 'NOTRANSACTIONASSOCIATED',
        // @property {String} message
        message: Utils.translate('Gift Certificate has no transaction associated.')
    },

    giftCertificateNotPaidYet: {
        // @property {String} code
        code: 'GIFTCERTIFICATENOTPAIDYET',
        // @property {String} message
        message: Utils.translate('Gift Certificate is not paid yet.')
    },

    fetchingGiftCertificateData: {
        // @property {String} code
        code: 'FETCHINGGIFTCERTIFICATEDATA',
        // @property {String} message
        message: Utils.translate(
            'An unexpected error occurred while fetching Gift Certificate Data.'
        )
    },

    giftCertificateIsInactive: {
        // @property {String} code
        code: 'GIFTCERTIFICATEISINACTIVE',
        // @property {String} message
        message: Utils.translate("Gift Certificate is inactive or doesn't have remaining amount.")
    },

    unknownGiftCertificate: {
        // @property {String} code
        code: 'UNKNOWNGIFTCERTIFICATE',
        // @property {String} message
        message: Utils.translate('Unknown Gift Certificate Authorization Code.')
    },

    giftCardIsNotRecognized: {
        // @property {String} code
        code: 'GIFTCARDISNOTRECOGNIZED',
        // @property {String} message
        message: Utils.translate('Gift Card is not recognized. Please try again.')
    },

    recipientEmailIsInvalid: {
        // @property {String} code
        code: 'RECIPIENTEMAILISINVALID',
        // @property {String} message
        message: Utils.translate('Recipient email is invalid.')
    },

    invalidDateFormat: {
        // @property {String} code
        code: 'INVALIDDATEFORMAT',
        // @property {String} message
        message: Utils.translate('Invalid date format.')
    },

    selectTerm: {
        // @property {String} code
        code: 'SELECTTERM',
        // @property {String} message
        message: Utils.translate('You should select a term first.')
    },

    endCashNotExpectedAmount: {
        // @property {String} code
        code: 'END_CASH_NOT_EXPECTED_AMOUNT',
        // @property {String} message
        message: Utils.translate('End cash does not match expected amount.')
    },

    addNote: {
        code: 'ADD_NOTE',
        message: Utils.translate('You should add a note.')
    },

    notOpenShift: {
        code: 'NOT_OPEN_SHIFT',
        message: Utils.translate('To use this action you need to have an open shift.')
    },

    closeDrawerError: {
        code: 'CLOSE_DRAWER_ERROR',
        message: Utils.translate('Error to save a close drawer.')
    },

    printingError: {
        code: 'PRINTING_ERROR',
        message: Utils.translate('Printing error.')
    },

    configureCashDrawer: {
        code: 'CASH_DRAWER_CONFIGURATION',
        message: Utils.translate(
            'You must configure at least one cash drawer for this location. Contact your administrator.'
        )
    },

    errorAsociatingPrintger: {
        code: 'ERROR_ASOCIATING_PRINTER',
        message: Utils.translate('Error saving asociating printer.')
    },

    // @property {Object} payWithCreditMemoNotAvailable
    payWithCreditMemoNotAvailable: {
        // @property {String} code
        code: 'PAY_WITH_CREDIT_MEMO_NOT_AVAILABLE',
        // @property {String} message
        message: _(
            'This action is not allowed due to your account configuration. Contact your system administrator.'
        )
    },

    invalidWithdrawingAmount: {
        // @property {String} code
        code: 'ERROR_INVALID_WITHDRAWING_AMOUNT',
        // @property {String} message
        message: Utils.translate(
            'You cannot withdraw an amount of cash greater than the amount in the cash drawer.'
        )
    },

    closedByStoreManagerMessage: {
        code: 'ERROR_CLOSED_BY_STORE_MANAGER',
        message: Utils.translate(
            'Please before closing the shift check that the clerk has finished all transactions.'
        )
    },

    quoteInOtherSubsidiary: {
        code: 'ERROR_INVALID_QUOTE_SUBSIDIARY',
        message: Utils.translate('Cannot open quotes originated at a different subsidiary.')
    },

    quoteWithInvalidItems: {
        code: 'ERROR_INVALID_QUOTE_ITEMS',
        message: Utils.translate(
            'Unable to open this quote because, one or more items are not available.'
        )
    }
};

export = ApplicationErrorClient;
