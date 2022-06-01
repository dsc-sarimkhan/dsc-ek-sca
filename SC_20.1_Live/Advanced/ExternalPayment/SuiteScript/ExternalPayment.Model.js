/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ExternalPayment
define('ExternalPayment.Model', [
    'SC.Model',
    'underscore',
    'SC.Models.Init',
    'SiteSettings.Model',
    'Utils'
], function(SCModel, _, ModelsInit, SiteSettings, Utils) {
    // @class ExternalPayment.Model
    // @extends SCModel
    return SCModel.extend({
        name: 'ExternalPayment',

        errorCode: [
            'externalPaymentValidationStatusFail',
            'externalPaymentRequestInvalidParameters',
            'externalPaymentMissingImplementation',
            'externalPaymentRecordValidationStatusFail'
        ],

        generateUrl: function(id, record_type) {
            this.siteSettings = this.siteSettings || SiteSettings.get();

            const parameters = [
                'nltranid=' + id,
                'orderId=' + id,
                'n=' + this.siteSettings.siteid,
                'recordType=' + record_type,
                'goToExternalPayment=T'
            ];

            return ModelsInit.session.getAbsoluteUrl2(
                '/external_payment.ssp?' + parameters.join('&')
            );
        },

        goToExternalPayment: function(request) {
            const record_type = request.getParameter('recordType');
            const id = request.getParameter('orderId') || request.getParameter('nltranid');
            const touchpoint = request.getParameter('touchpoint');
            const result = { parameters: {} };
            const record = this._loadRecord(record_type, id);

            if (!this._validateRecordStatus(record)) {
                result.touchpoint = touchpoint;
                result.parameters.errorCode = 'externalPaymentValidationStatusFail';
            } else {
                ModelsInit.context.setSessionObject('external_nltranid_' + id, id);
                result.url = record.getFieldValue('redirecturl');
            }

            return result;
        },

        backFromExternalPayment: function(request) {
            const id = request.getParameter('orderId') || request.getParameter('nltranid');
            const record_type = request.getParameter('recordType');
            const touchpoint = request.getParameter('touchpoint');
            const result = {
                touchpoint: touchpoint,
                parameters: {
                    nltranid: id,
                    recordType: record_type,
                    externalPayment: this._isDone(request, record_type)
                        ? 'DONE'
                        : this._isReject(request, record_type)
                        ? 'FAIL'
                        : ''
                }
            };

            if (!this._preventDefault(request, record_type)) {
                const record = this._loadRecord(record_type, id);

                if (!this._validateRecordStatus(record)) {
                    result.parameters.errorCode = 'externalPaymentRecordValidationStatusFail';
                } else if (
                    !this._validateStatusFromRequest(request, record_type) ||
                    !this._validateTransactionId(id)
                ) {
                    result.parameters.errorCode = 'externalPaymentRequestInvalidParameters';
                } else {
                    const method_name = '_updatePaymentMethod' + record_type.toUpperCase();

                    if (_.isFunction(this[method_name])) {
                        this[method_name](record, request);
                    } else {
                        result.parameters.errorCode = 'externalPaymentMissingImplementation';
                    }
                }
            }

            ModelsInit.context.setSessionObject('external_nltranid_' + id, '');

            return result;
        },

        getParametersFromRequest: function(request) {
            const nltranid = parseInt(
                request.getParameter('nltranid') || request.getParameter('orderId'),
                10
            );
            const record_type = request.getParameter('recordType');
            const external_payment = request.getParameter('externalPayment');
            const error_code = request.getParameter('errorCode');
            let result;

            if (
                (external_payment === 'DONE' || external_payment === 'FAIL') &&
                !_.isNaN(nltranid) &&
                record_type
            ) {
                result = {
                    recordType: record_type,
                    nltranid: nltranid,
                    externalPayment: external_payment,
                    errorCode: error_code
                        ? _.contains(this.errorCode, error_code)
                            ? error_code
                            : 'externalPaymentRequestInvalidParameters'
                        : ''
                };
            }

            return result;
        },

        _updatePaymentMethodCUSTOMERPAYMENT: function(record, request) {
            const record_type = 'customerpayment';

            if (this._isDone(request, record_type)) {
                record.setFieldValue(
                    'datafromredirect',
                    this._getDataFromRedirect(request, record_type)
                );
                record.setFieldValue('chargeit', 'T');

                nlapiSubmitRecord(record);
            }
        },

        _updatePaymentMethodSALESORDER: function(record, request) {
            const record_type = 'salesorder';

            if (this._isDone(request, record_type)) {
                record.setFieldValue(
                    'datafromredirect',
                    this._getDataFromRedirect(request, record_type)
                );
                record.setFieldValue('getauth', 'T');
                record.setFieldValue('paymentprocessingmode', 'PROCESS');

                nlapiSubmitRecord(record, false, true);
            }
        },

        _isDone: function(request, record_type) {
            const status = this._getStatusFromRequest(request, record_type);
            const status_accept_value = this._getConfiguration(
                record_type,
                'statusAcceptValue',
                'ACCEPT'
            );
            const status_hold_value = this._getConfiguration(
                record_type,
                'statusHoldValue',
                'HOLD'
            );

            return status === status_accept_value || status === status_hold_value;
        },

        _isReject: function(request, record_type) {
            const status = this._getStatusFromRequest(request, record_type);
            const status_reject_value = this._getConfiguration(
                record_type,
                'statusRejectValue',
                'REJECT'
            );

            return status === status_reject_value;
        },

        _loadRecord: function(record_type, id) {
            return nlapiLoadRecord(record_type, id);
        },

        _validateRecordStatus: function(record) {
            return record.getFieldValue('paymenteventholdreason') === 'FORWARD_REQUESTED';
        },

        _getStatusFromRequest: function(request, record_type) {
            return request.getParameter(
                this._getConfiguration(record_type, 'statusParameterName', 'status')
            );
        },

        _validateStatusFromRequest: function(request, record_type) {
            const status = this._getStatusFromRequest(request, record_type);
            const status_accept_value = this._getConfiguration(
                record_type,
                'statusAcceptValue',
                'ACCEPT'
            );
            const status_hold_value = this._getConfiguration(
                record_type,
                'statusHoldValue',
                'HOLD'
            );
            const status_reject_value = this._getConfiguration(
                record_type,
                'statusRejectValue',
                'REJECT'
            );

            return (
                status === status_accept_value ||
                status === status_hold_value ||
                status === status_reject_value
            );
        },

        _validateTransactionId: function(nltranid) {
            return (
                ModelsInit.context.getSessionObject('external_nltranid_' + nltranid) === nltranid
            );
        },

        _getDataFromRedirect: function(request, record_type) {
            const request_parameters = request.getAllParameters();
            const configration_parameters = this._getConfiguration(record_type, 'parameters', [
                'tranid',
                'authcode',
                'status'
            ]);
            const data_from_redirect = [];

            _.each(_.keys(request_parameters), function(parameter_name) {
                if (_.contains(configration_parameters, parameter_name)) {
                    data_from_redirect.push(
                        parameter_name + '=' + request_parameters[parameter_name]
                    );
                }
            });

            console.log(JSON.stringify(data_from_redirect));

            return data_from_redirect.join('&');
        },

        _preventDefault: function(request, record_type) {
            const prevent_default_value = this._getConfiguration(
                record_type,
                'preventDefaultValue',
                'T'
            );
            const prevent_default_parameter_name = this._getConfiguration(
                record_type,
                'preventDefaultParameterName',
                'preventDefault'
            );

            return request.getParameter(prevent_default_parameter_name) === prevent_default_value;
        },

        _getConfiguration: function(record_type, property, default_value) {
            this.siteSettings = this.siteSettings || SiteSettings.get();

            const external_payment_configuration = this.siteSettings.externalPayment || {};
            const record_configuration =
                external_payment_configuration[record_type.toUpperCase()] || {};

            if (_.isUndefined(record_configuration[property])) {
                return default_value;
            }
            return record_configuration[property];
        }
    });
});
