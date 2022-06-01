/// <amd-module name="Cart.PurchasedItems.View"/>

import cart_purchase_items = require('../Templates/cart_purchase_items.tpl')
import * as _ from 'underscore';
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class Cart.PurchasedItems.View @extends Backbone.View
const CartPurchasedItemsView: any = BackboneView.extend({
    template: cart_purchase_items,


    // @method getContext
    getContext: function getContext() {
        const lines=this.model.get('lines');
        var showcompareprice=false;
        if(lines.models.length){
            var cartArr = []
            _.each(lines.models ,function(model:any){
                if(model.get('amount') > model.get('total'))
                {
                    showcompareprice=true;
                }
                else
                {
                    showcompareprice=false;
                }
                cartArr.push({
                    "thumbnail" : model.getThumbnail(),
                    "price":model.getPrice(),
                    "itemname":model.get('item').get('_name'),
                    "fullLink":model.getFullLink({
                        quantity: null,
                        location: null,
                        fulfillmentChoice: null
                    }),
                    "amount_formatted":model.get('amount_formatted'),
                    "totalFormatted":model.get('total_formatted'),
                    "showcompareprice":showcompareprice,
                    "sku":model.getSku(),
                    "itemId":model.get('item').get('itemid'),
                    "free_gift":model.get('free_gift')

                })
            });
        }
        return {
            cartItem:cartArr
        };
    }
});

export = CartPurchasedItemsView;