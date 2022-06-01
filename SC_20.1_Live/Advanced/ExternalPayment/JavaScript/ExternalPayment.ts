/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ExternalPayment"/>
// @module ExternalPayment

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import InternalErrorView = require('../../../Commons/ErrorManagement/JavaScript/ErrorManagement.InternalError.View');

const ExternalPayment: any = {
    mountToApp: function(application) {
        if (SC.ENVIRONMENT.EXTERNALPAYMENT && SC.ENVIRONMENT.EXTERNALPAYMENT.parameters) {
            const params =
                SC.ENVIRONMENT.EXTERNALPAYMENT && SC.ENVIRONMENT.EXTERNALPAYMENT.parameters;
            let external_fragment;

            if (!params.errorCode) {
                switch (params.externalPayment) {
                    case 'DONE':
                        external_fragment =
                            '#' +
                            SC.CONFIGURATION.externalPayment[params.recordType.toUpperCase()]
                                .doneFragment;
                        break;
                    case 'FAIL':
                        external_fragment =
                            '#' +
                            SC.CONFIGURATION.externalPayment[params.recordType.toUpperCase()]
                                .failFragment;
                        break;
                }

                if (external_fragment) {
                    delete params.errorCode;
                    external_fragment = Utils.addParamsToUrl(external_fragment, params);
                    window.location.hash = external_fragment;
                }
            } else if (params.errorCode) {
                const self = this;
                application.getLayout().once('afterAppendView', function() {
                    const view = new InternalErrorView({
                        application: application,
                        message: self.getErrorMessage(params.errorCode),
                        pageHeader: Utils.translate('External Payment Error'),
                        title: Utils.translate('External Payment Error')
                    });
                    view.showContent();
                });
            }
        }
    },

    // @method getErrorMessage
    // @param {String} error_code
    getErrorMessage: function(error_code) {
        let message;
        switch (error_code) {
            case 'externalPaymentValidationStatusFail':
                message = Utils.translate('Invalid payment event.');
                break;
            case 'externalPaymentRequestInvalidParameters':
                message = Utils.translate('Invalid parameters.');
                break;
            case 'externalPaymentMissingImplementation':
                message = Utils.translate('Invalid external payment method implementation.');
                break;
            case 'externalPaymentRecordValidationStatusFail':
                message = Utils.translate('Invalid record status.');
                break;
            default:
                message = Utils.translate('Invalid error code.');
        }
        return message;
    }
};

export = ExternalPayment;
