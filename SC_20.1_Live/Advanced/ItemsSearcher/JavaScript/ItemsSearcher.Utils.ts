/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ItemsSearcher.Utils"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import Configuration = require('../../SCA/JavaScript/SC.Configuration');

// @class ItemsSearcher.Utils
export = {
    // @method formatKeywords format a search query string according to configuration.js (searchPrefs)
    // @param {String} keywords @return {String} the formatted keywords
    // @static
    // @return {String}
    formatKeywords: function(keywords) {
        const keywordFormatter = Utils.getPathFromObject(
            Configuration,
            'searchPrefs.keywordsFormatter'
        );

        if (keywordFormatter && _.isFunction(keywordFormatter)) {
            keywords = keywordFormatter(keywords);
            const maxLength = Utils.getPathFromObject(
                Configuration,
                'searchPrefs.maxLength',
                99999
            );
            if (keywords.length > maxLength) {
                keywords = keywords.substring(0, maxLength);
            }
        }

        return keywords;
    }
};
