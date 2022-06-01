/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="MyAccount.Configuration"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import PaymentWizardModuleInvoice = require('../../PaymentWizard/JavaScript/PaymentWizard.Module.Invoice');
import PaymentWizardModuleSummary = require('../../PaymentWizard/JavaScript/PaymentWizard.Module.Summary');
import PaymentWizardModuleShowInvoices = require('../../PaymentWizard/JavaScript/PaymentWizard.Module.ShowInvoices');
import PaymentWizardModuleCreditTransaction = require('../../PaymentWizard/JavaScript/PaymentWizard.Module.CreditTransaction');
import PaymentWizardModulePaymentMethodCreditcard = require('../../PaymentWizard/JavaScript/PaymentWizard.Module.PaymentMethod.Creditcard');
import PaymentWizardModuleAddresses = require('../../PaymentWizard/JavaScript/PaymentWizard.Module.Addresses');
import PaymentWizardModuleConfirmation = require('../../PaymentWizard/JavaScript/PaymentWizard.Module.Confirmation');
import PaymentWizardModuleShowCreditTransaction = require('../../PaymentWizard/JavaScript/PaymentWizard.Module.ShowCreditTransaction');
import PaymentWizardModuleShowPayments = require('../../PaymentWizard/JavaScript/PaymentWizard.Module.ShowPayments');
import PaymentWizardModuleConfirmationSummary = require('../../PaymentWizard/JavaScript/PaymentWizard.Module.ConfirmationSummary');
import PaymentWizardModulePaymentMethodSelector = require('../../PaymentWizard/JavaScript/PaymentWizard.Module.PaymentMethod.Selector');

import OrderWizardModuleCartSummary = require('../../OrderWizard.Module.CartSummary/JavaScript/OrderWizard.Module.CartSummary');
import OrderWizardModuleCartItems = require('../../OrderWizard.Module.CartItems/JavaScript/OrderWizard.Module.CartItems');
import OrderWizardModuleShowShipments = require('../../OrderWizard.Module.Shipmethod/JavaScript/OrderWizard.Module.ShowShipments');
import OrderWizardModuleShowPayments = require('../../OrderWizard.Module.PaymentMethod/JavaScript/OrderWizard.Module.ShowPayments');
import OrderWizardModuleTermsAndConditions = require('../../OrderWizard.Module.TermsAndConditions/JavaScript/OrderWizard.Module.TermsAndConditions');
import OrderWizardModuleSubmitButton = require('../../OrderWizard.Module.SubmitButton/JavaScript/OrderWizard.Module.SubmitButton');
import OrderWizardModulePaymentMethodCreditcard = require('../../OrderWizard.Module.PaymentMethod/JavaScript/OrderWizard.Module.PaymentMethod.Creditcard');
import OrderWizardModulePaymentMethodInvoice = require('../../OrderWizard.Module.PaymentMethod/JavaScript/OrderWizard.Module.PaymentMethod.Invoice');
import OrderWizardModuleAddressBilling = require('../../OrderWizard.Module.Address/JavaScript/OrderWizard.Module.Address.Billing');
import OrderWizardModulePaymentMethodSelector = require('../../OrderWizard.Module.PaymentMethod/JavaScript/OrderWizard.Module.PaymentMethod.Selector');

import QuoteToSalesOrderWizardModuleQuoteDetails = require('../../QuoteToSalesOrderWizard/JavaScript/QuoteToSalesOrderWizard.Module.QuoteDetails');
import QuoteToSalesOrderWizardModuleConfirmation = require('../../QuoteToSalesOrderWizard/JavaScript/QuoteToSalesOrderWizard.Module.Confirmation');
import QuoteToSalesOrderWizardModulePaymentMethodSelector = require('../../QuoteToSalesOrderWizard/JavaScript/QuoteToSalesOrderWizard.Module.PaymentMethod.Selector');

import HeaderView = require('../../Header/JavaScript/Header.View');

import BaseConfiguration = require('../../SCA/JavaScript/SC.Configuration');

class MyAccountConfiguration {
    // Why a Singleton? Multiple instances of a 'Configuration Module' it doesn't make sense.-
    private static _instance: MyAccountConfiguration;

    public static getInstance(): MyAccountConfiguration {
        if (!MyAccountConfiguration._instance) {
            MyAccountConfiguration._instance = new MyAccountConfiguration();
        }
        return MyAccountConfiguration._instance;
    }

    private _currentTouchpoint: string = 'customercenter';

    private _configuration: Record<string, any> = {};

    private _collapseElements: Record<string, any>;

    private constructor() {
        const modulesConfig: object = this.getModulesConfig();
        const externalPayment: object = this.getExternalPayment();
        const paymentWizardSteps: object = this.getPaymentWizardSteps();
        const quotesToSalesOrderWizard: object = this.getQuotesToSalesOrderWizard();

        // [ES6] SPREAD OPERATOR
        this._configuration = {
            ...BaseConfiguration,
            modulesConfig,
            externalPayment,
            paymentWizardSteps,
            quotesToSalesOrderWizard
        };

        // window.screen = false;
        // Calculates the width of the device, it will try to use the real screen size.
        const screen_width = Utils.getViewportWidth();

        this._collapseElements = { sca: { whatever: 'rnr' } };

        // Phone Specific
        if (screen_width < 768) {
            this._collapseElements = { sca: { collapseElements: true } };
            BaseConfiguration.defaultPaginationSettings =
                BaseConfiguration.defaultPaginationSettingsPhone;
        }
        // Tablet Specific
        else if (screen_width >= 768 && screen_width <= 978) {
            this._collapseElements = { sca: { collapseElements: true } };
            BaseConfiguration.defaultPaginationSettings =
                BaseConfiguration.defaultPaginationSettingsTablet;
        } else {
            this._collapseElements = { sca: { whatever: 'rbr' } };
        }
    }

