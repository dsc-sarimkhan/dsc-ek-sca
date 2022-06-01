/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductDetails.Information.View"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import * as product_details_information_tpl from 'product_details_information.tpl';

import Configuration = require('../../../Commons/Utilities/JavaScript/SC.Configuration');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');
import $ = require('../../../Commons/Core/JavaScript/jQuery');

// @class ProductDetails.Information.View @extends Backbone.View
const ProductDetailsInformationView: any = BackboneView.extend({
    template: product_details_information_tpl,

    events: {
        'click [data-action="show-more"]': 'showMore'
    },
    // @method initialize Override default method to allow passing pre-calculated details
    // @param {ProductDetails.Information.View.InitializationOptions} options
    // @return {Void}
    initialize: function initialize() {
        BackboneView.prototype.initialize.apply(this, arguments);
        this.details = this.options.details;
        Backbone.on('resizeView', function (event) {
            $('[data-action="sc-pusher-dismiss"]').click();
            return true;
        });
    },

    render: function () {
        this.details = this.details || this.computeDetailsArea();

        this._render();
    },

    destroy: function () {
        this._destroy();
        this.off('resizeView');
    },

    // @method computeDetailsArea
    // Process what you have configured in itemDetails as item details.
    // In the PDP extra information can be shown based on the itemDetails property in the Shopping.Configuration.
    // These are extra field extracted from the item model
    // @return {Array<ProductDetails.Information.DataContainer>}
    computeDetailsArea: function () {
        const self = this;
        const details = [];
        _.each(Configuration.get('productDetailsInformation', []), function (item_information: any) {
            let content = '';
            if (item_information.contentFromKey) {
                content = self.model.get('item').get(item_information.contentFromKey);
            }
            if (item_information.itemprop.toLowerCase() == 'attachments') {
                // get store attachments
                jQuery.ajax({
                    url: Utils.getAbsoluteUrl('services/StoreAttachment.Service.ss') + '?itemId=' + self.model.get('item').id,
                    type: 'get',
                    async: false,
                    success: function (data) {
                        data = _.map(data, function (attachment) {
                            attachment['file_url'] = location.origin + attachment['file_url'];
                            return attachment;
                        });
                        content = data.length > 0 ? data : "No Data";
                    }
                });
                //-End-
            }
            //DSC Customization
            if (item_information.itemprop.toLowerCase() == 'specification') {
                content ="<div class='dsc-product-specification'>";
                if (self.model.get('item').get('storedescription')) //if(self.model.get('item').get('custitem_item_length_mm')
                // && self.model.get('item').get('custitem_item_width_mm')
                // && self.model.get('item').get('custitem_item_height_mm')){
                //     content += self.model.get('item').get('custitem_item_length_mm')+"mm x "+self.model.get('item').get('custitem_item_width_mm')+"mm x "+self.model.get('item').get('custitem_item_height_mm')+"mm (LxWxH)";
                {
                    content += self.model.get('item').get('storedescription');
                } else {
                    content += "<b>External Dimension: </b> N/A ";
                }
                content += "<br><b>Weight: </b>";
                if (self.model.get('item').get('custitem_ek_item_weight')) {
                    content += self.model.get('item').get('custitem_ek_item_weight') + " KG";
                } else {
                    content += "N/A";
                }
                content += "<br><b>Capacity: </b>";
                if (self.model.get('item').get('custitem_item_capacity')) {
                    content += self.model.get('item').get('custitem_item_capacity');
                } else {
                    content += "N/A";
                }
                content += "<br><b>Insulation Thickness: </b>";
                if (self.model.get('item').get('custitem_dsc_insulation_thickness')) {
                    content += self.model.get('item').get('custitem_dsc_insulation_thickness')+ " mm";
                } else {
                    content += "N/A";
                }
                content += "<br><b>Cooling Zones: </b>";
                if (self.model.get('item').get('custitem_item_cooling_zones')) {
                    content += self.model.get('item').get('custitem_item_cooling_zones');
                } else {
                    content += "N/A";
                }
                content += "<br><b>Material: </b>";
                if (self.model.get('item').get('custitem_item_material')) {
                    content += self.model.get('item').get('custitem_item_material');
                } else {
                    content += "N/A";
                }
                content += "<br><b>Warranty: </b>";
                if (self.model.get('item').get('custitem_item_warranty')) {
                    content += self.model.get('item').get('custitem_item_warranty');
                } else {
                    content += "N/A";
                }
                content += "</div>";
            }

            if (!content) {
                content = "No Data";
            }
            if (content && $.trim(content)){
               
                //DSC added to handle the attachments
                content = (item_information.itemprop.toLowerCase() == 'attachments' && content == 'No Data') ? "" : content;
                
                        details.push({
                            // @property {String} name
                            name: item_information.name,
                            // @property {String} content Any string and event valid HTML is allowed
                            content: content,
                            // @property {String} itemprop
                            itemprop: item_information.itemprop
                        });
                    }
                // @class ProductDetails.Information.View

        });

        return details;
    },

    // @method showMore Toggle the content of an options, and change the label Show Less and Show More by adding a class
    // @return {Void}
    showMore: function () {
        this.$('[data-type="information-content"]').toggleClass('show');
    },

    getContext: function () {
        return {
            // @property {Boolean} showInformation
            showInformation: this.details.length > 0,
            // @property {Boolean} showHeader
            showHeader: this.details.length < 2,
            // @property {Array<ProductDetails.Information.DataContainer>} details
            details: this.details,
            // @property {Boolean} isNotPageGenerator
            isNotPageGenerator: !SC.isPageGenerator()
        };
    }
});

export = ProductDetailsInformationView;

// @class ProductDetails.Information.View.InitializationOptions
// @property {Array<ProductDetails.Information.DataContainer>?} details
// @property {Product.Model} model
//