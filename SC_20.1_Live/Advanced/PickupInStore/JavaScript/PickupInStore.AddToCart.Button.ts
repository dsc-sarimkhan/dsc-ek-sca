/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PickupInStore.AddToCart.Button"/>

import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import CartAddToCartButtonView = require('./PickupInStore.AddToCart.Button');

const PickupInStoreAddToCartButton: any = function() {
    if (Configuration.get('siteSettings.isPickupInStoreEnabled')) {
        const original_add_to_cart_fn = (<any>CartAddToCartButtonView).prototype.addToCart;

        (<any>CartAddToCartButtonView).prototype.addToCart = function() {
            if (
                !this.model.getItem().get('_isstorepickupallowed') &&
                this.model.get('fulfillmentChoice') === 'pickup'
            ) {
                this.model.set('fulfillmentChoice', 'ship');
            }

            return original_add_to_cart_fn.apply(this, arguments);
        };
    }
};

export = PickupInStoreAddToCartButton;
