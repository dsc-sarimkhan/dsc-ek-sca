/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Overview.Home.Standalone.View"/>
// Overview.Home.Standalone.View.js
// --------------------

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as overview_home_standalone_tpl from 'overview_home_standalone.tpl';
import * as notifications_tpl from 'notifications.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import GlobalViewsMessageView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Message.View');
import OverviewBannerView = require('./Overview.Banner.View');
import OverviewProfileView = require('./Overview.Profile.View');
import OverviewPaymentView = require('./Overview.Payment.View');
import OverviewShippingView = require('./Overview.Shipping.View');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');

import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import RecordViewsView = require('../../RecordViews/JavaScript/RecordViews.View');
import Session = require('../../../Commons/Session/JavaScript/Session');
import Handlebars = require('../../../Commons/Utilities/JavaScript/Handlebars');

import InvoicesCollection = require('../../Invoice/JavaScript/Invoice.Collection.js');
import AjaxRequestsKiller = require('../../../Commons/AjaxRequestsKiller/JavaScript/AjaxRequestsKiller');

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

import TransactionListView = require('../../../Commons/Transaction/JavaScript/Transaction.List.View');

// home page view
const OverviewHomeStandaloneView: any = TransactionListView.extend({
    template: overview_home_standalone_tpl,

    title: Utils.translate('Welcome!'),

    attributes: {
        id: 'MyAccountOverviewStandalone',
        class: 'ProfileHomeStandaloneView'
    },

    events: {},

    initialize: function(options) {
        const { application, collection, model } = options;
        this.application = application;
        this.collection = collection || new InvoicesCollection();
        this.model = model || ProfileModel.getInstance();
        this.model.on('change', this.showContent, this);

        this.isSCISIntegrationEnabled = Configuration.get(
            'siteSettings.isSCISIntegrationEnabled',
            false
        );
        this.customerSupportURL = Configuration.get('overview.customerSupportURL');

        this.addresses = this.model.get('addresses');
        this.addresses.on('reset destroy change add', this.showContent, this);

        this.paymentmethods = this.model.get('paymentmethods');
        this.paymentmethods.on('reset destroy change add', this.showContent, this);

        if (!notifications_tpl) {
            if (Session.get('email_change_verification', false)) {
                this.email_change_verification = SC.SESSION.email_change_verification;
                delete SC.SESSION.email_change_verification;
            }
        }
    },

    beforeShowContent: function beforeShowContent() {
        const promise = jQuery.Deferred();
        this.collection
            .fetch({
                data: { page: 'all' },
                error: function(model, jqXhr) {
                    // this will stop the ErrorManagment module to process this error
                    // as we are taking care of it
                    jqXhr.preventDefault = true;
                },
                killerId: AjaxRequestsKiller.getKillerId()
            })
            .always(() => promise.resolve());

        return promise;
    },

    // @method getContext @return Overview.Home.View.Context
    getContext: function() {
        const isSCISIntegrationEnabled = Configuration.get(
            'siteSettings.isSCISIntegrationEnabled',
            false
        );

        // @class Overview.Home.View.Context
        return {
            // @property {Boolean} collectionLengthGreaterThan0
            collectionLengthGreaterThan0: this.collection.length > 0,
            // @property {Boolean} hasCustomerSupportURL
            hasCustomerSupportURL: !!this.customerSupportURL,
            // @property {String} customerSupportURL
            customerSupportURL: this.customerSupportURL,
            // @property {String} firstName
            firstName: this.model.get('firstname') || this.model.get('name') || '',
            // @property {Boolean} isSCISIntegrationEnabled
            isSCISIntegrationEnabled: this.isSCISIntegrationEnabled,
            // @property {Boolean} purchasesPermissions
            purchasesPermissions: isSCISIntegrationEnabled
                ? 'transactions.tranFind.1,transactions.tranPurchases.1'
                : 'transactions.tranFind.1,transactions.tranSalesOrd.1'
        };
    },

    childViews: {
        'Overview.Banner': function() {
            return new OverviewBannerView();
        },
        'Overview.Profile': function() {
            return new OverviewProfileView({ model: this.model });
        },
        'Overview.Payment': function() {
            return new OverviewPaymentView({ model: this.defaultPaymentMethod });
        },
        'Overview.Shipping': function() {
            return new OverviewShippingView({ model: this.defaultShippingAddress });
        },
        'Overview.Messages': function() {
            if (this.email_change_verification) {
                return new GlobalViewsMessageView({
                    message:
                        this.email_change_verification === 'true'
                            ? Utils.translate(
                                  'Your email has been changed successfully to <strong>'
                              ) +
                              this.model.get('email') +
                              '</strong>'
                            : this.email_change_verification,
                    type: this.email_change_verification === 'true' ? 'success' : 'error',
                    closable: true
                });
            }
        },
        'Invoices.Results': function() {
            const self = this;
            let selectedColumns = [];
            if (!Configuration.get().transactionListColumns.enableInvoice) {
                selectedColumns.push({
                    label: 'Date:',
                    type: 'date',
                    name: 'date',
                    id: 'trandate'
                });
                selectedColumns.push({
                    label: 'Amount:',
                    type: 'currency',
                    name: 'amount',
                    id: 'amount_formatted'
                });
                selectedColumns.push({
                    label: 'Status:',
                    type: 'status',
                    name: 'name',
                    id: 'status'
                });
            } else {
                selectedColumns = Configuration.get().transactionListColumns.invoiceOpen;
            }

            const records_collection = new Backbone.Collection(
                this.collection.map(function(invoice) {
                    invoice.status.name =
                        invoice.get('status').internalid === 'open'
                            ? new Handlebars.SafeString(
                                  Utils.translate('<span class="invoice-pending">Pending</span>')
                              )
                            : new Handlebars.SafeString(
                                  Utils.translate('<span class="invoice-paid">Paid</span>')
                              );
                    return new Backbone.Model({
                        touchpoint: 'customercenter',
                        title: new Handlebars.SafeString(
                            Utils.translate(
                                '#<span class="tranid">$(0)</span>',
                                invoice.get('tranid')
                            )
                        ),
                        detailsURL: 'invoices/' + invoice.get('internalid'),
                        id: invoice.get('internalid'),
                        internalid: invoice.get('internalid'),
                        status: invoice.get('status'),
                        columns: self._buildColumns(selectedColumns, invoice)
                    });
                })
            );

            return new BackboneCollectionView({
                childView: RecordViewsView,
                collection: records_collection,
                viewsPerRow: 1,
                childViewOptions: {
                    referrer: 'invoices'
                }
            });
        }
    },

    destroy: function() {
        this.addresses.off(null, null, this);
        this.paymentmethods.off(null, null, this);

        this.offEventsOfDefaults();

        this._destroy();
    },

    offEventsOfDefaults: function() {
        this.defaultPaymentMethod && this.defaultPaymentMethod.off(null, null, this);
        this.defaultShippingAddress && this.defaultShippingAddress.off(null, null, this);
    },

    getSelectedMenu: (): string => 'home',
    getBreadcrumbPages: (): any[] => [],
    showContent: function() {
        // off events of defaults
        this.offEventsOfDefaults();

        // set the defaults
        this.defaultShippingAddress = this.addresses.findWhere({ defaultshipping: 'T' });
        this.defaultPaymentMethod = this.paymentmethods.findWhere({ isdefault: 'T' });

        // on events of defaults
        this.defaultShippingAddress &&
            this.defaultShippingAddress.on('change', this.showContent, this);
        this.defaultPaymentMethod && this.defaultPaymentMethod.on('change', this.showContent, this);

        this.title = this.model.get('firstname')
            ? Utils.translate('Welcome $(0)!', this.model.get('firstname'))
            : this.title;
        return this.application.getLayout().showContent(this);
    }
});

export = OverviewHomeStandaloneView;
