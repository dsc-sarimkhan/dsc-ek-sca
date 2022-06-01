/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PaymentWizard.Configuration"/>

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import PaymentWizardModuleInvoice = require('./PaymentWizard.Module.Invoice');
import PaymentWizardModuleSummary = require('./PaymentWizard.Module.Summary');
import PaymentWizardModuleCreditTransaction = require('./PaymentWizard.Module.CreditTransaction');
import PaymentWizardModulePaymentMethodSelector = require('./PaymentWizard.Module.PaymentMethod.Selector');
import PaymentWizardModulePaymentMethodCreditcard = require('./PaymentWizard.Module.PaymentMethod.Creditcard');
import PaymentWizardModuleShowInvoices = require('./PaymentWizard.Module.ShowInvoices');
import PaymentWizardModuleConfirmation = require('./PaymentWizard.Module.Confirmation');
import PaymentWizardModuleShowPayments = require('./PaymentWizard.Module.ShowPayments');
import PaymentWizardModuleConfirmationSummary = require('./PaymentWizard.Module.ConfirmationSummary');
import PaymentWizardModuleShowCreditTransaction = require('./PaymentWizard.Module.ShowCreditTransaction');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');

const paymentWizardSteps = [
    {
        name: Utils.translate('SELECT INVOICES TO PAY'),
        steps: [
            {
                url: 'make-a-payment',
                hideBackButton: true,
                hideContinueButton: false,
                modules: [
                    PaymentWizardModuleInvoice,
                    [
                        PaymentWizardModuleSummary,
                        {
                            container: '#wizard-step-content-right',
                            show_estimated_as_invoices_total: true
                        }
                    ]
                ],
                save: function() {
                    return jQuery.Deferred().resolve();
                }
            }
        ]
    },
    {
        name: Utils.translate('PAYMENT AND REVIEW'),
        steps: [
            {
                url: 'review-payment',
                hideBackButton: false,
                hideContinueButton: false,
                modules: [
                    [
                        PaymentWizardModuleCreditTransaction,
                        {
                            transaction_type: 'deposit'
                        }
                    ],
                    [
                        PaymentWizardModuleCreditTransaction,
                        {
                            transaction_type: 'credit'
                        }
                    ],
                    [
                        PaymentWizardModulePaymentMethodSelector,
                        {
                            title: Utils.translate('Payment Method'),
                            record_type: 'customerpayment',
                            modules: [
                                {
                                    classModule: PaymentWizardModulePaymentMethodCreditcard,
                                    name: Utils.translate('Credit / Debit Card'),
                                    type: 'creditcard',
                                    options: {}
                                }
                            ]
                        }
                    ],
                    [
                        PaymentWizardModuleSummary,
                        {
                            container: '#wizard-step-content-right',
                            total_label: Utils.translate('Payment Total'),
                            submit: true
                        }
                    ],
                    [
                        PaymentWizardModuleShowInvoices,
                        {
                            container: '#wizard-step-content-right'
                        }
                    ]
                ],
                save: function() {
                    const promise = jQuery.Deferred();

                    this.wizard.model.save().done(customerPayment => {
                        if (
                            customerPayment.confirmation &&
                            customerPayment.confirmation.statuscode === 'redirect'
                        ) {
                            window.location.href = Utils.addParamsToUrl(
                                customerPayment.confirmation.redirecturl,
                                {
                                    touchpoint: Configuration.get('currentTouchpoint')
                                }
                            );

                            promise.reject();
                        }
                        
                        promise.resolve();
                    });

                    return promise;
                }
            },
            {
                url: 'payment-confirmation',
                hideBackButton: true,
                hideBreadcrumb: true,
                hideContinueButton: true,
                modules: [
                    PaymentWizardModuleConfirmation,
                    PaymentWizardModuleShowInvoices,
                    [
                        PaymentWizardModuleShowCreditTransaction,
                        {
                            transaction_type: 'deposit'
                        }
                    ],
                    [
                        PaymentWizardModuleShowCreditTransaction,
                        {
                            transaction_type: 'credit'
                        }
                    ],
                    PaymentWizardModuleShowPayments,
                    [
                        PaymentWizardModuleConfirmationSummary,
                        {
                            container: '#wizard-step-content-right',
                            submit: true
                        }
                    ]
                ]
            }
        ]
    }
];

export = paymentWizardSteps;
