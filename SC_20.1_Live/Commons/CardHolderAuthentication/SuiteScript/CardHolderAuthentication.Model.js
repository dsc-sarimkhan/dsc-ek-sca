/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('CardHolderAuthentication.Model', [
    'SC.Model', 'underscore'
], function (
    SCModel,
    _
) {
    // @class CardHolderAuthentication.Model Defines the model used for authentication in case of 3DSecure
    // Available methods allow to create, submit and search a cardHolder authentication record
    // @extends SCModel
    return SCModel.extend({
        name: 'CardHolderAuthentication',

        create: function create(options) {
            let cardholderAuthenticationRecord = nlapiCreateRecord('cardholderauthentication');

            //Required field values
            cardholderAuthenticationRecord.setFieldValue('entity', nlapiGetUser());
            cardholderAuthenticationRecord.setFieldValue('amount', options.amount);
            cardholderAuthenticationRecord.setFieldValue('paymentoption', options.paymentOption);
            cardholderAuthenticationRecord.setFieldValue('paymentprocessingprofile', options.paymentProcessingProfile);
            cardholderAuthenticationRecord.setFieldValue('notificationurl', options.notificationURL);
            cardholderAuthenticationRecord.setFieldValue('challengewindowsize', '02');
            cardholderAuthenticationRecord.setFieldValue('acceptheader', '*/*');
            cardholderAuthenticationRecord.setFieldValue('useragent', '*/*');

            return nlapiSubmitRecord(cardholderAuthenticationRecord);
        },

        searchById: function (id) {
            let filters = new Array();
            filters[0] = new nlobjSearchFilter('internalid', null, 'is', id);
            let columns = new Array();
            columns[0] = new nlobjSearchColumn('internalid');
            columns[1] = new nlobjSearchColumn('status');
            columns[2] = new nlobjSearchColumn('authenticatedeviceformid');
            columns[3] = new nlobjSearchColumn('authenticatedeviceformaction');
            columns[4] = new nlobjSearchColumn('challengeshopperformid');
            columns[5] = new nlobjSearchColumn('challengeshopperformaction');

            let searchresults = nlapiSearchRecord('cardholderauthentication', null, filters, columns);

            if (searchresults.length > 0) {
                return searchresults[0];
            }

            throw notFoundError;
        },

        setStatus: function (id, status) {
            return nlapiSubmitField('cardholderauthentication', id, 'status', status);
        },

        searchAuthenticateDeviceInputFields: function (id) {
            var filters = new Array();
            filters[0] = new nlobjSearchFilter('cardholderauthentication', null, 'is', id);
            var columns = new Array();
            columns[0] = new nlobjSearchColumn('name');
            columns[1] = new nlobjSearchColumn('value');

            return nlapiSearchRecord('authenticatedeviceinput', null, filters, columns);
        },

        searchChallengeShopperInputFields: function (id) {
            var filters = new Array();
            filters[0] = new nlobjSearchFilter('cardholderauthentication', null, 'is', id);
            var columns = new Array();
            columns[0] = new nlobjSearchColumn('name');
            columns[1] = new nlobjSearchColumn('value');

            return nlapiSearchRecord('challengeshopperinput', null, filters, columns);
        },

        loadAndSubmitWithReturnedParameters: function (id, iframeType, returnedParameters) {
            var returnedParameters = JSON.parse(returnedParameters),
                cardholderAuthentication = nlapiLoadRecord('cardholderauthentication', id),
                group = 'chsreturnparameters';

            if (iframeType === 'AUTHENTICATE_DEVICE') {
                group = 'adreturnparameters'
            }

            for (key in returnedParameters) {
                cardholderAuthentication.selectNewLineItem(group);
                cardholderAuthentication.setCurrentLineItemValue(group, 'name', key);
                cardholderAuthentication.setCurrentLineItemValue(group, 'value', returnedParameters[key]);
                cardholderAuthentication.commitLineItem(group);
            }

            nlapiSubmitRecord(cardholderAuthentication);
        }
    });
});