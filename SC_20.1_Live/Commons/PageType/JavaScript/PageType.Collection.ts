/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="PageType.Collection"/>

import { PageTypeModel } from './PageType.Model';

import * as Utils from '../../Utilities/JavaScript/Utils';

import Backbone = require('../../Utilities/JavaScript/backbone.custom');

export const PageTypeCollection = Backbone.Collection.extend({
    cacheSupport: false,
    url: Utils.getAbsoluteUrl('services/PageType.Service.ss'),
    model: PageTypeModel,
    parse: function(data) {
        return data.pageTypes;
    }
});
