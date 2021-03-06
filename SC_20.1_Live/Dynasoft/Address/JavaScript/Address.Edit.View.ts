/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Address
/// <amd-module name="Address.Edit.View"/>

import * as _ from 'underscore';

import * as address_edit_tpl from 'address_edit.tpl';
import { Loggers } from '../../../Commons/Loggers/JavaScript/Loggers';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import AddressEditFieldView = require('../JavaScript/Address.Edit.Fields.View');
import BackboneFormView = require('../../../Commons/Backbone.FormView/JavaScript/Backbone.FormView');
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import AddressModel = require('../../Address/JavaScript/Address.Model');
import Configuration = require('../../../Commons/Utilities/JavaScript/SC.Configuration');
import { validateAddress } from '../../DSCUtilities/JavaScript/DSCUtilities';

// @class Address.Edit.View @extend Backbone.View
const AddressEditView: any = BackboneView.extend({
    template: address_edit_tpl,

    attributes: {
        id: 'AddressEdit',
        class: 'AddressListView'
    },

    events: {
        'submit form': 'saveForm',
        'change [name="zip"]': 'validateAddress',
        'change [name="state"]': 'validateAddress',
        'change [name="city"]': 'validateAddress',
    },

    bindings: {
        '[name="fullname"]': 'fullname',
        '[name="company"]': 'company',
        '[name="addr1"]': 'addr1',
        '[name="city"]': 'city',
        '[name="country"]': 'country',
        '[name="zip"]': 'zip',
        '[name="phone"]': 'phone'
    },

    initialize: function(options: any) {
        this.profileModel = ProfileModel.getInstance();
        this.collection = options.collection || this.profileModel.get('addresses');
        this.manage = options.manage;
        this.application = options.application;

        const id =
            (options.routerArguments &&
                options.routerArguments.length &&
                options.routerArguments[0]) ||
            '';

        if (id && id !== 'new') {
            this.model = this.collection.get(id);

            this.model.on(
                'reset destroy change add',
                function() {
                    if (this.inModal && this.$containerModal) {
                        this.$containerModal
                            .removeClass('fade')
                            .modal('hide')
                            .data('bs.modal', null);
                        this.destroy();
                    } else {
                        Backbone.history.navigate('#addressbook', { trigger: true });
                    }
                },
                this
            );
        } else if (options.model) {
            this.model = options.model;
        } else {
            this.model = new AddressModel();

            this.model.on(
                'change',
                function(model) {
                    this.collection.add(model);

                    if (this.inModal && this.$containerModal) {
                        this.$containerModal
                            .removeClass('fade')
                            .modal('hide')
                            .data('bs.modal', null);
                        this.destroy();
                    } else {
                        Backbone.history.navigate('#addressbook', { trigger: true });
                    }
                },
                this
            );
        }

        const addNewAddresLabel = Utils.translate('Add New Address');
        const editAddressLabel = Utils.translate('Edit Address');
        this.title = this.model.isNew() ? addNewAddresLabel : editAddressLabel;
        this.page_header = this.title;
        this.countries = Configuration.get('siteSettings.countries');
        this.selectedCountry =
            this.model.get('country') || Configuration.get('siteSettings.defaultshipcountry');

        if (!this.selectedCountry && _.size(this.countries) === 1) {
            this.selectedCountry = _.first(_.keys(this.countries));
        }

        if (this.selectedCountry) {
            this.model.set({ country: this.selectedCountry }, { silent: true });
        }

        BackboneFormView.add(this);

        this.saveForm = function saveForm() {
            const loggers = Loggers.getLogger();
            const actionId = loggers.start('Save Address');

            const promise = BackboneFormView.saveForm.apply(this, arguments);

            if (promise) {
                promise.done(() => {
                    loggers.end(actionId, {
                        operationIds: this.model.getOperationIds(),
                        status: 'success'
                    });
                });
            }

            return promise;
        };
    },

    //DSC-Custom address validation (DSS-211)
    validateAddress: function(){
        jQuery(".address-edit-form-button-submit").prop('disabled', true);
        jQuery("#address-error").remove(); //remove error block

        var zip = jQuery("[name='zip']").val();
        var stateName = jQuery("[name='state']").val();
        var city = jQuery("[name='city']").val();

        if(!zip || !city){return;}

        validateAddress(zip, city, (cityNames, state) => {
            var errorMessage = "Address is not valid. Enter Valid Zip Code.";
            var isValid = true;

            if(stateName === "" || _.isEmpty(cityNames)){
                isValid = false;
            }else{
                //check for city
                if(cityNames.indexOf(city) === -1){
                    isValid = false;
                    errorMessage = "City name is not valid. Suggested: "+cityNames.join(', ');
                }
                //end

                if(stateName !== state.short_name){
                    isValid = false;
                    errorMessage = "State name is not valid. Suggested: "+state.long_name;
                }
            }

            var errorBlockHTML = "<p id='address-error' class='stock-message product-line-stock-msg-out' style='background-color: red !important;'>"+errorMessage+"</p>";
            if(isValid){
                jQuery(".address-edit-form-button-submit").prop('disabled', false);
                jQuery(".order-wizard-step-button-continue").prop('disabled', false);
            }else{
                console.log('errorMessage address edit',errorMessage)
                jQuery("#address-module-form-placeholder").prepend("<div>"+errorBlockHTML+"</div>");
                jQuery(".address-edit-footer").prepend("<div>"+errorBlockHTML+"</div>");
            }
        });
    },//END: DSC-Custom address validation (DSS-211)

    destroy: function destroy() {
        this.model.off(null, null, this);

        this._destroy();
    },

    beforeShowContent: function beforeShowContent() {
        const promise = jQuery.Deferred();

        if (this.profileModel.get('isLoggedIn') !== 'T') {
            promise.reject();
            this.application.getLayout().notFound();
        } else {
            promise.resolve();
        }

        return promise;
    },

    // @method getSelectedMenu
    getSelectedMenu: function() {
        return 'addressbook';
    },

    // @method getBreadcrumbPages
    getBreadcrumbPages: function() {
        return [
            {
                text: Utils.translate('Address Book'),
                href: '/addressbook'
            },
            {
                text: this.title,
                href: '/addressbook/new'
            }
        ];
    },

    render: function() {
        BackboneView.prototype.render.apply(this, arguments);

        this.$('[rel="tooltip"]')
            .tooltip({
                placement: 'right'
            })
            .on('hide', function(e: any) {
                e.preventDefault();
                jQuery(e.target)
                    .next('.tooltip')
                    .hide();
            });
    },

    childViews: {
        'Address.Edit.Fields': function() {
            return new AddressEditFieldView({
                model: this.model,
                countries: this.countries,
                selectedCountry: this.selectedCountry,
                hideDefaults: Configuration.get('currentTouchpoint') !== 'customercenter',
                application: this.options.application,
                manage: this.manage
            });
        }
    },

    // @method getContext @return Address.Edit.View.Context
    getContext: function() {
        // @class Address.Edit.View.Context
        return {
            // @property {Address.Model} model
            model: this.model,
            // @property {Boolean} isAddressNew
            isAddressNew: this.model.isNew(),
            // @property {Boolean} isCollectionEmpty
            isCollectionEmpty: !this.collection.length,
            // @property {Boolean} isInModal
            isInModal: this.inModal,
            // @property {Boolean} isInModalOrHideHeader
            isInModalOrHideHeader: this.inModal || !!this.options.hideHeader,
            // @property {Boolean} showFooter
            showFooter: !this.options.hideFooter,
            // @property {Boolean} isInModalOrCollectionNotEmpty
            isInModalOrCollectionNotEmpty: !!(this.inModal || this.collection.length)
        };
    }
});

export = AddressEditView;
