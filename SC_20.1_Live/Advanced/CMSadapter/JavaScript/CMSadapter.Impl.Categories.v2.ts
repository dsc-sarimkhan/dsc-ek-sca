/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CMSadapter.Impl.Categories.v2"/>

import CMSadapterImplCategories = require('./CMSadapter.Impl.Categories');
/*
@module CMSadapter

@class CMSadapter.Impl.Categories.v2
*/

const CMSadapterImplCategories2 = function(application, CMS) {
    CMSadapterImplCategories.call(this, application, CMS);
};

CMSadapterImplCategories2.prototype = Object.create(CMSadapterImplCategories.prototype);

CMSadapterImplCategories2.prototype.listenForCMS = function listenForCMS() {
    // CMS listeners - CMS tells us to do something, could fire anytime.
    const self = this;

    // Categories
    self.CMS.on('adapter:category:add', function(data, callback) {
        self.showCategory(data.category, callback);
    });

    self.CMS.on('adapter:category:item:update', function(_data, callback) {
        callback();
    });

    self.CMS.on('adapter:category:update', function(data, callback) {
        self.updateCategory(data, self.application, callback);
    });

    self.CMS.on('adapter:category:hierarchy:change', function(_data, callback) {
        callback();
    });

    self.CMS.on('adapter:category:remove', function(_data, callback) {
        self.removeCategory(callback);
    });

    self.CMS.on('adapter:category:reload', function(_data, callback) {
        callback();
    });

    self.CMS.on('adapter:category:navigate', function(data, callback) {
        self.navigate(data, callback);
    });

    self.CMS.on('adapter:get:items', function(filters) {
        self.getItems(filters, function(items) {
            self.CMS.trigger('adapter:got:items', items);
        });
    });
};

export = CMSadapterImplCategories2;
