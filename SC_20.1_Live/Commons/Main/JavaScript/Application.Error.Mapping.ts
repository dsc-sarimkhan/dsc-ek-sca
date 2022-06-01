/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Application.Error.Mapping"/>
import * as Utils from '../../Utilities/JavaScript/Utils';

const ApplicationErrorMapping: any = {
    getMappingMessage: function(errorCode, params) {
        const msg = {
            errorCode: errorCode,
            message: this[errorCode].message
        };

        if (params) {
            msg.message = Utils.translate(this[errorCode].message, params.toString().split(','));
        }

        return msg;
    },

    ERR_BAD_REQUEST: {
        message: Utils.translate('SCIS cannot compute this request. Try again.')
    },

    ERR_USER_NOT_LOGGED_IN: {
        message: Utils.translate('You are not logged in.')
    },

    // @property {Object} sessionTimedOutError
    ERR_USER_SESSION_TIMED_OUT: {
        message: Utils.translate('Your session has timed out. Please log in again.')
    },

    ERR_INSUFFICIENT_PERMISSIONS: {
        message: Utils.translate(
            'You do not have permission to perform this action. Contact an administrator to ensure you have the correct permissions.'
        )
    },

    ERR_RECORD_NOT_FOUND: {
        message: Utils.translate('Record is not found.')
    },

    ERR_METHOD_NOT_ALLOWED: {
        message: Utils.translate(
            'This action is not allowed. Contact an administrator to ensure you have the correct permissions.'
        )
    },

    ERR_INVALID_ITEMS_FIELDS_ADVANCED_NAME: {
        message: Utils.translate(
            'Contact an administrator to check if the field set has been created.'
        )
    },

    // !***** SCIS ERRORS *****
    ORDER_REQUIRED: {
        message: Utils.translate('You must specify an Order ID.')
    },

    NOT_IMPLEMENTED: {
        message: Utils.translate('Not implemented.')
    },

    NO_SITE_ID: {
        message: Utils.translate('No siteId in this session. Try logging in again.')
    },

    MISSING_SITE_ID: {
        message: Utils.translate('The siteId parameter is required.')
    },

    ORDER_ID_OR_CREDIT_MEMO_ID: {
        message: Utils.translate('The orderId or creditMemoId is required.')
    },

    NOT_APPLICABLE_CREDIT_MEMO: {
        message: Utils.translate(
            'Credit Memo is not applicable to this order. Assign the customer on the credit memo to the invoice, and then verify the credit memo balance.'
        )
    },

    REFOUND_METHOD_REQUIRED: {
        message: Utils.translate('You must specify the payment method for the refund.')
    },

    INVALID_ORDER_ID: {
        message: Utils.translate('ID for this order is not valid.')
    },

    INVALID_RETURNED_QUANTITY: {
        message: Utils.translate(
            'The quantity being returned exceeds the available quantity. (Line $(0))'
        )
    },

    CUSTOMER_NOT_FOUND: {
        message: Utils.translate('Customer is not found: $(0)')
    },

    CUSTOMER_NOT_EXIST: {
        message: Utils.translate('Customer does not exist: $(0)')
    },

    CUSTOMER_REQUIRED: {
        message: Utils.translate('Customer is requred.')
    },

    ENTITY_ID_REQUIRED: {
        message: Utils.translate('The entityId is required: $(0)')
    },

    UNEXPECTED_ERROR: {
        message: Utils.translate('An Unexpected Error has occurred.')
    },

    DEVICE_NOT_FOUND: {
        message: Utils.translate('Device was not found.')
    },

    PARAMETER_MISSING: {
        message: Utils.translate('Missing parameter: $(0)')
    },

    PRINTING_TECHNOLOGY_NOT_FOUND: {
        message: Utils.translate('Printing technology not found.')
    },

    INVALID_URL: {
        message: Utils.translate('URL is not valid.')
    },

    INVALID_PARAMETER: {
        message: Utils.translate('Parameter is not valid.')
    },

    MISSING_PARAMETER: {
        message: Utils.translate('Missing parameter.')
    },

    NOT_FOUND_EMPLOYEE_LOCATION: {
        message: Utils.translate(
            'The current user is not associated with a location. A location must be selected on the employee record.'
        )
    },

    REQUIRED_SALES_ASSOCIATE_LOCATION: {
        message: Utils.translate(
            'The sales associate requires a location to create the order. A location must be selected on the employee record.'
        )
    },

    INVALID_TRANSACTION_TYPE: {
        message: Utils.translate('Transaction type is not valid: $(0)')
    },

    LOCATION_ADDRESS_MISSING_FIELDS: {
        message: Utils.translate(
            'Location address is missing required information. Please complete the form to proceed. $(0)'
        )
    },

    LOCATION_SETTINGS_NOT_FOUND: {
        message: Utils.translate('Location setting is not found for current location: $(0)')
    },

    LOCATION_IS_REQUIRED: {
        message: Utils.translate('Location is required.')
    },

    IMPOSSIBLE_APPLY_CUPON: {
        message: Utils.translate('Unable to apply the coupon.')
    },

    SAVED_SEARCH_INVALID_COLUMN: {
        message: Utils.translate('Column index is not valid in the Saved Search: $(0)')
    },

    SAVED_SEARCH_NOT_FOUND: {
        message: Utils.translate('Saved Search is not found: $(0)')
    },

    SAVED_SEARCH_MISSING_PARAMETER: {
        message: Utils.translate('Saved Search is missing a parameter.')
    },

    ITEM_NOT_IN_SUBSIDIARY: {
        message: Utils.translate('Item is not configured for current subsidiary: $(0).')
    },

    GIFT_AUTH_CODE_ALREADY_EXIST: {
        message: Utils.translate('A Gift Card with the same authorization code already exists.')
    },

    UNAPPROVED_PAYMENT: {
        message: Utils.translate('Unapproved Payment')
    },

    NOT_FOUND_PAYMENT: {
        message: Utils.translate('No payments found')
    },

    NECESARY_SUBMIT_ORDER: {
        message: Utils.translate('The order must be submitted to update payments.')
    },

    NOT_FOUND_PAYMENT_METHOD_FOR_USER: {
        message: Utils.translate('Payment Method not found for the current user.')
    },

    FORCE_CANCELLABLE_PAYMENT: {
        message: Utils.translate('Unable to force cancellation of a payment that can be canceled.')
    },

    ITEM_NOT_CONFIGURED_FOR_SUBSIDIARY: {
        message: Utils.translate('Item is not configured for the current subsidiary: $(0).')
    },

    TRANSACTION_HAS_BEEN_RESUMED: {
        message: Utils.translate('The transaction has been resumed.. Status: $(0)')
    },

    LOAD_BEFORE_SUBMIT: {
        message: Utils.translate('BackendOpen the record before submitting it.')
    },

    UNKNOW_RECORD: {
        message: Utils.translate('Unknown record type.')
    },

    LINE_LIMIT: {
        message: Utils.translate('You have added $(0) items. You should add only until two items.')
    },

    MISSING_DRAWER_CONFIGURATION: {
        message: Utils.translate(
            'SCIS STORE SAFE ACCOUNT and SCIS CASH DRAWER DIFFERENCE fields are not configured for the current location. An administrator must make this change.'
        )
    },

    INVALID_STARTING_CASH: {
        message: Utils.translate('Starting cash must be a positive number greather than cero.')
    },

    CASH_DRAWER_IS_BEIGN_USED: {
        message: Utils.translate(
            'This cash drawer is being used by:  $(0), please select a diferent one.'
        )
    }

    // !***** END SCIS ERROR *****
};

export = ApplicationErrorMapping;
