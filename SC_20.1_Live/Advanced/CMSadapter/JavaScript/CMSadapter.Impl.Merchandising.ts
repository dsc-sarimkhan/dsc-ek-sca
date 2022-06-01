/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CMSadapter.Impl.Merchandising"/>

import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

/*

@module CMSadapter

@class CMSadapter.Impl.Merchandising
*/

function AdapterMerchandising(application, CMS) {
    this.CMS = CMS;
    this.application = application;
    this.listenForCMS();
}

AdapterMerchandising.prototype.listenForCMS = jQuery.noop;

export = AdapterMerchandising;
