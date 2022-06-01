/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Module.PaymentMethod.Others"/>

import '../../../Commons/Transaction/JavaScript/Transaction.Paymentmethod.Model';
import '../../../Commons/Utilities/JavaScript/backbone.custom';
import * as _ from 'underscore';
import '../../SCA/JavaScript/SC.Configuration';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as order_wizard_paymentmethod_others_module_tpl from 'order_wizard_paymentmethod_others_module.tpl';
import * as backbone_collection_view_cell_tpl from 'backbone_collection_view_cell.tpl';
import * as backbone_collection_view_row_tpl from 'backbone_collection_view_row.tpl';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import OrderWizardModulePaymentMethod = require('./OrderWizard.Module.PaymentMethod');
import OrderWizardModulePaymentMethodExternal = require('./OrderWizard.Module.PaymentMethod.External');
import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../../Commons/Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import GlobalViewsMessageView = require('../../../Commons/GlobalViews/JavaScript/GlobalViews.Message.View');

// @class OrderWizard.Module.PaymentMethod.Others @extends OrderWizard.Module.PaymentMethod
const OrderWizardModulePaymentMethodOthers: any = OrderWizardModulePaymentMethod.extend({
    template: order_wizard_paymentmethod_others_module_tpl,

    events: {
        'click [data-action="select"]': 'setSelectedExternalId'
    },

    initialize: function(options) {
        OrderWizardModulePaymentMethod.prototype.initialize.apply(this, arguments);
        BackboneCompositeView.add(this);
        const self = this;

        _.each(this.options.external, function(module: any) {
            // var ModuleClass = require(module.classModule);
            const ModuleClass = module.classModule;
            module.instance = new ModuleClass(
                _.extend(
                    {
                        wizard: self.wizard,
                        step: self.step,
                        stepGroup: self.stepGroup
                    },
                    module.options
                )
            );
        });
    },

    setSelectedExternalId: function(e) {
        this.options.selectedExternalId = jQuery(e.target).data('id');
        this.options.selector.setModuleByType(this.options.selectedExternalId, true);
        this.render();
    },

    childViews: {
        'Others.List': function() {
            return new BackboneCollectionView({
                collection: this.options.external,
                childView: OrderWizardModulePaymentMethodExternal,
                viewsPerRow:
                    this.itemsPerRow ||
                    (Utils.isDesktopDevice() ? 3 : Utils.isTabletDevice() ? 2 : 1),
                cellTemplate: backbone_collection_view_cell_tpl,
                rowTemplate: backbone_collection_view_row_tpl,
                childViewOptions: this.options
            });
        },
        'External.Description': function() {
            return new GlobalViewsMessageView({
                message: Utils.translate(
                    'You will be <b>redirected to your external payment site</b> after reviewing your order <b>on next step</b>. Once your order is placed, you <b>will return to our site to see the confirmation</b> of your purchase.'
                ),
                type: 'info',
                closable: false
            });
        }
    }
});

export = OrderWizardModulePaymentMethodOthers;
