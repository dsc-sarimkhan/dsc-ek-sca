/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Categories.Utils"/>

import * as _ from 'underscore';

import Configuration = require('../../Utilities/JavaScript/SC.Configuration');

// Categories.Utils.js
// -------------
// Utility Class for Categories
const CategoriesUtils = {
    getAdditionalFields: function getAdditionalFields(source, config_path) {
        const additionalFields = {};
        const fields = Configuration.get(config_path, []);

        _.each(fields, function(field: any) {
            additionalFields[field] = source[field];
        });

        return additionalFields;
    }
};

export = CategoriesUtils;
