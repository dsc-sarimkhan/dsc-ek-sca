/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CMSadapter.Impl.Merchandising.v3"/>

import * as _ from 'underscore';

import CMSadapterImplMerchandising = require('./CMSadapter.Impl.Merchandising');

/*
@module CMSadapter

@class CMSadapter.Impl.Merchandising.v3
*/

const CMSadapterImplMerchandising3 = function(application, CMS) {
    CMSadapterImplMerchandising.call(this, application, CMS);
};

CMSadapterImplMerchandising3.prototype = Object.create(CMSadapterImplMerchandising.prototype);

CMSadapterImplMerchandising3.prototype.listenForCMS = function listenForCMS() {
    // CMS listeners - CMS tells us to do something, could fire anytime.
    const self = this;

    self.CMS.on('cart:items:get', function(promise) {
        const cart = self.application.getComponent('Cart');
        const linesId = [];

        if (cart) {
            cart.getLines().then(function(lines) {
                _.each(lines, function(line: any) {
                    if (line.item && line.item.internalid) {
                        linesId.push(line.item.internalid);
                    }
                });

                promise.resolve(linesId);
            });
        } else {
            promise.resolve();
        }
    });

    self.CMS.on('page:items:get', function(promise) {
        const pdp = self.application.getComponent('PDP');
        const linesId = [];

        if (pdp) {
            const product = pdp.getItemInfo();

            if (product && product.item && product.item.internalid) {
                linesId.push(product.item.internalid);
            }
        }

        promise.resolve(linesId);
    });
};

export = CMSadapterImplMerchandising3;
