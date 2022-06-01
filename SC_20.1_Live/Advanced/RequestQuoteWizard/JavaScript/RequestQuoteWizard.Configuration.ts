/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="RequestQuoteWizard.Configuration"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import OrderWizardModuleCartItems = require('../../OrderWizard.Module.CartItems/JavaScript/OrderWizard.Module.CartItems');
import OrderWizardModuleShowShipments = require('../../OrderWizard.Module.Shipmethod/JavaScript/OrderWizard.Module.ShowShipments');
import RequestQuoteWizardModuleHeader = require('./RequestQuoteWizard.Module.Header');
import RequestQuoteWizardModuleMessage = require('./RequestQuoteWizard.Module.Message');
import RequestQuoteWizardModuleQuickAdd = require('./RequestQuoteWizard.Module.QuickAdd');
import RequestQuoteWizardModuleComments = require('./RequestQuoteWizard.Module.Comments');
import RequestQuoteWizardModuleItems = require('./RequestQuoteWizard.Module.Items');
import RequestQuoteWizardModuleConfirmation = require('./RequestQuoteWizard.Module.Confirmation');
import OrderWizardModuleTitle = require('../../OrderWizard.Module.Title/JavaScript/OrderWizard.Module.Title');
import OrderWizardModuleAddressShipping = require('../../OrderWizard.Module.Address/JavaScript/OrderWizard.Module.Address.Shipping');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');

// @class RequestQuoteWizard.Configuration Defines the configuration for the Request Quote Wizard module
export = {
    steps: [
        {
            name: '',
            steps: [
                {
                    url: 'request-a-quote',
                    name: Utils.translate('Request a Quote'),
                    hideBackButton: true,
                    hideContinueButton: false,
                    bottomMessage: Configuration.get('quote.requestAQuoteWizardBottomMessage'),
                    continueButtonLabel: Utils.translate('Submit Quote Request'),
                    modules: [
                        RequestQuoteWizardModuleHeader,
                        RequestQuoteWizardModuleMessage,
                        [
                            OrderWizardModuleTitle,
                            {
                                title: Utils.translate('Add Items')
                            }
                        ],
                        RequestQuoteWizardModuleQuickAdd,
                        RequestQuoteWizardModuleItems,
                        [
                            OrderWizardModuleTitle,
                            {
                                title: Utils.translate('Choose a Shipping Address')
                            }
                        ],
                        OrderWizardModuleAddressShipping,
                        [
                            OrderWizardModuleTitle,
                            {
                                title: Utils.translate('Comments')
                            }
                        ],
                        RequestQuoteWizardModuleComments
                    ],
                    save: function() {
                        (<any>_.first(this.moduleInstances)).trigger(
                            'change_label_continue',
                            Utils.translate('Processing...')
                        );

                        const self = this;
                        const submit_opreation = this.wizard.model.submit();

                        submit_opreation.always(function() {
                            (<any>_.first(self.moduleInstances)).trigger(
                                'change_label_continue',
                                Utils.translate('Submit Quote Request')
                            );
                        });

                        return submit_opreation;
                    }
                },
                {
                    url: 'request-a-quote-confirmation',
                    name: Utils.translate('Request a Quote'),
                    hideBackButton: true,
                    hideContinueButton: true,
                    confirmationMessage: Utils.translate(
                        'A sales representative will contact you in <strong>XX business days</strong>.'
                    ),
                    modules: [
                        RequestQuoteWizardModuleConfirmation,
                        [
                            OrderWizardModuleShowShipments,
                            {
                                hide_edit_cart_button: true,
                                hide_edit_address_button: true,
                                hideShippingMethod: true
                            }
                        ],
                        [
                            RequestQuoteWizardModuleComments,
                            {
                                is_read_only: true,
                                title: Utils.translate('Comments'),
                                hide_title: false
                            }
                        ]
                    ]
                }
            ]
        }
    ]
};