    getConfiguration = (): object => this._configuration;

    private getModulesConfig = (): object => {
        const modulesConfig: object = {
            Cart: { startRouter: false },
            Address: { startRouter: SC.ENVIRONMENT.siteSettings.is_logged_in },
            CreditCard: { startRouter: SC.ENVIRONMENT.siteSettings.is_logged_in }
        };
        return modulesConfig;
    };

    // External Payment configuration.
    // You need to set the url (fragment) to redirect the customer after returns from external payment gateway.
    private getExternalPayment = (): object => {
        const externalPayment: object = {
            SALESORDER: {
                doneFragment: 'quotetosalesorder-confirmation',
                failFragment: 'quotetosalesorder-review'
            },
            CUSTOMERPAYMENT: {
                doneFragment: 'payment-confirmation',
                failFragment: 'review-payment'
            }
        };

        return externalPayment;
    };

    private getPaymentWizardSteps = (): object[] => {
        const paymentWizardSteps: object[] = [
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
                            return this.wizard.model.save();
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

        return paymentWizardSteps;
    };

    private getQuotesToSalesOrderWizard = (): Record<string, any> => {
        const quotesToSalesOrderWizard: Record<string, any> = {
            steps: [
                {
                    name: Utils.translate('REVIEW YOUR ORDER'),
                    steps: [
                        {
                            url: 'quotetosalesorder-review',
                            name: Utils.translate('Review Your Oder'),
                            hideBackButton: true,
                            hideContinueButton: false,
                            continueButtonLabel: Utils.translate('Place Order'),
                            hideBreadcrumb: true,
                            showBottomMessage: true,
                            modules: [
                                QuoteToSalesOrderWizardModuleQuoteDetails,
                                [
                                    OrderWizardModuleCartSummary,
                                    {
                                        container: '#wizard-step-content-right',
                                        warningMessage: Utils.translate(
                                            'Total may include handling costs not displayed in the summary breakdown'
                                        )
                                    }
                                ],
                                [
                                    OrderWizardModuleTermsAndConditions,
                                    {
                                        container: '#wizard-step-content-right',
                                        showWrapper: true,
                                        wrapperClass:
                                            'order-wizard-termsandconditions-module-top-summary'
                                    }
                                ],
                                [
                                    OrderWizardModuleTermsAndConditions,
                                    {
                                        container: '#wizard-step-content-right',
                                        showWrapper: true,
                                        wrapperClass:
                                            'order-wizard-termsandconditions-module-bottom'
                                    }
                                ],
                                [
                                    OrderWizardModuleSubmitButton,
                                    {
                                        container: '#wizard-step-content-right',
                                        showWrapper: true,
                                        wrapperClass: 'order-wizard-submitbutton-container'
                                    }
                                ],
                                [
                                    QuoteToSalesOrderWizardModulePaymentMethodSelector,
                                    {
                                        record_type: 'salesorder',
                                        modules: [
                                            {
                                                classModule: OrderWizardModulePaymentMethodCreditcard,
                                                name: Utils.translate('Credit / Debit Card'),
                                                type: 'creditcard',
                                                options: {}
                                            },
                                            {
                                                classModule: OrderWizardModulePaymentMethodInvoice,
                                                name: Utils.translate('Invoice'),
                                                type: 'invoice',
                                                options: {}
                                            }
                                        ]
                                    }
                                ],
                                [
                                    OrderWizardModuleAddressBilling,
                                    {
                                        title: Utils.translate('Billing Address')
                                    }
                                ],
                                [
                                    OrderWizardModuleShowShipments,
                                    {
                                        hide_edit_cart_button: true
                                    }
                                ],
                                [
                                    OrderWizardModuleTermsAndConditions,
                                    {
                                        showWrapper: true,
                                        wrapperClass:
                                            'order-wizard-termsandconditions-module-default'
                                    }
                                ]
                            ],
                            save: function() {
                                const first_module_instance: any = _.first(this.moduleInstances);
                                first_module_instance.trigger(
                                    'change_label_continue',
                                    Utils.translate('Processing...')
                                );

                                const self = this;
                                const submit_opreation = this.wizard.model.submit();

                                submit_opreation.always(function() {
                                    first_module_instance.trigger(
                                        'change_label_continue',
                                        Utils.translate('Placed Order')
                                    );
                                });

                                return submit_opreation;
                            }
                        }
                    ]
                },
                {
                    steps: [
                        {
                            url: 'quotetosalesorder-confirmation',
                            hideContinueButton: true,
                            name: Utils.translate('Thank you'),
                            hideBackButton: true,
                            hideBreadcrumb: true,
                            headerView: HeaderView,
                            modules: [
                                [
                                    OrderWizardModuleCartSummary,
                                    {
                                        container: '#wizard-step-content-right',
                                        warningMessage: Utils.translate(
                                            'Total may include handling costs not displayed in the summary breakdown'
                                        )
                                    }
                                ],
                                QuoteToSalesOrderWizardModuleConfirmation,
                                QuoteToSalesOrderWizardModuleQuoteDetails,
                                [OrderWizardModuleShowPayments],
                                [
                                    OrderWizardModuleShowShipments,
                                    {
                                        hide_edit_cart_button: true,
                                        hide_edit_address_button: true
                                    }
                                ]
                            ]
                        }
                    ]
                }
            ]
        };

        return quotesToSalesOrderWizard;
    };
}

export = MyAccountConfiguration;
