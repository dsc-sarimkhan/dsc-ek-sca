/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Address.Details.View"/>

import * as _ from 'underscore';
import '../../Utilities/JavaScript/Utils';
import * as address_tpl from 'address_details.tpl';

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');
import Configuration = require('../../Utilities/JavaScript/SC.Configuration');

// @class Address.View @extend Backbone.View
const AddressDetailsView: any = BackboneView.extend({
    // @property {Function} template
    template: address_tpl,

    // @property {Object} attributes
    attributes: {
        class: 'AddressDetailsView'
    },

    // @method initialize Attach to any change on the model and make a render on this changes
    // @return {Void}
    initialize: function() {
        this.model.on('sync', _.bind(this.render, this));
    },

    destroy: function destroy() {
        this.model.off('sync', this);
        return this._destroy();
    },

    // @method getContext @return Address.View.Context
    getContext: function() {
        const label = this.model.get('label');
        const company =
            Configuration.get('siteSettings.registration.displaycompanyfield') === 'T'
                ? this.model.get('company')
                : null;
        const fullname = this.model.get('fullname');
        const countries = Configuration.get('siteSettings.countries', []);
        const country_object = countries[this.model.get('country')];
        const country = country_object ? country_object.name : this.model.get('country');
        const state_object = country_object && country_object.states ? <any>_.findWhere(
                      countries[this.model.get('country')].states,
                      {
                          code: this.model.get('state')
                      }
                  ) : null;
        const state = state_object ? state_object.name : this.model.get('state');
        const invalidAttributes = this.model.getInvalidAttributes() || [];

        // @class Address.View.Context
        return {
            // @property {Address.Model} model
            model: this.model,
            // @property {String} internalid
            internalid: this.model.get('internalid'),
            // @property {Boolean} isManageOptionsSpecified
            isManageOptionsSpecified: !!this.options.manage,
            // @property {String} manageOption
            manageOption: this.options.manage,
            // @property {Boolean} showMultiSelect
            showMultiSelect: this.options.showMultiSelect,
            // @property {Boolean} isAddressCheck
            isAddressCheck: !!this.model.get('check'),
            // @property {String} title
            title: label || company || fullname,
            // @property {Boolean} showCompanyAndFullName
            showCompanyAndFullName: !!(label && company),
            // @property {String} company
            company: company,
            // @property {String} fullname
            fullname: fullname,
            // @property {Boolean} showFullNameOnly
            showFullNameOnly: !!(label ? !company : company),
            // @property {String} addressLine1
            addressLine1: this.model.get('addr1'),
            // @property {Boolean} showAddressLine1
            showAddressLine1: !!this.model.get('addr2'),
            // @property {String} addressLine2
            addressLine2: this.model.get('addr2'),
            // @property {String} city
            city: this.model.get('city'),
            // @property {Boolean} showState
            showState: !!this.model.get('state'),
            // @property {String} state
            state: state,
            // @property {String} zip
            zip: this.model.get('zip'),
            // @property {String} country
            country: country,
            // @property {String} phone
            phone: this.model.get('phone'),
            // @property {Boolean} showDefaultLabels
            showDefaultLabels: !this.options.hideDefaults,
            // @property {Boolean} isDefaultShippingAddress
            isDefaultShippingAddress: this.model.get('defaultshipping') === 'T',
            // @property {Boolean} isDefaultBillingAddress
            isDefaultBillingAddress: this.model.get('defaultbilling') === 'T',
            // @property {Boolean} showSelectionButton
            showSelectionButton: !!this.options.showSelect,
            // @property {Boolean} isASelectMessageSpecified
            isASelectMessageSpecified: !!this.options.selectMessage,
            // @property {String} selectMessage
            selectMessage: this.options.selectMessage,
            // @property {Boolean} showActionButtons
            showActionButtons: !this.options.hideActions,
            // @property {Boolean} showChangeButton
            showChangeButton: !!this.options.showChangeButton,
            // @property {Boolean} showRemoveButton
            showRemoveButton: !this.options.hideRemoveButton,
            // @property {Boolean} showError
            showError:
                this.options.showError &&
                this.model.get('isvalid') &&
                this.model.get('isvalid') !== 'T' &&
                invalidAttributes.length,
            // @property {Array<Object>} invalidAttributes
            invalidAttributes: invalidAttributes,
            // @property {Boolean} isInvalidAddressToRemove
            isInvalidAddressToRemove: !!(
                this.options.disableRemoveButton &&
                this.options.disableRemoveButton(this.model.get('internalid'))
            ),
            // @property {Boolean} isSelected
            isSelected:
                this.options.hideSelector ||
                this.model.get('internalid') === this.options.selectedAddressId,
            // @property {Boolean} showSelector
            showSelector: !this.options.hideSelector,
            // @property {Boolean} isNewAddress
            isNewAddress: this.model.get('internalid') < 0
        };
    }
});
export = AddressDetailsView;
