/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CMSadapter.Impl.Merchandising.v2"/>

import * as _ from 'underscore';

import CMSadapterImplMerchandising = require('./CMSadapter.Impl.Merchandising');

/*

@module CMSadapter

@class CMSadapter.Impl.Merchandising.v2
*/

const CMSadapterImplMerchandising2 = function(application, CMS) {
    CMSadapterImplMerchandising.call(this, application, CMS);
};

CMSadapterImplMerchandising2.prototype = Object.create(CMSadapterImplMerchandising.prototype);

CMSadapterImplMerchandising2.prototype.listenForCMS = function listenForCMS() {
    // CMS listeners - CMS tells us to do something, could fire anytime.
    const self = this;

    self.CMS.on('adapter:get:cart:items', function() {
        const cart = self.application.getComponent('Cart');
        const linesId = [];

        if (cart) {
            cart.getLines().then(function(lines) {
                _.each(lines, function(line: any) {
                    if (line.item && line.item.internalid) {
                        linesId.push(line.item.internalid);
                    }
                });

                self.CMS.trigger('adapter:got:cart:items', linesId);
            });
        } else {
            self.CMS.trigger('adapter:got:cart:items', linesId);
        }
    });

    self.CMS.on('adapter:get:current:item', function() {
        const pdp = self.application.getComponent('PDP');
        const linesId = [];

        if (pdp) {
            const product = pdp.getItemInfo();

            if (product && product.item && product.item.internalid) {
                linesId.push(product.item.internalid);
            }
        }

        self.CMS.trigger('adapter:got:current:item', linesId);
    });
};

export = CMSadapterImplMerchandising2;
