/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Backbone.CachedModel"/>
/*
It adds the Backbome.CachedModel class. 
It is a Backbone.Model that will return results from memory the second time you call fetch(). It's
just an extension of the original Backbone.Model but it uses the Backbone.cachedSync.

*/
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import BackboneCachedSync = require('./Backbone.CachedSync');
import BackboneModel = require('./Backbone.Model');
Backbone.CachedModel = BackboneModel.extend({
    sync: BackboneCachedSync.cachedSync,
    addToCache: BackboneCachedSync.addToCache,
    isCached: BackboneCachedSync.isCached
});

export = Backbone.CachedModel;
